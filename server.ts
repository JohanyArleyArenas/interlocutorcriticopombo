import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { AGENTE } from './src/parametros.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Up limit to 20MB for file uploads
app.use(express.json({ limit: '20mb' }));

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
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
  archivo?: ChatArchivo;
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

// ===== Memoria de cupos agotados (plan gratuito) =====
// Cuando un modelo responde 429 por cupo agotado, se recuerda hasta cuándo y se salta
// directamente, sin gastar un intento ni esperar el backoff en cada mensaje.
const agotadoHasta = new Map<string, number>();
const claveCupo = (model: string, conBusqueda: boolean) => `${model}|${conBusqueda ? 'busqueda' : 'normal'}`;

function estaAgotado(model: string, conBusqueda: boolean): boolean {
  const hasta = agotadoHasta.get(claveCupo(model, conBusqueda));
  return !!hasta && Date.now() < hasta;
}

function marcarAgotado(model: string, conBusqueda: boolean, mensaje: string): number {
  const m = /retryDelay"?\s*:\s*"?(\d+(?:\.\d+)?)s/.exec(mensaje) || /retry in (\d+(?:\.\d+)?)\s*s/i.exec(mensaje);
  let ms = m ? Math.ceil(parseFloat(m[1]) * 1000) : 60_000;
  // Si es el límite DIARIO, Google a veces sugiere reintentar en segundos; se salta al menos 1 hora.
  if (/PerDay/i.test(mensaje)) ms = Math.max(ms, 60 * 60 * 1000);
  agotadoHasta.set(claveCupo(model, conBusqueda), Date.now() + ms);
  console.log(`[Cupo] ${model} (${conBusqueda ? 'con' : 'sin'} búsqueda) agotado; se saltará durante ${Math.round(ms / 1000)} s`);
  return ms;
}

// Model cascade strictly per user instructions
const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const SEARCH_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];

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

    const modo = AGENTE.modos[modeKey];

    // Truncate history: keep only last 12 messages, but preserve student's first message if it has an attachment
    let slicedMessages = [...messages];
    if (slicedMessages.length > 12) {
      const firstMsg = slicedMessages[0];
      const firstHasAttachment = Boolean(firstMsg && firstMsg.archivo);
      if (firstHasAttachment) {
        slicedMessages = [firstMsg, ...slicedMessages.slice(-11)];
      } else {
        slicedMessages = slicedMessages.slice(-12);
      }
    }

    // Format current date in America/Bogota in Spanish
    const fechaHoy = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeZone: 'America/Bogota',
    }).format(new Date());

    const fechaLinea = modo.busqueda
      ? `FECHA DE HOY: ${fechaHoy}. Usa la búsqueda de Google para obtener información actualizada.`
      : `FECHA DE HOY: ${fechaHoy}.`;

    const reglaMatematicas = `FÓRMULAS Y MATEMÁTICAS: Para fórmulas, usa siempre la notación $...$ de LaTeX bien formada (sin escapar dobles barras) y $$...$$ para fórmulas en bloque. Cuando sea sencillo, prefiere símbolos Unicode legibles (√76, 7² = 49, ×, ÷) dentro del texto normal.`;

    const systemInstruction = `${AGENTE.parametros}

${fechaLinea}

MODO ACTUAL: ${modo.titulo}
${modo.instrucciones}

${reglaMatematicas}

El estudiante ya vio este mensaje inicial tuyo: ${modo.saludo}`;

    // Convert messages to Gemini API format
    const contents = slicedMessages.map((msg) => {
      const parts: any[] = [];

      if (msg.archivo) {
        const { mimeType, data, texto, nombre } = msg.archivo;
        const cleanBase64 = data ? data.replace(/^data:[^;]+;base64,/, '') : '';

        // If it is an image or PDF, send as inlineData
        if (cleanBase64 && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
          parts.push({
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          });
        }

        // If it is text or docx extracted text
        if (texto) {
          parts.push({
            text: `[Archivo adjunto: ${nombre}]\n${texto}`,
          });
        }
      }

      if (msg.text && msg.text.trim()) {
        parts.push({ text: msg.text });
      }

      // If parts is empty (e.g. file with no text and no data yet), fallback
      if (parts.length === 0) {
        parts.push({ text: '(Adjunto de archivo)' });
      }

      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

      // Preguntas de cálculo (matemáticas, física, química): se razona un poco más y con menos
    // creatividad para no equivocarse en las operaciones. El resto sigue rápido (LOW).
    const contextoReciente = slicedMessages.slice(-4).map((m: any) => m.text || '').join('\n');
    const esCuantitativo =
      /\d\s*[+\-*/^=×÷<>]\s*\d|[√π∫∑²³]|\\frac|\$|ecuaci|inecuaci|deriva|integral|fracci|porcentaje|ra[ií]z|potencia|logaritm|polinom|factoriz|trigonom|geometr|per[ií]metro|volumen|probabilidad|estad[ií]stic|velocidad|aceleraci|fuerza|energ[ií]a|estequiometr|molaridad|calcul|c[aá]lculo|resuelv|resolver|despej|f[oó]rmula|matem[aá]tic|[aá]lgebra|f[ií]sica|qu[ií]mica/i.test(
        contextoReciente
      );
    const temperaturaBase = typeof modo.temperatura === 'number' ? modo.temperatura : 0.7;

    const config: any = {
      systemInstruction: esCuantitativo
        ? `${systemInstruction}\n\nESTA CONVERSACIÓN INCLUYE CÁLCULOS: aplica con especial cuidado las reglas de PRECISIÓN EN MATEMÁTICAS Y CIENCIAS.`
        : systemInstruction,
      temperature: esCuantitativo ? Math.min(temperaturaBase, 0.3) : temperaturaBase,
      // El razonamiento interno también consume tokens de salida: se deja margen para no cortar respuestas
      maxOutputTokens: (typeof modo.maxTokens === 'number' ? modo.maxTokens : 1000) + (esCuantitativo ? 3000 : 1500),
      thinkingConfig: { thinkingLevel: (esCuantitativo ? 'MEDIUM' : 'LOW') as any },
    };

    if (modo.busqueda) {
      config.tools = [{ googleSearch: {} }];
    }

    const modelsToTry = modo.busqueda ? SEARCH_MODELS : CANDIDATE_MODELS;

    let lastError: any = null;
    let replyText: string | null = null;
    let modeloUsado = 'respaldo sin búsqueda';
    let fuentes: Array<{ titulo: string; url: string }> = [];
    let had429 = false;

    // Attempt models with 429/503 fallback, 1.5s backoff, and 404 immediate skip
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      if (estaAgotado(model, !!modo.busqueda)) {
        console.log(`[Cupo] Saltando ${model}: sin cupo por ahora`);
        had429 = true;
        lastError = lastError || { status: 429, message: 'free_tier: cupo agotado (recordado por el servidor)' };
        continue;
      }
      try {
        const t0 = Date.now();
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        console.log(`[Tiempo] ${model} -> ${(response as any).modelVersion} en ${Date.now() - t0} ms (busqueda: ${!!modo.busqueda})`);

        if (response.text) {
          replyText = response.text;
          modeloUsado = (response as any).modelVersion || model;

          // Extract grounding sources if available
          const candidate = response.candidates?.[0];
          const chunks = (candidate as any)?.groundingMetadata?.groundingChunks;
          if (Array.isArray(chunks)) {
            const fuentesMap = new Map<string, string>();
            for (const chunk of chunks) {
              const url = chunk.web?.uri;
              const titulo = chunk.web?.title || url;
              if (url && !fuentesMap.has(url)) {
                fuentesMap.set(url, titulo);
              }
            }
            fuentes = Array.from(fuentesMap.entries())
              .slice(0, 8)
              .map(([url, titulo]) => ({ titulo, url }));
          }

          break; // Stop immediately once first model responds
        }
      } catch (err: any) {
        lastError = err;
        let cupoLargo = false;
        const status = err?.status || err?.statusCode || (typeof err?.message === 'string' && err.message.includes('429') ? 429 : (typeof err?.message === 'string' && err.message.includes('404') ? 404 : 500));

        // Diagnóstico de errores: console.log del mensaje completo del error (err.message y err.status)
        console.log(`[Error en modelo ${model}] err.status: ${status}, err.message: ${err?.message}`);

        if (status === 429 || (typeof err?.message === 'string' && err.message.includes('429'))) {
          had429 = true;
          cupoLargo = marcarAgotado(model, !!modo.busqueda, String(err?.message || '')) >= 60_000;
        }

        // Si un modelo responde 404 (no existe), pasa al siguiente sin esperar
        if (status === 404 || (typeof err?.message === 'string' && err.message.includes('404'))) {
          console.log(`Modelo ${model} no existe (404). Pasando al siguiente modelo sin esperar...`);
          continue;
        }

        const isOverload = status === 429 || status === 503 || (typeof err?.message === 'string' && (err.message.includes('429') || err.message.includes('503')));

        // If error is NOT 429 or 503, do NOT retry
        if (!isOverload) {
          console.error(`Error no recuperable con modelo ${model}:`, err?.message || err);
          throw err;
        }

        // If there is another model to try, wait 1.5s backoff
        if (i < modelsToTry.length - 1 && !cupoLargo) {
          console.log('Esperando 1,5 s antes de cambiar de modelo tras error 429/503...');
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    // Si todos fallan por 429 en un modo con búsqueda, haz un último intento SIN la herramienta googleSearch con 'gemini-flash-latest'
    if (!replyText && modo.busqueda && (had429 || lastError?.status === 429 || (typeof lastError?.message === 'string' && lastError.message.includes('429')))) {
      console.log('Todos los modelos con búsqueda fallaron por 429. Intentando fallback SIN googleSearch...');
      const fallbackModels = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
      for (const fbModel of fallbackModels) {
        if (estaAgotado(fbModel, false)) {
          console.log(`[Cupo] Saltando ${fbModel} (respaldo sin búsqueda)`);
          continue;
        }
        try {
          const fallbackConfig: any = {
            systemInstruction: systemInstruction + "\n\nIMPORTANTE: en esta respuesta NO tienes acceso a la búsqueda en Google. No digas que buscaste ni que consultaste fuentes en línea. Responde solo con lo que sabes, aclara que puede estar desactualizado y, si es una verificación, da un veredicto provisional o 'Sin evidencia suficiente'.",
            temperature: typeof modo.temperatura === 'number' ? modo.temperatura : 0.7,
            // + 1500: margen para el razonamiento interno, que también consume tokens de salida y cortaba las respuestas
      maxOutputTokens: (typeof modo.maxTokens === 'number' ? modo.maxTokens : 1000) + 1500,
            thinkingConfig: { thinkingLevel: 'LOW' as any }, // más rápido: el modelo piensa menos antes de responder
          };

          const fallbackResponse = await ai.models.generateContent({
            model: fbModel,
            contents,
            config: fallbackConfig,
          });

          if (fallbackResponse.text) {
            replyText = `_Aviso: la búsqueda en Google no estuvo disponible en este momento._\n\n${fallbackResponse.text}`;
            fuentes = [];
            break;
          }
        } catch (fallbackErr: any) {
          lastError = fallbackErr;
          const fallbackStatus = fallbackErr?.status || fallbackErr?.statusCode || (typeof fallbackErr?.message === 'string' && fallbackErr.message.includes('429') ? 429 : 500);
          console.log(`[Error en fallback ${fbModel}] err.status: ${fallbackStatus}, err.message: ${fallbackErr?.message}`);
        if (fallbackStatus === 429) marcarAgotado(fbModel, false, String(fallbackErr?.message || ''));
        }
      }
    }

    if (replyText) {
      // Registro de la interacción en Google Sheets (no bloquea la respuesta)
      const mensajesEst = messages.filter((m) => m.role === 'user');
      const ultimoEst = mensajesEst[mensajesEst.length - 1];
      registrarInteraccion({
        fecha: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        estudiante: (estudiante || '').slice(0, 120),
        sesion: sesion || '',
        modo: modo.titulo,
        turno: mensajesEst.length,
        mensaje: ultimoEst?.text || '',
        adjunto: ultimoEst?.archivo?.nombre || '',
        respuesta: replyText,
        fuentes: fuentes.map((f) => f.url).join('\n'),
        modelo: modeloUsado,
        segundos: Math.round((Date.now() - tInicio) / 100) / 10,
      });
      return res.json({ reply: replyText, fuentes });
    }

    const is429 = lastError?.status === 429 || (typeof lastError?.message === 'string' && lastError.message.includes('429'));
    if (is429) {
      const cupoDiario = typeof lastError?.message === 'string' && /free_tier|retry in/i.test(lastError.message);
      return res.status(429).json({
        error: cupoDiario
          ? 'Se agotó el cupo gratuito de consultas de hoy. El docente debe activar la facturación en Google AI Studio o esperar a que se renueve el cupo.'
          : 'Hay muchas consultas en este momento. Espera unos segundos y vuelve a intentarlo.',
      });
    }

    return res.status(503).json({
      error: 'El servicio está experimentando alta demanda. Por favor reintenta en unos instantes.',
      details: lastError?.message || 'Servicio no disponible',
    });
  } catch (error: any) {
    console.error('Error al procesar solicitud de chat:', error);
    return res.status(500).json({
      error: 'Hubo un inconveniente al conectar con el interlocutor. Por favor intenta de nuevo.',
      details: error?.message || 'Error interno',
    });
  }
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
