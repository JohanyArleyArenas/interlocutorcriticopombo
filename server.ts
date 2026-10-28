import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { GoogleGenAI } from '@google/genai';
import { AGENTE } from './src/parametros.ts';
import { AREAS_ICFES, PREGUNTAS, CUADERNILLOS, buscarPregunta, paginasDePregunta, pdfDePagina, precargarCuadernillos, estadoBanco, diagnostico, contenidoDePregunta, contenidoComoTexto, sincronizarCarpeta, estadoSincronizacion } from './icfes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Up limit to 50MB for multiple file uploads
app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));

// Shared Gemini AI instance on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ChatArchivo {
  nombre: string;
  mimeType: string;
  data?: string;   // base64
  texto?: string;  // extracted text for docx, txt, md
  esEjemploClase?: boolean;
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
  archivo?: ChatArchivo;
  archivos?: ChatArchivo[];
}

// ===== Registro de interacciones en Google Sheets (vía Google Forms) =====
// Cada interacción se envía a un formulario oculto vinculado a la hoja
// "Interlocutor Crítico — Registro de interacciones". No requiere Apps Script.
const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSewmTa98Cqs53Arm4BTYFyhhkRCHjZniibXTErhWrVy1SBQwQ/formResponse';
// Debe coincidir con la validación de la pregunta "clave" del formulario.
const FORM_CLAVE = 'pombo-ic-4q8z2m7w';
const FORM_CAMPOS: Record<string, string> = {
  fecha: 'entry.1675284540',
  estudiante: 'entry.1462404239',
  sesion: 'entry.1128055853',
  modo: 'entry.1859855854',
  turno: 'entry.735608089',
  mensaje: 'entry.1908556910',
  adjunto: 'entry.435567498',
  respuesta: 'entry.1317219066',
  fuentes: 'entry.1848009346',
  modelo: 'entry.777390068',
  segundos: 'entry.1135670343',
  clave: 'entry.297468861',
};

function registrarInteraccion(fila: Record<string, unknown>) {
  const datos = new URLSearchParams();
  for (const [campo, entry] of Object.entries(FORM_CAMPOS)) {
    const valor = campo === 'clave' ? FORM_CLAVE : fila[campo];
    datos.append(entry, String(valor ?? '').slice(0, 45000));
  }
  fetch(FORM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: datos.toString(),
  })
    .then((r) => {
      if (!r.ok) console.log(`[Registro] Google Forms respondió ${r.status}`);
    })
    .catch((err) => console.log('[Registro] No se pudo guardar la interacción:', err?.message));
}

// Modelos del plan pago: Flash con MEDIUM o LOW según la tarea y Flash Lite para pistas rápidas y como respaldo
const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const FLASH_PAUSA_MS = 2 * 60 * 1000; // 2 minutos
let flashLentoHasta = 0;

// Tiempos recientes de la IA (para el docente: /api/diagnostico-ia)
const tiemposIA: any[] = [];
const registrarTiempo = (t: any) => {
  tiemposIA.push({ ...t, hora: new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }) });
  if (tiemposIA.length > 40) tiemposIA.shift();
};

precargarCuadernillos();

// ===== Límite de uso (protege el costo de la API) =====
// Por sesión de estudiante y, de forma más generosa, por red (todo un salón comparte la misma IP).
const usoReciente = new Map<string, number[]>();
function superaLimite(clave: string, porMinuto: number, porHora: number): boolean {
  const ahora = Date.now();
  const lista = (usoReciente.get(clave) || []).filter((t) => ahora - t < 60 * 60 * 1000);
  const ultimoMinuto = lista.filter((t) => ahora - t < 60 * 1000).length;
  if (ultimoMinuto >= porMinuto || lista.length >= porHora) {
    usoReciente.set(clave, lista);
    return true;
  }
  lista.push(ahora);
  usoReciente.set(clave, lista);
  if (usoReciente.size > 10000) usoReciente.clear();
  return false;
}

const MIMES_PERMITIDOS = /^(application\/pdf|image\/(png|jpe?g|webp)|text\/plain|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/i;
const EXT_PERMITIDAS = /\.(jpe?g|png|webp|pdf|txt|docx)$/i;
// 10 MB en binario equivale aproximadamente a 13,98 MB en base64 (+ prefijo data URL)
const MAX_BASE64_10MB = Math.ceil((10 * 1024 * 1024 * 4) / 3) + 512;

app.post('/api/chat', async (req, res) => {
  try {
    const tInicio = Date.now();
    const { modeKey, messages, estudiante, sesion } = req.body as {
      estudiante?: string;
      sesion?: string;
      modeKey?: string;
      messages?: ChatMessagePayload[];
    };

    if (!modeKey || !AGENTE.modos[modeKey]) {
      return res.status(400).json({ error: 'Modo no válido o no especificado.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'El historial de mensajes está vacío.' });
    }
    // ===== Validación de la solicitud (seguridad y costo) =====
    const ip = String(req.ip || req.headers['x-forwarded-for'] || 'desconocida').split(',')[0].trim();
    const claveSesion = 'sesion:' + String(sesion || ip).slice(0, 60);
    if (superaLimite('ip:' + ip, 120, 2000) || superaLimite(claveSesion, 8, 50)) {
      return res.status(429).json({ error: 'Vas muy rápido. Espera un minuto antes de enviar otro mensaje.' });
    }
    if (messages.length > 150) {
      return res.status(400).json({ error: 'La conversación es demasiado larga. Inicia un chat nuevo.' });
    }
    for (const m of messages as any[]) {
      if (!m || (m.role !== 'user' && m.role !== 'model') || (m.text != null && typeof m.text !== 'string')) {
        return res.status(400).json({ error: 'Formato de mensaje no válido.' });
      }
      if ((m.text || '').length > 12000) {
        return res.status(400).json({ error: 'Tu mensaje es demasiado largo. Divídelo en partes más cortas.' });
      }
      const listaArchivosMsg: ChatArchivo[] = Array.isArray(m.archivos) && m.archivos.length > 0
        ? m.archivos
        : m.archivo
        ? [m.archivo]
        : [];
      if (listaArchivosMsg.length > 15) {
        return res.status(400).json({ error: 'Puedes subir hasta 15 archivos por mensaje.' });
      }
      for (const a of listaArchivosMsg) {
        if (!a) continue;
        const nombreArch = String(a.nombre || '');
        const mimeArch = String(a.mimeType || '');
        if (!MIMES_PERMITIDOS.test(mimeArch) && !EXT_PERMITIDAS.test(nombreArch)) {
          return res.status(400).json({
            error: 'Formato de archivo no válido. Solo puedes subir imágenes (JPG, PNG, WEBP), PDF, texto (.txt) o Word (.docx).',
          });
        }
        const cleanData = a.data ? String(a.data).replace(/^data:[^;]+;base64,/, '') : '';
        const bytesEstimados = cleanData ? Math.floor((cleanData.length * 3) / 4) : 0;
        if (
          (cleanData && (cleanData.length > MAX_BASE64_10MB || bytesEstimados > 10 * 1024 * 1024)) ||
          (a.texto && String(a.texto).length > 10 * 1024 * 1024)
        ) {
          return res.status(400).json({ error: `El archivo «${nombreArch || 'adjunto'}» supera el límite de 10 MB.` });
        }
      }
    }

    const modo = AGENTE.modos[modeKey];

    // Memoria de la conversación: se envían el inicio (saludo, primer mensaje y primera
    // respuesta, donde suele quedar la ruta de pasos) y los mensajes más recientes.
    // De la parte omitida se conservan las preguntas ya hechas, para que no se repitan.
    const VENTANA_RECIENTE = 60;
    let slicedMessages = [...messages];
    let notaMemoria = '';
    if (slicedMessages.length > VENTANA_RECIENTE + 3) {
      const iniciales = slicedMessages.slice(0, 3);
      let recientes = slicedMessages.slice(-VENTANA_RECIENTE);
      if (recientes[0]?.role === 'model') recientes = recientes.slice(1);
      const omitidos = slicedMessages.slice(3, slicedMessages.length - recientes.length);
      const preguntasPrevias = omitidos
        .filter((m) => m.role === 'model')
        .map((m) => {
          const preguntas = String(m.text || '').replace(/\s+/g, ' ').match(/¿[^¿?]{3,300}\?/g);
          return preguntas ? preguntas[preguntas.length - 1] : '';
        })
        .filter(Boolean)
        .slice(-12);
      notaMemoria =
        `\n\nMEMORIA DE ESTA CONVERSACIÓN: por espacio se omitieron ${omitidos.length} mensajes intermedios; ves el inicio (tema y ruta) y los mensajes recientes. Retoma desde el punto actual, sin volver a empezar.` +
        (preguntasPrevias.length
          ? `\nPreguntas que ya le hiciste al estudiante en la parte omitida (no las repitas ni hagas variantes de ellas):\n- ${preguntasPrevias.join('\n- ')}`
          : '');
      slicedMessages = [...iniciales, ...recientes];
    }

    // Format current date in America/Bogota in Spanish
    const fechaHoy = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeZone: 'America/Bogota',
    }).format(new Date());

    const avisoFecha = 'Tu conocimiento de entrenamiento tiene una fecha de corte anterior a hoy. No trates como error, dato futuro, anacronismo ni invención ninguna fecha, persona, cargo, acontecimiento o publicación igual o anterior a la FECHA DE HOY solo porque no la conoces.';
    const fechaLinea =
      modeKey === 'verificar'
        ? `FECHA DE HOY: ${fechaHoy}. ${avisoFecha} Usa la búsqueda de Google para verificar la afirmación con fuentes reales; si no aparece ningún comunicado ni noticia sobre el hecho puntual, dilo y no inventes detalles.`
        : modo.busqueda
        ? `FECHA DE HOY: ${fechaHoy}. ${avisoFecha} IMPORTANTE SOBRE BÚSQUEDA: NO ejecutes googleSearch para conceptos escolares estables (como fotosíntesis, ecuaciones, física, química, gramática o filosofía), ni al pedir la idea inicial del estudiante, ni al analizar la estructura, falacias o sesgos de una tesis. Usa googleSearch únicamente si es indispensable comprobar un dato actual específico.`
        : `FECHA DE HOY: ${fechaHoy}. ${avisoFecha}`;

    // ===== Entrenador Saber 11: pregunta activa, páginas del cuadernillo y clave oficial =====
    let contextoIcfes = '';
    const partesIcfes: any[] = [];
    let registroIcfes = '';
    let resultadoIcfes: { id: string; clave: string; correcta: boolean; area: string } | null = null;
    let razonarIcfes = false; // retroalimentación del entrenador ICFES (accion === 'responder')
    let ligeroIcfes = false; // pistas y conversación del ICFES: gemini-flash-lite-latest con MINIMAL
    if (modeKey === 'icfes') {
      const ic = ((req.body as any)?.icfes || {}) as { id?: string; accion?: string; respuesta?: string };
      const pregunta = buscarPregunta(String(ic.id || ''));
      if (!pregunta) return res.status(400).json({ error: 'Primero elige un área para recibir una pregunta.' });
      const accion = ['pista', 'responder', 'conversar'].includes(String(ic.accion)) ? String(ic.accion) : 'conversar';
      const respuesta = String(ic.respuesta || '').toUpperCase().slice(0, 1);
      if (accion === 'responder' && !pregunta.opciones.includes(respuesta)) {
        return res.status(400).json({ error: 'Elige una de las opciones de respuesta.' });
      }
      const respuestaAnterior = [...(messages as any[])]
        .reverse()
        .find((m) => m?.icfes?.id === pregunta.id && m?.icfes?.accion === 'responder')?.icfes?.respuesta;
      const respuestaEst = accion === 'responder' ? respuesta : String(respuestaAnterior || '').toUpperCase().slice(0, 1);
      const yaRespondio = accion === 'responder' || pregunta.opciones.includes(respuestaEst);
      const area = AREAS_ICFES[pregunta.cuadernillo.area];
      razonarIcfes = accion === 'responder';
      ligeroIcfes = accion === 'pista' || accion === 'conversar';
      let ubic: Awaited<ReturnType<typeof paginasDePregunta>> | null = null;
      let sinFiguras = false;
      try {
        ubic = await paginasDePregunta(pregunta);
        // Solo se adjuntan las páginas que tienen figuras, tablas o fórmulas: el texto ya va transcrito (más rápido)
        const contAdj = await contenidoDePregunta(pregunta).catch(() => null);
        sinFiguras = !!contAdj;
        const paginasRecorte: number[] | null = contAdj
          ? [...new Set([...(contAdj.contexto?.bloques || []), ...contAdj.enunciado, ...(contAdj.opciones || []).flatMap((o: any) => o.bloques), ...(contAdj.recorteOpciones || [])].filter((b: any) => b.tipo === 'recorte').map((b: any) => b.pagina as number))]
          : null;
        for (const idx of paginasRecorte ? paginasRecorte.slice(-3) : ubic.paginas.slice(-3)) {
          const pdf = await pdfDePagina(pregunta.cuadernillo, idx);
          partesIcfes.push({ inlineData: { mimeType: 'application/pdf', data: Buffer.from(pdf).toString('base64') } });
        }
      } catch (e: any) {
        console.log('[ICFES] No se pudieron adjuntar las páginas:', e?.message || e);
      }
      // Texto de la pregunta tal como lo ve el estudiante (lectura, enunciado y opciones)
      let textoPregunta = '';
      try {
        const cont = await contenidoDePregunta(pregunta);
        if (cont) textoPregunta = `El estudiante ve la pregunta así (texto extraído del cuadernillo; las figuras, tablas y fórmulas las ve recortadas tal como están en la página adjunta):\n"""\n${contenidoComoTexto(cont)}\n"""\n`;
      } catch {}
      const examen = pregunta.cuadernillo.examenes[pregunta.examen]?.nombre;
      const ubicTexto =
        ubic && partesIcfes.length
          ? (partesIcfes.length > 1
              ? `Te adjunto ${partesIcfes.length} páginas del cuadernillo: la primera trae el texto o la situación que comparten varias preguntas y la pregunta ${pregunta.numero} está en la última, `
              : `Te adjunto la página del cuadernillo donde está la pregunta ${pregunta.numero}, `) +
            `más o menos al ${Math.round((ubic.y || 0) * 100)} % de la altura de la página. La página puede tener otras preguntas: ocúpate SOLO de la pregunta ${pregunta.numero}${examen ? ` del ${examen}` : ''}.`
          : sinFiguras
              ? 'La pregunta está transcrita completa más abajo, tal como la ve el estudiante (no tiene figuras, tablas ni fórmulas); no necesitas la página del cuadernillo.'
              : 'No pude adjuntar la página de la pregunta: dile al estudiante que en este momento no puedes verla y pídele que intente con otra pregunta.';
      contextoIcfes =
        `\n\nPREGUNTA ACTIVA DEL ENTRENADOR: pregunta ${pregunta.numero}${examen ? ` del ${examen}` : ''} — ${pregunta.cuadernillo.titulo}. Área: ${area?.nombre}. Opciones de respuesta: ${pregunta.opciones.join(', ')}.\n${ubicTexto}\n${textoPregunta}${area?.competencias || ''}\n` +
        (yaRespondio
          ? `CLAVE OFICIAL DEL ICFES: ${pregunta.clave}. Es la respuesta correcta según la tabla de respuestas del cuadernillo: no la discutas ni la cambies. Si tu análisis no coincide con ella, vuelve a leer la pregunta en la página: el error está en tu lectura.` +
            (respuestaEst ? `\nRESPUESTA DEL ESTUDIANTE: ${respuestaEst} (${respuestaEst === pregunta.clave ? 'CORRECTA' : 'INCORRECTA'}).` : '')
          : 'El estudiante TODAVÍA NO HA RESPONDIDO: no reveles cuál opción es la correcta, no la insinúes y no descartes opciones de forma que la delate.') +
        `\nNUMERACIÓN: el estudiante ve esta pregunta con otra numeración (la de su práctica), así que no menciones el número que tiene en el cuadernillo; di «esta pregunta».\nACCIÓN SOLICITADA: ${
          accion === 'responder'
            ? 'B) RETROALIMENTAR LA RESPUESTA (usa la estructura indicada).'
            : accion === 'pista'
            ? 'A) DAR UNA PISTA DE ESTRATEGIA (sin revelar la respuesta).'
            : 'C) CONVERSAR SOBRE ESTA PREGUNTA.'
        }`;
      registroIcfes = `ICFES ${pregunta.id} · ${accion}${respuestaEst ? ` · eligió ${respuestaEst} · clave ${pregunta.clave}` : ''}`;
      if (accion === 'responder') {
        resultadoIcfes = { id: pregunta.id, clave: pregunta.clave, correcta: respuesta === pregunta.clave, area: pregunta.cuadernillo.area };
      }
    }

    const reglaMatematicas = `FÓRMULAS Y MATEMÁTICAS: Para fórmulas, usa siempre la notación $...$ de LaTeX bien formada (sin escapar dobles barras) y $$...$$ para fórmulas en bloque. Cuando sea sencillo, prefiere símbolos Unicode legibles (√76, 7² = 49, ×, ÷) dentro del texto normal.`;

    // Bloque fijo al inicio (sin cambios entre turnos) para aprovechar el caché implícito de Gemini
    const bloqueFijo = `${AGENTE.parametros}

MODO ACTUAL: ${modo.titulo}
${modo.instrucciones}

${reglaMatematicas}

El estudiante ya vio este mensaje inicial tuyo: ${modo.saludo}`;

    // Convert messages to Gemini API format (extrae en el servidor el texto de archivos .docx con mammoth y soporta múltiples archivos)
    const contents = await Promise.all(
      slicedMessages.map(async (msg) => {
        const parts: any[] = [];
        const archivosDeMsg: ChatArchivo[] =
          Array.isArray(msg.archivos) && msg.archivos.length > 0
            ? msg.archivos
            : msg.archivo
            ? [msg.archivo]
            : [];

        for (const arch of archivosDeMsg) {
          if (!arch) continue;
          const { mimeType, data, nombre, esEjemploClase } = arch;
          let textoExtraido = arch.texto;
          const cleanBase64 = data ? data.replace(/^data:[^;]+;base64,/, '') : '';
          const esDocx =
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            /\.docx$/i.test(String(nombre || ''));
          const esTxt = mimeType === 'text/plain' || /\.txt$/i.test(String(nombre || ''));
          const etiquetaTipo = esEjemploClase
            ? `[Ejemplo de clase explicado por el profesor en el salón: ${nombre}]`
            : `[Archivo adjunto: ${nombre}]`;

          // Word (.docx): se extrae el texto en el servidor con mammoth y se envía como texto al modelo
          if (esDocx && cleanBase64) {
            try {
              const buffer = Buffer.from(cleanBase64, 'base64');
              const resultado = await mammoth.extractRawText({ buffer } as any);
              textoExtraido = resultado.value || textoExtraido || '';
              arch.texto = textoExtraido;
            } catch (errDocx: any) {
              console.error('[Archivo DOCX] Error al extraer texto con mammoth:', errDocx?.message || errDocx);
            }
          } else if (esTxt && cleanBase64 && !textoExtraido) {
            textoExtraido = Buffer.from(cleanBase64, 'base64').toString('utf-8');
            arch.texto = textoExtraido;
          }

          // Imágenes (JPG, PNG, WEBP) y PDF se envían a Gemini como inlineData junto con su etiqueta
          if (cleanBase64 && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
            parts.push({ text: etiquetaTipo });
            parts.push({
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            });
          }

          // Texto (.txt) o Word (.docx) extraído
          if (textoExtraido && textoExtraido.trim()) {
            parts.push({
              text: `${etiquetaTipo}\n${textoExtraido}`,
            });
          }
        }

        if (msg.text && msg.text.trim()) {
          parts.push({ text: msg.text });
        }

        if (parts.length === 0) {
          parts.push({ text: '(Adjunto de archivo)' });
        }

        return {
          role: msg.role === 'user' ? 'user' : 'model',
          parts,
        };
      })
    );

    // Entrenador Saber 11: las páginas del cuadernillo acompañan el último mensaje del estudiante
    if (partesIcfes.length) {
      const ultimoUsuario: any = [...contents].reverse().find((c: any) => c.role === 'user');
      if (ultimoUsuario) ultimoUsuario.parts = [...partesIcfes, ...ultimoUsuario.parts];
    }

    // esCuantitativo evalúa solo el último mensaje del estudiante (y, en el tutor, también si hay imagen adjunta)
    // y exige matemática real: números con operadores, ecuaciones con =, unidades con números o símbolos matemáticos.
    const ultimoMsgEst: any = [...slicedMessages].reverse().find((m: any) => m.role === 'user');
    const archivosUltimoEst: ChatArchivo[] =
      Array.isArray(ultimoMsgEst?.archivos) && ultimoMsgEst.archivos.length > 0
        ? ultimoMsgEst.archivos
        : ultimoMsgEst?.archivo
        ? [ultimoMsgEst.archivo]
        : [];
    const textosArchivosUltimo = archivosUltimoEst.map((a) => a?.texto || '').join('\n');
    const textoUltimoEst = `${ultimoMsgEst?.text || ''}\n${textosArchivosUltimo}`.replace(/https?:\/\/\S+/gi, ' ');
    const tieneImagenTutor =
      modeKey === 'tutor' && archivosUltimoEst.some((a) => /^image\/|application\/pdf/i.test(String(a?.mimeType || '')));
    const patronMatematicaReal =
      /\d\s*[+\-*/^×÷<>]\s*[\da-zA-Z(]|\d\s*[a-zA-Z]\s*[+\-*/^=×÷<>]|[a-zA-Z0-9)]\s*=\s*[-+a-zA-Z0-9(√]|\d+(?:[.,]\d+)?\s*(?:m\/s(?:²|\^2)?|km\/h|kg|g\b|mg|mol|cm|mm|km|m\b|s\b|N\b|J\b|W\b|Pa\b|Hz\b|V\b|A\b|Ω|°C|K\b|mL\b|L\b|atm\b)|[√²³π∫∑±]|\\(?:frac|sqrt|cdot|times)/;
    const esCuantitativo =
      modeKey !== 'icfes' && (tieneImagenTutor || patronMatematicaReal.test(textoUltimoEst));

    // Optimización de velocidad: adjuntar googleSearch añade varios segundos de latencia aunque el modelo no busque.
    // Se activa siempre en 'verificar', en 'auditar' a partir del segundo turno (Fase 2/3), o cuando el mensaje
    // menciona verificación externa, noticias, datos actuales, leyes, entidades o fuentes académicas.
    const respuestasModeloPrevias = slicedMessages.filter((m) => m.role === 'model').length;
    const pideDatosActualesOBusqueda =
      /\[Verificación externa\]|\b(202[4-9]|noticia\w*|actual\w*|reciente\w*|hoy|ayer|dane|oms|unesco|ministerio|alcald[ií]a|inv[ií]as|decreto|ley\s+\d|resoluci[oó]n|cifra\w*|estad[ií]stic\w*|estudio\s+de|revista|scielo|redalyc|dialnet|scholar|doi| verifica\w*|comprueba|fuente\w*\s+oficial\w*|seg[uú]n\s+la\s+noticia)\b/i.test(
        textoUltimoEst
      );
    const llevaBusqueda = Boolean(
      modo.busqueda &&
        modeKey !== 'icfes' &&
        modeKey !== 'escrito' &&
        (modeKey === 'verificar' ||
          (modeKey === 'auditar' && respuestasModeloPrevias >= 1) ||
          (modeKey !== 'tutor' && pideDatosActualesOBusqueda) ||
          textoUltimoEst.includes('[Verificación externa]'))
    );
    const tutorConCalculos = modeKey === 'tutor' && esCuantitativo;
    const reclamaContradiccion =
      respuestasModeloPrevias >= 1 &&
      /\b(contradic\w*|contradij\w*|te\s+contradices|contradiciendo|antes\s+dijiste|hab[ií]as\s+dicho|acab(?:as|abas)\s+de\s+decir|dijiste\s+lo\s+contrario|dijiste\s+otra\s+cosa|cambiaste\s+lo\s+que|primero\s+dijiste|no\s+es\s+coherente|incoherente)\b/i.test(
        textoUltimoEst
      );
    // En socratico se usa LOW salvo que el estudiante reclame una contradicción. MEDIUM queda para el tutor con cálculos reales, la retroalimentación del ICFES o auditoría de contradicciones.
    // Cuando una solicitud lleva googleSearch, se usa LOW salvo en el tutor con cálculos.
    const usarMedium = tutorConCalculos || (!llevaBusqueda && (razonarIcfes || reclamaContradiccion));
    const razonar = usarMedium || modeKey === 'tutor' || reclamaContradiccion;
    const temperaturaBase = typeof modo.temperatura === 'number' ? modo.temperatura : 0.7;

    const notaCalculos = esCuantitativo
      ? '\n\nESTA CONVERSACIÓN INCLUYE CÁLCULOS: aplica con especial cuidado las reglas de PRECISIÓN EN MATEMÁTICAS Y CIENCIAS.'
      : '';
    const notaContradiccion = reclamaContradiccion
      ? '\n\nAUDITORÍA DE COHERENCIA (EL ESTUDIANTE SEÑALA UNA CONTRADICCIÓN): Antes de responder, relee palabra por palabra tus propios mensajes anteriores en esta conversación y compáralos con el último. NO niegues la contradicción por inercia ni intentes justificar dos frases incompatibles: si efectivamente dijiste dos cosas opuestas, cambiaste una lista, clasificación, signo, criterio o veredicto, o aprobaste antes algo que luego rechazaste, reconócelo de inmediato con total claridad, cita brevemente qué dijiste antes y qué dijiste después, explica dónde estuvo el cruce y deja establecida una única versión coherente y exacta.'
      : '';

    // Recordatorio que se retira solo (todos los modos menos icfes):
    // Cuenta (a) mensajes del estudiante desde su última [Verificación externa] (o desde el inicio)
    // y (b) total de verificaciones externas en la sesión.
    const mensajesEst = messages.filter((m) => m.role === 'user');
    let totalVerificaciones = 0;
    let mensajesSinVerificar = 0;
    for (const m of mensajesEst) {
      if (String(m.text || '').trim().startsWith('[Verificación externa]')) {
        totalVerificaciones++;
        mensajesSinVerificar = 0;
      } else {
        mensajesSinVerificar++;
      }
    }
    const enviarRecordatorioVerificacion =
      modeKey !== 'icfes' &&
      totalVerificaciones < 2 &&
      mensajesSinVerificar >= 8 &&
      mensajesSinVerificar % 8 === 0;
    const notaRecordatorio = enviarRecordatorioVerificacion
      ? '\n\nRECORDATORIO DE VERIFICACIÓN: al final de esta respuesta, en una sola frase breve y sin regañar, invita al estudiante a comprobar en otra fuente un dato concreto de lo que han visto y a registrarlo con el botón «Lo verifiqué por fuera». Sugiere qué dato y qué tipo de fuente.'
      : '';

    // Bloque fijo al inicio + fecha de hoy y notas variables al final
    const systemInstruction = `${bloqueFijo}\n\n${fechaLinea}${notaCalculos}${notaContradiccion}${notaMemoria}${contextoIcfes}${notaRecordatorio}`;

    const configBase: any = {
      systemInstruction,
      temperature: razonar ? Math.min(temperaturaBase, 0.3) : temperaturaBase,
      // El razonamiento interno también consume tokens de salida: se deja margen para no cortar respuestas
      maxOutputTokens: (typeof modo.maxTokens === 'number' ? modo.maxTokens : 1000) + (usarMedium ? 3000 : 1500),
    };

    if (llevaBusqueda) {
      configBase.tools = [{ googleSearch: {} }];
    }

    // Nivel de razonamiento: MEDIUM solo en el tutor con cálculos reales o en la retroalimentación del ICFES,
    // MINIMAL en pistas y conversación del ICFES, y LOW en todo lo demás (incluido socratico y solicitudes con googleSearch salvo tutor con cálculos).
    const nivelDeseado: 'MINIMAL' | 'LOW' | 'MEDIUM' = ligeroIcfes ? 'MINIMAL' : usarMedium ? 'MEDIUM' : 'LOW';
    const forzarLowPorModelo = new Set<string>();
    const configPara = (nivel: 'MINIMAL' | 'LOW' | 'MEDIUM'): any => ({
      ...configBase,
      thinkingConfig: {
        thinkingLevel: nivel as any,
      },
    });

    // Si gemini-flash-latest falló o se demoró en los últimos 2 minutos, va directo al respaldo gemini-flash-lite-latest sin esperar 12 s
    const flashEnPausa = Date.now() < flashLentoHasta;
    const modelsToTry = ligeroIcfes
      ? ['gemini-flash-lite-latest', 'gemini-flash-latest']
      : flashEnPausa
      ? ['gemini-flash-lite-latest']
      : ['gemini-flash-latest', 'gemini-flash-lite-latest'];
    if (flashEnPausa && !ligeroIcfes) {
      console.log(`[Respaldo directo] gemini-flash-latest en pausa por lentitud/fallo reciente (${Math.ceil((flashLentoHasta - Date.now()) / 1000)} s restantes); usando gemini-flash-lite-latest con LOW`);
    }

    let lastError: any = null;
    let replyText: string | null = null;
    let modeloUsado = modelsToTry[0];
    let fuentes: Array<{ titulo: string; url: string }> = [];
    let had429 = false;
    let detectoIdeaPrevia = false;
    let modoSugerido: string | null = null;

    // Tabla de correspondencia fija entre el nombre visible en la interfaz (y variantes) y el id interno
    const normalizarClaveModo = (s: string): string =>
      String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const TABLA_CORRESPONDENCIA_MODOS: Record<string, string> = {
      socratico: 'socratico',
      'dialogo socratico': 'socratico',
      explorar: 'explorar',
      'guia de investigacion': 'explorar',
      'guia investigacion': 'explorar',
      investigar: 'explorar',
      argumento: 'argumento',
      'taller de argumentos': 'argumento',
      'poner a prueba un argumento': 'argumento',
      verificar: 'verificar',
      'verificar una afirmacion': 'verificar',
      auditar: 'auditar',
      'auditar una respuesta de ia': 'auditar',
      'auditar respuesta de ia': 'auditar',
      tutor: 'tutor',
      'tutor de matematicas fisica y quimica': 'tutor',
      'tutor de matematicas': 'tutor',
      escrito: 'escrito',
      'revisar mi escrito': 'escrito',
      icfes: 'icfes',
      'entrenador saber 11': 'icfes',
      'saber 11': 'icfes',
    };

    const resolverIdModo = (raw: string): string | null => {
      const norm = normalizarClaveModo(raw).replace(/^modo\s+/, '').replace(/^cambiar\s+a(?:l\s+modo)?\s+/, '').trim();
      if (!norm) return null;
      if (TABLA_CORRESPONDENCIA_MODOS[norm]) return TABLA_CORRESPONDENCIA_MODOS[norm];
      for (const [nombreNorm, idInterno] of Object.entries(TABLA_CORRESPONDENCIA_MODOS)) {
        if (nombreNorm.length >= 5 && (norm === nombreNorm || norm.includes(nombreNorm))) {
          return idInterno;
        }
      }
      return null;
    };

    const PATRON_MARCA_IDEA_INICIO = /^\s*⟦\s*idea\s*⟧[ \t]*\r?\n?/i;
    const PATRON_MARCA_IDEA_GLOBAL = /⟦\s*idea\s*⟧[ \t]*\r?\n?/gi;
    const PATRON_MARCA_MODO_GLOBAL = /`?\s*⟦\s*modo\s*:\s*([^⟧]+?)\s*⟧\s*`?/gi;
    const PATRON_ENLACE_MODO_MD = /\[([^\]]*)\]\(\s*\/?#?modo:([^)]+)\)/gi;

    const limpiarMarcaIdea = (t: string): string => {
      if (PATRON_MARCA_IDEA_INICIO.test(t) || /⟦\s*idea\s*⟧/i.test(t)) {
        detectoIdeaPrevia = true;
      }
      let resultado = t
        .replace(PATRON_MARCA_IDEA_INICIO, '')
        .replace(PATRON_MARCA_IDEA_GLOBAL, '');
      resultado = resultado.replace(PATRON_MARCA_MODO_GLOBAL, (_m, rawId) => {
        const idResuelto = resolverIdModo(rawId);
        if (idResuelto && idResuelto !== modeKey && AGENTE.modos[idResuelto]) {
          modoSugerido = idResuelto;
        }
        return '';
      });
      resultado = resultado.replace(PATRON_ENLACE_MODO_MD, (_m, label, rawHref) => {
        const idResuelto = resolverIdModo(rawHref) || resolverIdModo(label);
        if (idResuelto && idResuelto !== modeKey && AGENTE.modos[idResuelto]) {
          modoSugerido = idResuelto;
        }
        return '';
      });
      return resultado;
    };

    // ===== Respuesta en vivo (streaming): el texto llega al estudiante mientras se genera =====
    const quiereStream = (req.body as any)?.stream !== false;
    let streamIniciado = false;
    let textoEnviado = false;
    const enviarEvento = (evento: Record<string, unknown>) => {
      if (!streamIniciado) {
        streamIniciado = true;
        res.status(200);
        res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
        (res as any).flushHeaders?.();
      }
      res.write(JSON.stringify(evento) + '\n');
    };
    const MENSAJE_NO_DISPONIBLE =
      'El agente no está disponible en este momento. Intenta de nuevo en un minuto; si sigue fallando, avisa al docente.';
    const responderError = (status: number, error: string) => {
      try {
        if (streamIniciado || res.headersSent) {
          enviarEvento({ t: 'error', error });
          return res.end();
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(status).json({ error });
      } catch {
        try {
          return res.end();
        } catch {
          return;
        }
      }
    };
    // Con streaming devuelve un objeto con la misma forma que generateContent (text, candidates, groundingChunks, modelVersion)
    const generar = async (model: string, cfg: any, nivelLog: string): Promise<any> => {
      // Si el primer texto no llega a tiempo (8,5 s en conversación normal; 11 s cuando lleva googleSearch o páginas PDF), pasa rápido al modelo de respaldo (gemini-flash-lite-latest con LOW)
      const controlador = new AbortController();
      const limiteMs = llevaBusqueda || partesIcfes.length > 0 || archivosUltimoEst.length > 0 ? 11_000 : 8_500;
      const temporizador = setTimeout(() => controlador.abort(), limiteMs);
      const cfgConCorte = { ...cfg, abortSignal: controlador.signal };
      const tInicioFlujo = Date.now();
      try {
        if (!quiereStream) {
          const r = await ai.models.generateContent({ model, contents, config: cfgConCorte });
          clearTimeout(temporizador);
          const msPrimerTexto = Date.now() - tInicioFlujo;
          console.log(`[Primer texto] ${(r as any)?.modelVersion || model} (${nivelLog}) en ${msPrimerTexto} ms (modo: ${modeKey})`);
          registrarTiempo({ modo: modeKey, modelo: (r as any)?.modelVersion || model, primerTextoMs: msPrimerTexto, razonar: usarMedium, adjuntos: partesIcfes.length });
          const textoLimpio = limpiarMarcaIdea(r.text || '');
          return {
            text: textoLimpio,
            candidates: r.candidates,
            modelVersion: (r as any)?.modelVersion || model,
          };
        }
        const flujo = await ai.models.generateContentStream({ model, contents, config: cfgConCorte });
        let texto = '';
        let bufferInicio = '';
        let colaStream = '';
        let inicioResuelto = false;
        let reinicioPendiente = textoEnviado;
        let ultimo: any = null;
        let versionModelo = '';
        let primerTextoRecibido = false;
        const chunksGrounding: any[] = [];
        const supportsGrounding: any[] = [];
        const emitirFragmentoSeguro = (frag: string, esFinal = false) => {
          colaStream += frag;
          colaStream = limpiarMarcaIdea(colaStream);
          if (!esFinal) {
            // Si queda una marca '⟦' abierta al final del fragmento, espera al siguiente chunk para no mostrarla en pantalla
            const idxMarcaAbierta = colaStream.lastIndexOf('⟦');
            if (idxMarcaAbierta >= 0 && idxMarcaAbierta > colaStream.lastIndexOf('⟧') && colaStream.length - idxMarcaAbierta < 45) {
              const listoParaEnviar = colaStream.slice(0, idxMarcaAbierta);
              colaStream = colaStream.slice(idxMarcaAbierta);
              if (listoParaEnviar) {
                if (reinicioPendiente) {
                  enviarEvento({ t: 'reinicio' });
                  reinicioPendiente = false;
                }
                texto += listoParaEnviar;
                textoEnviado = true;
                enviarEvento({ t: 'delta', text: listoParaEnviar });
              }
              return;
            }
          }
          const aEnviar = limpiarMarcaIdea(colaStream);
          colaStream = '';
          if (aEnviar) {
            if (reinicioPendiente) {
              enviarEvento({ t: 'reinicio' });
              reinicioPendiente = false;
            }
            texto += aEnviar;
            textoEnviado = true;
            enviarEvento({ t: 'delta', text: aEnviar });
          }
        };
        for await (const parte of flujo) {
          if ((parte as any)?.modelVersion) versionModelo = (parte as any).modelVersion;
          const gm = (parte as any)?.candidates?.[0]?.groundingMetadata;
          if (Array.isArray(gm?.groundingChunks)) chunksGrounding.push(...gm.groundingChunks);
          if (Array.isArray(gm?.groundingSupports)) supportsGrounding.push(...gm.groundingSupports);
          ultimo = parte;
          const delta = parte.text || '';
          if (delta) {
            if (!primerTextoRecibido) {
              primerTextoRecibido = true;
              clearTimeout(temporizador);
              const msPrimerTexto = Date.now() - tInicioFlujo;
              console.log(`[Primer texto] ${(parte as any)?.modelVersion || model} (${nivelLog}) en ${msPrimerTexto} ms (modo: ${modeKey})`);
              registrarTiempo({ modo: modeKey, modelo: (parte as any)?.modelVersion || model, primerTextoMs: msPrimerTexto, razonar: usarMedium, adjuntos: partesIcfes.length });
            }
            if (!inicioResuelto) {
              bufferInicio += delta;
              const sinEspacios = bufferInicio.trimStart();
              if (!sinEspacios) continue;
              // Si empieza con '⟦' (o posible prefijo de '⟦idea⟧'), espera hasta cerrar la línea o tener suficientes caracteres
              const posibleMarca = '⟦idea⟧'.startsWith(sinEspacios.slice(0, Math.min(sinEspacios.length, 6)).toLowerCase()) || /^⟦/.test(sinEspacios);
              const marcaCompletaConSalto = /^\s*⟦\s*idea\s*⟧[ \t]*\r?\n/i.test(bufferInicio);
              if (posibleMarca && !marcaCompletaConSalto && bufferInicio.length < 20) {
                continue;
              }
              inicioResuelto = true;
              const inicial = bufferInicio;
              bufferInicio = '';
              emitirFragmentoSeguro(inicial, false);
            } else {
              emitirFragmentoSeguro(delta, false);
            }
          }
        }
        if (!inicioResuelto && bufferInicio) {
          emitirFragmentoSeguro(bufferInicio, true);
        } else if (colaStream) {
          emitirFragmentoSeguro('', true);
        }
        return {
          text: limpiarMarcaIdea(texto).trimEnd(),
          candidates: ultimo?.candidates,
          groundingChunks: chunksGrounding,
          groundingSupports: supportsGrounding,
          modelVersion: versionModelo || ultimo?.modelVersion || model,
        };
      } finally {
        clearTimeout(temporizador);
      }
    };

    // Intento en cascada con un único reintento ante 429 o 503 (y reintento con LOW si el error 400 mencione el nivel de razonamiento)
    let reintentado = false;
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      // En el modelo de respaldo (gemini-flash-lite-latest fuera de pistas ICFES, o i > 0) o si se forzó LOW, se usa siempre LOW
      const esRespaldoLite = model === 'gemini-flash-lite-latest' && !ligeroIcfes;
      const nivelActual: 'MINIMAL' | 'LOW' | 'MEDIUM' =
        i > 0 || esRespaldoLite || forzarLowPorModelo.has(model) ? 'LOW' : nivelDeseado;
      const config = configPara(nivelActual);
      try {
        const t0 = Date.now();
        const response = await generar(model, config, nivelActual);
        console.log(`[Tiempo] ${model} (${nivelActual}) -> ${(response as any).modelVersion || model} en ${Date.now() - t0} ms (busqueda: ${!!modo.busqueda})`);

        if (response.text) {
          replyText = limpiarMarcaIdea(response.text).trimEnd();
          modeloUsado = (response as any).modelVersion || model;

          // Extract grounding sources if available (acumuladas en el stream o en el candidato final)
          const candidate = response.candidates?.[0];
          const chunks =
            Array.isArray((response as any).groundingChunks) && (response as any).groundingChunks.length > 0
              ? (response as any).groundingChunks
              : (candidate as any)?.groundingMetadata?.groundingChunks;
          const supports =
            Array.isArray((response as any).groundingSupports) && (response as any).groundingSupports.length > 0
              ? (response as any).groundingSupports
              : (candidate as any)?.groundingMetadata?.groundingSupports;
          if (Array.isArray(chunks) && chunks.length > 0) {
            const fragmentosPorIndice = new Map<number, string>();
            const indicesUsados = new Set<number>();
            if (Array.isArray(supports)) {
              for (const sup of supports) {
                const segTexto = String(sup?.segment?.text || '')
                  .replace(/[*_#`]+/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();
                const idxs: number[] = Array.isArray(sup?.groundingChunkIndices) ? sup.groundingChunkIndices : [];
                for (const idx of idxs) {
                  indicesUsados.add(idx);
                  if (segTexto && !fragmentosPorIndice.has(idx)) {
                    fragmentosPorIndice.set(idx, segTexto);
                  }
                }
              }
            }
            // En modos que no son Verificar, si el modelo hizo una búsqueda en segundo plano pero no usó ningún fragmento en la respuesta, no mostramos fuentes vacías
            const mostrarChunks = modeKey === 'verificar' || indicesUsados.size > 0;
            if (mostrarChunks) {
              const fuentesMap = new Map<string, string>();
              chunks.forEach((chunk: any, idx: number) => {
                if (indicesUsados.size > 0 && !indicesUsados.has(idx)) return;
                const url = chunk?.web?.uri;
                let titulo = String(chunk?.web?.title || '').trim();
                if (!url) return;
                const esSoloDominio = !titulo || /^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(titulo);
                if (esSoloDominio) {
                  const frag = fragmentosPorIndice.get(idx);
                  const dom = titulo || url;
                  if (frag) {
                    const recorte = frag.length > 65 ? frag.slice(0, 62).trimEnd() + '…' : frag;
                    titulo = `${dom} — ${recorte}`;
                  } else {
                    titulo = dom;
                  }
                }
                if (!fuentesMap.has(url)) {
                  fuentesMap.set(url, titulo);
                }
              });
              fuentes = Array.from(fuentesMap.entries())
                .slice(0, 8)
                .map(([url, titulo]) => ({ titulo, url }));
            }
          }

          break; // Stop immediately once first model responds
        }
      } catch (err: any) {
        lastError = err;
        // Si el primer texto no llega en 12 s, pasa al modelo de respaldo (gemini-flash-lite-latest con LOW) y recuerda por 2 min
        if (err?.name === 'AbortError' || /abort/i.test(String(err?.message || ''))) {
          if (model === 'gemini-flash-latest') {
            flashLentoHasta = Date.now() + FLASH_PAUSA_MS;
          }
          console.log(`[Lento] ${model} (${nivelActual}) no entregó el primer texto en 12 s; pasando al respaldo con LOW (pausa de 2 min activada)`);
          registrarTiempo({ modo: modeKey, modelo: model, lento: true });
          continue;
        }
        const msgErr = String(err?.message || '');
        const status =
          err?.status ||
          err?.statusCode ||
          (/\b401\b|UNAUTHENTICATED|API_KEY_INVALID|API key not valid/i.test(msgErr)
            ? 401
            : /\b403\b|PERMISSION_DENIED/i.test(msgErr)
            ? 403
            : /\b400\b|INVALID_ARGUMENT/i.test(msgErr)
            ? 400
            : /\b429\b|RESOURCE_EXHAUSTED/i.test(msgErr)
            ? 429
            : /\b404\b|NOT_FOUND/i.test(msgErr)
            ? 404
            : /\b503\b|UNAVAILABLE/i.test(msgErr)
            ? 503
            : 500);

        console.log(`[Error en modelo ${model}] err.status: ${status}, err.message: ${err?.message}`);

        // Ante 401 o 403 (key inválida o sin permiso) no reintentes ni cambies de modelo
        if (status === 401 || status === 403 || /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msgErr)) {
          console.error('[Key] La API key no es válida o no tiene permiso');
          return responderError(status === 403 ? 403 : 401, MENSAJE_NO_DISPONIBLE);
        }

        if (status === 429 || msgErr.includes('429')) {
          had429 = true;
        }

        if (status === 404 || msgErr.includes('404')) {
          if (model === 'gemini-flash-latest') {
            flashLentoHasta = Date.now() + FLASH_PAUSA_MS;
          }
          console.log(`Modelo ${model} no existe (404). Pasando al siguiente modelo...`);
          continue;
        }

        const isOverload = status === 429 || status === 503 || msgErr.includes('429') || msgErr.includes('503');

        if (isOverload && !reintentado) {
          reintentado = true;
          console.log(`Esperando 1,5 s para un único reintento tras error ${status} en ${model}...`);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          i--;
          continue;
        }

        // Solo reintenta con thinkingLevel LOW cuando el error 400 mencione el nivel de razonamiento
        if (
          status === 400 &&
          /thinking|reasoning|razonamiento/i.test(msgErr) &&
          nivelActual !== 'LOW' &&
          !forzarLowPorModelo.has(model)
        ) {
          forzarLowPorModelo.add(model);
          console.log(`Nivel de razonamiento ${nivelActual} no aceptado en ${model}; reintentando con LOW...`);
          i--;
          continue;
        }

        if (model === 'gemini-flash-latest') {
          flashLentoHasta = Date.now() + FLASH_PAUSA_MS;
        }
        console.error(`Error con el modelo ${model}; se intenta con el siguiente:`, err?.message || err);
      }
    }

    // Si todos fallan por 429 en un modo con búsqueda, haz un último intento SIN la herramienta googleSearch
    if (!replyText && modo.busqueda && (had429 || lastError?.status === 429 || (typeof lastError?.message === 'string' && lastError.message.includes('429')))) {
      console.log('Los modelos con búsqueda fallaron por 429. Intentando fallback SIN googleSearch...');
      const fallbackModels = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
      for (const fbModel of fallbackModels) {
        try {
          const fallbackConfig: any = {
            systemInstruction: systemInstruction + "\n\nIMPORTANTE: en esta respuesta NO tienes acceso a la búsqueda en Google. No digas que buscaste ni que consultaste fuentes en línea. Responde solo con lo que sabes, aclara que puede estar desactualizado y, si es una verificación, escribe «Veredicto provisional» (o 'Sin evidencia suficiente'), cambia el título «Qué dicen las fuentes» por «Lo que se sabe (sin fuentes consultadas)» y no atribuyas datos a fuentes que no consultaste; en «Lectura lateral» indica dónde confirmarlo. No escribas ningún aviso ni nota sobre la falta de búsqueda: la aplicación ya muestra ese aviso al estudiante.",
            temperature: typeof modo.temperatura === 'number' ? modo.temperatura : 0.7,
            maxOutputTokens: (typeof modo.maxTokens === 'number' ? modo.maxTokens : 1000) + 1500,
            thinkingConfig: { thinkingLevel: 'LOW' as any },
          };

          const fallbackResponse = await ai.models.generateContent({
            model: fbModel,
            contents,
            config: fallbackConfig,
          });

          if (fallbackResponse.text) {
            const textoFbLimpio = limpiarMarcaIdea(fallbackResponse.text).trimEnd();
            replyText = `_Aviso: la búsqueda en Google no estuvo disponible en este momento._\n\n${textoFbLimpio}`;
            modeloUsado = (fallbackResponse as any).modelVersion || fbModel;
            fuentes = [];
            break;
          }
        } catch (fallbackErr: any) {
          lastError = fallbackErr;
          const fallbackStatus = fallbackErr?.status || fallbackErr?.statusCode || (typeof fallbackErr?.message === 'string' && fallbackErr.message.includes('429') ? 429 : 500);
          console.log(`[Error en fallback ${fbModel}] err.status: ${fallbackStatus}, err.message: ${fallbackErr?.message}`);
        }
      }
    }

    if (replyText) {
      // Registro de la interacción en Google Sheets (no bloquea la respuesta)
      const ultimoEst = mensajesEst[mensajesEst.length - 1];
      const textoUltimo = ultimoEst?.text || '';
      const archivosRegistro: ChatArchivo[] =
        Array.isArray(ultimoEst?.archivos) && ultimoEst.archivos.length > 0
          ? ultimoEst.archivos
          : ultimoEst?.archivo
          ? [ultimoEst.archivo]
          : [];
      const tieneIdeaPrevia = detectoIdeaPrevia || textoUltimo.includes('[Mi idea previa]');
      const tieneVerificacion = textoUltimo.startsWith('[Verificación externa]');
      const tieneArchivo = Boolean(archivosRegistro.length > 0 && modeKey !== 'icfes');
      const sufijoModo =
        (tieneIdeaPrevia ? ' · idea previa' : '') +
        (tieneVerificacion ? ' · verificación' : '') +
        (enviarRecordatorioVerificacion ? ' · recordatorio' : '') +
        (tieneArchivo ? ' · archivo' : '');
      const infoArchivoRegistro =
        tieneArchivo
          ? archivosRegistro
              .map((a) => `${a.nombre} (${a.mimeType || 'archivo'})`)
              .join(', ')
          : '';
      const fuentesRegistro = [
        ...(infoArchivoRegistro ? [infoArchivoRegistro] : []),
        ...fuentes.map((f) => f.url),
      ].join('\n');
      registrarInteraccion({
        fecha: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        estudiante: (estudiante || '').slice(0, 120),
        sesion: sesion || '',
        modo: `${modo.titulo}${sufijoModo}`,
        turno: mensajesEst.length,
        mensaje: textoUltimo,
        adjunto: registroIcfes || '',
        respuesta: replyText,
        fuentes: fuentesRegistro,
        modelo: modeloUsado,
        segundos: Math.round((Date.now() - tInicio) / 100) / 10,
      });
      if (quiereStream) {
        enviarEvento({
          t: 'fin',
          reply: replyText,
          fuentes,
          ...(modoSugerido ? { modoSugerido } : {}),
          ...(resultadoIcfes ? { icfes: resultadoIcfes } : {}),
        });
        return res.end();
      }
      return res.json({
        reply: replyText,
        fuentes,
        ...(modoSugerido ? { modoSugerido } : {}),
        ...(resultadoIcfes ? { icfes: resultadoIcfes } : {}),
      });
    }

    const is429 = lastError?.status === 429 || (typeof lastError?.message === 'string' && lastError.message.includes('429'));
    return responderError(is429 ? 429 : 503, MENSAJE_NO_DISPONIBLE);
  } catch (error: any) {
    console.error('Error al procesar solicitud de chat:', error);
    const msg = 'El agente no está disponible en este momento. Intenta de nuevo en un minuto; si sigue fallando, avisa al docente.';
    if (res.headersSent) {
      try {
        res.write(JSON.stringify({ t: 'error', error: msg }) + '\n');
      } catch {}
      return res.end();
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(500).json({ error: msg });
  }
});

// ===== Cierre de sesión: reflexión del estudiante (no consume cupo de Gemini) =====
// Se guarda en la misma hoja: en «modo» aparece «… — CIERRE», en «mensaje» la reflexión,
// en «turno» los mensajes que envió el estudiante y en «segundos» la duración total de la sesión.
app.post('/api/cierre', (req, res) => {
  try {
    const b = (req.body || {}) as Record<string, unknown>;
    const ip = String(req.ip || req.headers['x-forwarded-for'] || 'desconocida').split(',')[0].trim();
    const texto = (v: unknown, max = 2000) => String(v ?? '').trim().slice(0, max);
    const contarPalabras = (s: string) =>
      s
        .trim()
        .split(/\s+/)
        .filter((p) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}/.test(p)).length;
    const aprendiTxt = texto(b.aprendi);
    const comprobeTxt = texto(b.comprobe);
    const sinAyudaTxt = texto(b.sinAyuda);
    const c = Number(b.confianza);
    if (contarPalabras(aprendiTxt) < 5) {
      return res.status(400).json({ error: 'En la pregunta 1, escribe una idea completa con tus palabras (mínimo 5 palabras).' });
    }
    if (contarPalabras(comprobeTxt) < 5) {
      return res.status(400).json({ error: 'En la pregunta 2, explica con al menos 5 palabras qué comprobaste fuera (o qué habrías podido comprobar y dónde).' });
    }
    if (contarPalabras(sinAyudaTxt) < 5) {
      return res.status(400).json({ error: 'En la pregunta 3, cuenta con al menos 5 palabras qué hiciste o habrías hecho por tu cuenta.' });
    }
    if (!(c >= 1 && c <= 5)) {
      return res.status(400).json({ error: 'En el punto 5, elige de 1 a 5 qué tan seguro te sientes de explicarlo sin ayuda.' });
    }
    if (superaLimite('cierre:' + String(b.sesion || ip).slice(0, 60), 3, 20)) {
      return res.status(429).json({ error: 'Ya registraste este cierre. Espera un momento.' });
    }
    const modeKey = texto(b.modeKey, 40);
    const modo = AGENTE.modos[modeKey];
    const confianza = String(Math.round(c));
    registrarInteraccion({
      fecha: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
      estudiante: texto(b.estudiante, 120),
      sesion: texto(b.sesion, 60),
      modo: `${modo ? modo.titulo : modeKey} — CIERRE`,
      turno: Number(b.turnos) || 0,
      mensaje: `Qué aprendí: ${aprendiTxt}\nQué comprobé fuera de la IA: ${comprobeTxt}\nQué habría hecho sin ayuda: ${sinAyudaTxt}\nQué me quedó dudoso: ${texto(b.dudas) || '—'}\nConfianza para explicarlo sin ayuda (1 a 5): ${confianza}`,
      adjunto: '',
      respuesta: '',
      fuentes: '',
      modelo: 'cierre (sin IA)',
      segundos: Math.max(0, Math.round(Number(b.segundos) || 0)),
    });
    return res.json({ ok: true });
  } catch (e: any) {
    console.log('[Cierre] Error:', e?.message || e);
    return res.status(500).json({ error: 'No se pudo guardar tu reflexión. Intenta de nuevo.' });
  }
});

// ===== Entrenador Saber 11: banco de preguntas reales (cuadernillos del ICFES en Drive) =====
const ipDe = (req: any) => String(req.ip || req.headers['x-forwarded-for'] || 'desconocida').split(',')[0].trim();

app.get('/api/icfes/areas', (_req, res) => {
  const estado = estadoBanco();
  res.json({
    areas: Object.entries(AREAS_ICFES).map(([clave, a]) => ({
      clave,
      nombre: a.nombre,
      preguntas: PREGUNTAS.filter((p) => p.cuadernillo.area === clave).length,
      error: estado.find((e) => e.area === clave)?.error || null,
    })),
  });
});

// Preguntas que ya vio cada estudiante, para no repetírselas cuando vuelve a entrar
// (el navegador también las guarda; aquí se cubren los cambios de equipo mientras el servidor esté activo)
const vistasPorEstudiante = new Map<string, Set<string>>();

// Preguntas que comparten el mismo texto («RESPONDA LAS PREGUNTAS 29 A 33…»), en orden
async function hermanasDe(p: any): Promise<any[]> {
  try {
    const c = await contenidoDePregunta(p);
    const m = /PREGUNTAS?\s+(\d{1,2})(?:\s*(?:A|Y|-)\s*(\d{1,2}))?/i.exec(c?.contexto?.titulo || '');
    if (!m || !m[2]) return [];
    const desde = Number(m[1]), hasta = Number(m[2]);
    if (p.numero < desde || p.numero > hasta) return [];
    return PREGUNTAS.filter((q) => q.cuadernillo === p.cuadernillo && q.examen === p.examen && q.numero >= desde && q.numero <= hasta).sort((a, b) => a.numero - b.numero);
  } catch {
    return [];
  }
}
const claveEstudiante = (n: string) => n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 120);

app.get('/api/icfes/pregunta', async (req, res) => {
  try {
    if (superaLimite('icfes:' + ipDe(req), 200, 4000)) {
      return res.status(429).json({ error: 'Demasiadas solicitudes seguidas. Espera un momento.' });
    }
    const area = String(req.query.area || '');
    if (!AREAS_ICFES[area]) return res.status(400).json({ error: 'Área no válida.' });
    const excluir = new Set(String(req.query.excluir || '').split(',').filter(Boolean).slice(0, 400));
    const alumno = claveEstudiante(String(req.query.estudiante || ''));
    const vistasAlumno = alumno ? vistasPorEstudiante.get(alumno) : undefined;
    if (vistasAlumno) for (const id of vistasAlumno) excluir.add(id);
    let candidatas = PREGUNTAS.filter((p) => p.cuadernillo.area === area && !excluir.has(p.id));
    let reinicio = false;
    if (!candidatas.length) {
      candidatas = PREGUNTAS.filter((p) => p.cuadernillo.area === area);
      reinicio = true;
        if (vistasAlumno) for (const q of candidatas) vistasAlumno.delete(q.id);
    }
    // Se elige al azar entre las que no ha visto; se salta alguna cuya página no se haya podido ubicar
    // Si la pregunta anterior pertenece a un texto compartido, sigue la siguiente pregunta de ese mismo texto
    const anterior = buscarPregunta(String(req.query.despuesDe || ''));
    if (anterior && anterior.cuadernillo.area === area) {
      const sig = (await hermanasDe(anterior)).find((q) => q.numero > anterior.numero && !excluir.has(q.id));
      if (sig) candidatas = [sig, ...candidatas.filter((q) => q !== sig)];
    }
    let forzada = !!(anterior && candidatas[0] && candidatas[0] !== undefined && (await hermanasDe(anterior)).includes(candidatas[0]));
    for (let intento = 0; intento < 8 && candidatas.length; intento++) {
      let p = forzada ? candidatas.shift()! : candidatas.splice(Math.floor(Math.random() * candidatas.length), 1)[0];
        forzada = false;
        // Si cae en un texto compartido, se empieza por la primera pregunta de ese texto que no haya visto
        const hermanasP = await hermanasDe(p);
        const primera = hermanasP.find((q) => !excluir.has(q.id));
        if (primera) p = primera;
      const u = await paginasDePregunta(p);
      if (!u.ubicada || !u.paginas.length) continue;
        if (alumno) {
          const s = vistasPorEstudiante.get(alumno) || new Set<string>();
          s.add(p.id);
          vistasPorEstudiante.set(alumno, s);
          if (vistasPorEstudiante.size > 3000) vistasPorEstudiante.delete(vistasPorEstudiante.keys().next().value as string);
        }
      return res.json({
        id: p.id,
        area,
        areaNombre: AREAS_ICFES[area].nombre,
        cuadernilloId: p.cuadernillo.id,
        cuadernillo: p.cuadernillo.titulo,
        examen: p.cuadernillo.examenes[p.examen]?.nombre || '',
        numero: p.numero,
        opciones: p.opciones,
        paginas: u.paginas,
        principal: u.principal,
        y: u.y,
        totalPaginas: u.total,
        reinicio,
        contenido: await contenidoDePregunta(p).catch(() => null),
        grupoPos: hermanasP.length ? hermanasP.findIndex((q) => q.id === p.id) + 1 : undefined,
        grupoTotal: hermanasP.length || undefined,
        limpiar: reinicio ? PREGUNTAS.filter((q) => q.cuadernillo.area === area).map((q) => q.id) : undefined,
      });
    }
    return res.status(503).json({ error: 'No pude ubicar una pregunta en este cuadernillo. Intenta con otra área.' });
  } catch (e: any) {
    console.log('[ICFES] Error al preparar la pregunta:', e?.message || e);
    return res.status(503).json({ error: 'No pude abrir los cuadernillos del ICFES en este momento. Intenta de nuevo en un minuto o avísale al docente.' });
  }
});

app.get('/api/icfes/pagina/:cuadernillo/:indice', async (req, res) => {
  try {
    if (superaLimite('icfes-pag:' + ipDe(req), 300, 6000)) return res.status(429).end();
    const c = CUADERNILLOS.find((x) => x.id === req.params.cuadernillo);
    const indice = Number(req.params.indice);
    if (!c || !Number.isInteger(indice)) return res.status(404).end();
    const pdf = await pdfDePagina(c, indice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(Buffer.from(pdf));
  } catch (e: any) {
    console.log('[ICFES] Error al entregar la página:', e?.message || e);
    return res.status(503).end();
  }
});

// Estado del banco (para el docente): qué cuadernillos cargaron y cuántas preguntas se ubicaron
// Revisa ya mismo la carpeta de Drive (el docente lo abre después de subir un cuadernillo): /api/icfes/actualizar
let ultimaActualizacionManual = 0;
app.get('/api/icfes/actualizar', async (_req, res) => {
  if (Date.now() - ultimaActualizacionManual < 20_000) return res.json({ aviso: 'Ya se está actualizando; espera unos segundos.', ...estadoSincronizacion() });
  ultimaActualizacionManual = Date.now();
  const r = await sincronizarCarpeta();
  return res.json({ ...r, areas: Object.keys(AREAS_ICFES).map((a) => ({ area: a, preguntas: PREGUNTAS.filter((p) => p.cuadernillo.area === a).length })) });
});

// Contenido extraído de una pregunta (revisión del docente; no incluye la clave): /api/icfes/contenido/lc2018-14
app.get('/api/icfes/contenido/:id', async (req, res) => {
  const p = buscarPregunta(req.params.id);
  if (!p) return res.status(404).json({ error: 'No existe esa pregunta.' });
  try {
    const c = await contenidoDePregunta(p);
    return res.json({ id: p.id, contenido: c, texto: c ? contenidoComoTexto(c) : null });
  } catch (e: any) {
    return res.status(503).json({ error: e?.message || 'No disponible' });
  }
});

// Prueba de velocidad de cada modelo (para el docente): /api/diagnostico-ia/probar
app.get('/api/diagnostico-ia/probar', async (_req, res) => {
  const lista = CANDIDATE_MODELS;
  const resultados = await Promise.all(
    lista.map(async (model) => {
      const t0 = Date.now();
      const ctl = new AbortController();
      const tm = setTimeout(() => ctl.abort(), 30_000);
      try {
        const flujo = await ai.models.generateContentStream({
          model,
          contents: [{ role: 'user', parts: [{ text: 'Explica en 3 frases qué es una inferencia en un texto.' }] }],
          config: { maxOutputTokens: 600, thinkingConfig: { thinkingLevel: 'LOW' as any }, abortSignal: ctl.signal } as any,
        });
        let primero = 0;
        for await (const _p of flujo) if (!primero) primero = Date.now() - t0;
        return { model, primerTextoMs: primero, totalMs: Date.now() - t0 };
      } catch (e: any) {
        return { model, error: String(e?.status || '') + ' ' + String(e?.message || e).slice(0, 120), ms: Date.now() - t0 };
      } finally {
        clearTimeout(tm);
      }
    })
  );
  res.json(resultados);
});

app.get('/api/diagnostico-ia', (_req, res) => {
  res.json({ cascada: CANDIDATE_MODELS, tiempos: tiemposIA });
});

app.get('/api/icfes/estado', (req, res) => {
  const diag = String(req.query.diag || '');
  res.json({ cuadernillos: estadoBanco(), sincronizacion: estadoSincronizacion(), ...(diag ? { ubicaciones: diagnostico(diag) } : {}) });
});

// Endpoint to fetch public parameters and modes configuration
app.get('/api/parametros', (_req, res) => {
  res.json({
    nombre: AGENTE.nombre,
    subtitulo: AGENTE.subtitulo,
    version: AGENTE.version,
    modos: Object.entries(AGENTE.modos).map(([key, modo]) => ({
      key,
      titulo: modo.titulo,
      descripcion: modo.descripcion,
      saludo: modo.saludo,
      busqueda: Boolean(modo.busqueda),
      adjuntos: Boolean(modo.adjuntos),
    })),
  });
});

// Manejador de errores para /api: evita que cualquier fallo pase al manejador HTML por defecto de Vite/Express
app.use('/api', (err: any, _req: any, res: any, _next: any) => {
  console.error('[API Error]', err?.message || err);
  const msg = 'El agente no está disponible en este momento. Intenta de nuevo en un minuto; si sigue fallando, avisa al docente.';
  if (res.headersSent) {
    try {
      res.write(JSON.stringify({ t: 'error', error: msg }) + '\n');
    } catch {}
    return res.end();
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(500).json({ error: msg });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Interlocutor Crítico escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer();
