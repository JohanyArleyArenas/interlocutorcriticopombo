/**
 * ENTRENADOR SABER 11 — Banco de preguntas reales del ICFES (solo servidor)
 *
 * Los cuadernillos oficiales están en el Drive del docente, en la carpeta
 * «Interlocutor Crítico – Banco ICFES» (compartida como «Cualquier persona con el enlace»).
 * El servidor descarga cada PDF una vez, localiza en qué página está cada pregunta y
 * entrega al estudiante solo esa página. La clave oficial NUNCA se envía al navegador:
 * solo la usa la IA para retroalimentar después de que el estudiante responde.
 *
 * Para agregar un cuadernillo: súbelo a la carpeta, copia su ID de Drive y añade una
 * entrada en CUADERNILLOS con su tabla de respuestas (una letra por pregunta, en orden).
 */
import { PDFDocument } from 'pdf-lib';

export interface Cuadernillo {
  id: string; // identificador corto
  area: string; // clave del área
  titulo: string;
  archivo: string; // ID del PDF en Drive
  dinamico?: boolean; // agregado solo desde la carpeta de Drive
  // Una o varias pruebas dentro del mismo PDF (Inglés trae 2 exámenes que reinician la numeración)
  examenes: Array<{ nombre?: string; claves: string; opciones?: (n: number) => string[] }>;
}

export const AREAS_ICFES: Record<string, { nombre: string; competencias: string }> = {
  matematicas: {
    nombre: 'Matemáticas',
    competencias:
      'Competencias evaluadas: interpretación y representación (leer y transformar tablas, gráficas, diagramas y expresiones); formulación y ejecución (plantear y llevar a cabo procedimientos para resolver un problema); argumentación (validar o refutar afirmaciones y procedimientos). Contenidos genéricos y no genéricos de estadística, geometría, álgebra y cálculo.',
  },
  lectura: {
    nombre: 'Lectura crítica',
    competencias:
      'Competencias evaluadas: (1) identificar y entender los contenidos locales de un texto (qué dice literalmente una palabra, frase o párrafo); (2) comprender cómo se articulan las partes de un texto para darle un sentido global (estructura, relación entre párrafos, tesis, función de cada parte); (3) reflexionar a partir de un texto y evaluar su contenido (supuestos, intención, validez de argumentos, relación con otros textos o contextos). Textos continuos y discontinuos, literarios e informativos.',
  },
  ciencias: {
    nombre: 'Ciencias naturales',
    competencias:
      'Competencias evaluadas: uso comprensivo del conocimiento científico (aplicar conceptos y teorías para resolver un problema); explicación de fenómenos (construir explicaciones y evaluar la validez de argumentos científicos); indagación (plantear preguntas, procedimientos, variables, interpretar datos y sacar conclusiones). Componentes: biológico, químico, físico y ciencia, tecnología y sociedad.',
  },
  sociales: {
    nombre: 'Sociales y ciudadanas',
    competencias:
      'Competencias evaluadas: pensamiento social (usar conceptos de las ciencias sociales y de la Constitución para analizar situaciones); interpretación y análisis de perspectivas (identificar actores, intereses, posturas y argumentos en una situación o fuente); pensamiento reflexivo y sistémico (evaluar soluciones, usos de fuentes y relaciones entre dimensiones económica, política, cultural y ambiental).',
  },
  ingles: {
    nombre: 'Inglés',
    competencias:
      'La prueba de inglés tiene 7 partes alineadas con el Marco Común Europeo (A-, A1, A2, B1, B+): Parte 1 avisos (dónde se ven: léxico y contexto), Parte 2 vocabulario (emparejar descripciones con palabras), Parte 3 conversaciones cortas (respuesta pragmáticamente adecuada), Parte 4 texto con espacios (gramática), Parte 5 comprensión de lectura literal, Parte 6 comprensión de lectura inferencial, Parte 7 texto con espacios (gramática y léxico en contexto).',
  },
};

// Opciones de respuesta en la prueba de inglés (algunas partes usan A–C, otras A–H o A–D)
const ABC = ['A', 'B', 'C'];
const ABCD = ['A', 'B', 'C', 'D'];
const AH = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const opcionesIngles1 = (n: number) => (n >= 2 && n <= 6 ? AH : n >= 24 ? ABCD : ABC);
const opcionesIngles2 = (n: number) => (n >= 4 && n <= 6 ? AH : n >= 20 ? ABCD : ABC);

export const CUADERNILLOS: Cuadernillo[] = [
  {
    id: 'mat2018',
    area: 'matematicas',
    titulo: 'Cuadernillo de preguntas Saber 11.° — Matemáticas (Icfes, 2018)',
    archivo: '1jLEzn6MFXrO7Ivi2LN32isNhUi6KaoX-',
    examenes: [{ claves: 'ACBCBDBDCCBBDBADBDBACCBCACAACBBDBBCBBCDBDBBBDDBDD' }],
  },
  {
    id: 'lc2018',
    area: 'lectura',
    titulo: 'Cuadernillo de preguntas Saber 11.° — Lectura crítica (Icfes, 2018)',
    archivo: '1K7Wwu9w-wTNZK3ABOFrH_aYUTFWI_AHL',
    examenes: [{ claves: 'BBCDBACBCCCBDBBDBBCBCACCBCBCABDBBCDCDBABCACDCCAAC' }],
  },
  {
    id: 'cn2018',
    area: 'ciencias',
    titulo: 'Cuadernillo de preguntas Saber 11.° — Ciencias naturales (Icfes, 2018)',
    archivo: '1e19ywVOd5vU8FpBBj7NbfFVhGmK7tl9W',
    examenes: [{ claves: 'BCBCCBDACABAAACDDDDAACAABAABCADBBADCDDACBDDAAACCB' }],
  },
  {
    id: 'so2018',
    area: 'sociales',
    titulo: 'Cuadernillo de preguntas Saber 11.° — Sociales y ciudadanas (Icfes, 2018)',
    archivo: '1GFrUSoveTvqSgl1FHhb8xPKdpNgS0DlL',
    examenes: [{ claves: 'BADBCCBCCCACCDBACDDCCCBBCABCADCCCDDCBCCBCCDCBADCD' }],
  },
  {
    id: 'in2018',
    area: 'ingles',
    titulo: 'Cuadernillo de preguntas Saber 11.° — Inglés (Icfes, 2018)',
    archivo: '175a1xRTcDV5X7TfhJ9DNsNhaSMtDakjr',
    examenes: [
      { nombre: 'Examen 1', claves: 'BCFEBGCBCCAABBAAACBCACCDC', opciones: opcionesIngles1 },
      { nombre: 'Examen 2', claves: 'BBCGDFBACBACBACABBBDCBBDA', opciones: opcionesIngles2 },
    ],
  },
];

// ===== Preguntas =====
export interface PreguntaIcfes {
  id: string; // p. ej. «mat2018-14» o «in2018-e2-7»
  cuadernillo: Cuadernillo;
  examen: number; // índice del examen dentro del cuadernillo
  numero: number;
  clave: string;
  opciones: string[];
}

export const PREGUNTAS: PreguntaIcfes[] = CUADERNILLOS.flatMap((c) =>
  c.examenes.flatMap((ex, e) =>
    ex.claves.split('').map((clave, i) => ({
      id: c.examenes.length > 1 ? `${c.id}-e${e + 1}-${i + 1}` : `${c.id}-${i + 1}`,
      cuadernillo: c,
      examen: e,
      numero: i + 1,
      clave,
      opciones: ex.opciones ? ex.opciones(i + 1) : ABCD,
    }))
  )
);
const PREGUNTA_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));
export const buscarPregunta = (id: string) => PREGUNTA_POR_ID.get(String(id || ''));

// ===== Descarga del PDF desde Drive (una vez por cuadernillo) =====
interface Ubicacion {
  pagina: number; // índice desde 0
  y: number; // posición vertical del número de la pregunta (0 = arriba, 1 = abajo)
  contexto?: number; // página donde empieza el texto compartido («RESPONDA LAS PREGUNTAS…»)
}
interface PdfCargado {
  bytes: Uint8Array;
  doc: PDFDocument;
  totalPaginas: number;
  ubicaciones: Map<string, Ubicacion>; // clave «examen-numero»
  paginasCache: Map<number, Uint8Array>;
  contenidos: Map<string, ContenidoPregunta>; // texto de cada pregunta, clave «examen-numero»
}
const cargados = new Map<string, PdfCargado>();
const cargando = new Map<string, Promise<PdfCargado>>();
const erroresCarga = new Map<string, { mensaje: string; cuando: number }>();

async function descargarDeDrive(archivo: string): Promise<Uint8Array> {
  const urls = [
    `https://drive.usercontent.google.com/download?id=${archivo}&export=download&confirm=t`,
    `https://drive.google.com/uc?export=download&id=${archivo}&confirm=t`,
  ];
  let ultimo = '';
  for (const url of urls) {
    try {
      const r = await fetch(url, { redirect: 'follow' });
      if (!r.ok) {
        ultimo = `Drive respondió ${r.status}`;
        continue;
      }
      const buf = new Uint8Array(await r.arrayBuffer());
      // Un PDF empieza con «%PDF». Si llega HTML, la carpeta no está compartida con enlace.
      if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return buf;
      ultimo = 'Drive no entregó un PDF (¿la carpeta está compartida como «Cualquier persona con el enlace»?)';
    } catch (e: any) {
      ultimo = e?.message || String(e);
    }
  }
  throw new Error(ultimo || 'No se pudo descargar el cuadernillo');
}

// Localiza la página de cada pregunta leyendo el texto del PDF con pdf.js
export async function ubicarPreguntas(bytes: Uint8Array, c: Cuadernillo): Promise<{ total: number; ubicaciones: Map<string, Ubicacion>; contenidos: Map<string, ContenidoPregunta> }> {
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const tarea = pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false, useSystemFonts: false, verbosity: 0 });
  const pdf = await tarea.promise;
  const total: number = pdf.numPages;

  // Candidatos: textos con forma «14.» (o «14» seguido de «.») en orden de lectura
  const candidatos: Array<{ num: number; pagina: number; y: number; x: number }> = [];
  const contextos: Array<{ desde: number; hasta: number; pagina: number }> = [];
  const leidas: any[] = []; // páginas leídas para extraer el texto de cada pregunta
  for (let p = 1; p <= total; p++) {
    const pagina = await pdf.getPage(p);
    const vista = pagina.getViewport({ scale: 1 });
    const contenido = await pagina.getTextContent();
    try {
      leidas.push(await leerPaginaPdf(pagina, pdfjs.OPS));
    } catch (e: any) {
      console.log(`[ICFES] ${c.id} p${p}: no se pudieron leer los dibujos (${e?.message || e})`);
      leidas.push({ W: vista.width, H: vista.height, rects: [], items: (contenido.items || []).filter((it: any) => typeof it.str === 'string' && it.str.trim()).map((it: any) => ({ s: it.str, x: it.transform[4], y: vista.height - it.transform[5], w: it.width || 0, t: Math.abs(it.transform[3]) || 9 })) });
    }
    const items: any[] = (contenido.items || []).filter((it: any) => typeof it.str === 'string');
    const textoPagina = items.map((it) => it.str).join(' ').replace(/\s+/g, ' ');
    for (const m of textoPagina.matchAll(/RESPONDA\s+(?:LA|LAS)\s+PREGUNTAS?\s+(\d{1,2})(?:\s*(?:A|Y|-)\s*(\d{1,2}))?/gi)) {
      const desde = Number(m[1]);
      const hasta = Number(m[2] || m[1]);
      if (desde && hasta >= desde) contextos.push({ desde, hasta, pagina: p - 1 });
    }
    for (let i = 0; i < items.length; i++) {
      const s = String(items[i].str).trim();
      let j = i + 1;
      while (j < items.length && !String(items[j].str).trim()) j++;
      const siguiente = String(items[j]?.str ?? '').trim();
      let m = /^(\d{1,2})\s*\.$/.exec(s);
      if (!m && /^\d{1,2}$/.test(s) && siguiente.startsWith('.')) m = /^(\d{1,2})$/.exec(s);
      if (!m) {
        // A veces el número viene pegado al inicio del texto: «9.A. much»
        const pegado = /^(\d{1,2})\.(?=\s*[A-ZÁÉÍÓÚ¿«"“(])/.exec(s);
        if (pegado) m = pegado;
      }
      if (!m) continue;
      const t = items[i].transform || [1, 0, 0, 1, 0, 0];
      candidatos.push({
        num: Number(m[1]),
        pagina: p - 1,
        x: t[4] / vista.width,
        y: Math.min(1, Math.max(0, 1 - t[5] / vista.height)),
      });
    }
  }
let contenidos = new Map<string, ContenidoPregunta>();
  try {
    contenidos = construirPreguntas(leidas, c.examenes);
  } catch (e: any) {
    console.log(`[ICFES] ${c.id}: no se pudo extraer el texto de las preguntas:`, e?.message || e);
  }
  try {
    await pdf.destroy();
  } catch {}

  // Orden de lectura: página y luego de arriba hacia abajo (columna izquierda primero)
  const columna = (x: number) => (x >= 0.5 ? 1 : 0);
  candidatos.sort((a, b) => a.pagina - b.pagina || columna(a.x) - columna(b.x) || a.y - b.y);

  const ubicaciones = new Map<string, Ubicacion>();
  let idx = 0;
  c.examenes.forEach((ex, e) => {
    const n = ex.claves.length;
    let esperado = 1;
    for (; idx < candidatos.length && esperado <= n; idx++) {
      const cand = candidatos[idx];
      // Acepta el número esperado o uno muy cercano (si el PDF partió un número en dos textos)
      if (cand.num === esperado || (cand.num > esperado && cand.num <= esperado + 2 && esperado > 1)) {
        for (let k = esperado; k <= cand.num; k++) {
          if (!ubicaciones.has(`${e}-${k}`)) ubicaciones.set(`${e}-${k}`, { pagina: cand.pagina, y: k === cand.num ? cand.y : 0 });
        }
        esperado = cand.num + 1;
      }
    }
  });

  // Textos compartidos: si «RESPONDA LAS PREGUNTAS 4 A 6» está en una página anterior, se muestra también
  for (const [clave, u] of ubicaciones) {
    const [e, num] = clave.split('-').map(Number);
    const ctx = contextos
      .filter((cx) => num >= cx.desde && num <= cx.hasta && cx.pagina <= u.pagina && u.pagina - cx.pagina <= 2)
      .sort((a, b) => b.pagina - a.pagina)[0];
    if (ctx && ctx.pagina < u.pagina) u.contexto = ctx.pagina;
    // En Inglés los contextos se repiten en los dos exámenes: solo se aceptan los del mismo examen (página posterior al inicio)
    if (e > 0 && u.contexto != null) {
      const inicioExamen = [...ubicaciones.entries()].find(([k]) => k === `${e}-1`)?.[1]?.pagina ?? 0;
      if (u.contexto < inicioExamen) delete u.contexto;
    }
  }
  return { total, ubicaciones, contenidos };
}

export async function cargarCuadernillo(c: Cuadernillo): Promise<PdfCargado> {
  const listo = cargados.get(c.id);
  if (listo) return listo;
  const enCurso = cargando.get(c.id);
  if (enCurso) return enCurso;
  const error = erroresCarga.get(c.id);
  if (error && Date.now() - error.cuando < 60_000) throw new Error(error.mensaje);
  const promesa = (async () => {
    const t0 = Date.now();
    const bytes = bytesPrevios.get(c.archivo) || (await descargarDeDrive(c.archivo));
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    let ubicaciones = new Map<string, Ubicacion>();
    let contenidos = new Map<string, ContenidoPregunta>();
    let total = doc.getPageCount();
    try {
      const r = await ubicarPreguntas(bytes, c);
      ubicaciones = r.ubicaciones;
      contenidos = r.contenidos;
      if (c.dinamico) for (const p of PREGUNTAS) if (p.cuadernillo === c) { const l = r.contenidos.get(`${p.examen}-${p.numero}`)?.letras; if (l?.length) p.opciones = l; }
      total = r.total;
    } catch (e: any) {
      console.log(`[ICFES] No se pudo leer el texto de ${c.id}:`, e?.message || e);
    }
    const cargado: PdfCargado = { bytes, doc, totalPaginas: total, ubicaciones, contenidos, paginasCache: new Map() };
    cargados.set(c.id, cargado);
    erroresCarga.delete(c.id);
    const esperadas = c.examenes.reduce((s, ex) => s + ex.claves.length, 0);
    console.log(`[ICFES] ${c.id}: ${total} páginas, ${ubicaciones.size}/${esperadas} preguntas ubicadas en ${Date.now() - t0} ms`);
    return cargado;
  })();
  cargando.set(c.id, promesa);
  try {
    return await promesa;
  } catch (e: any) {
    erroresCarga.set(c.id, { mensaje: e?.message || 'No se pudo cargar el cuadernillo', cuando: Date.now() });
    throw e;
  } finally {
    cargando.delete(c.id);
  }
}

// Precarga en segundo plano (para que la primera pregunta salga rápido)
export function precargarCuadernillos() {
  // Revisa la carpeta de Drive al arrancar y cada 15 minutos (cuadernillos nuevos o retirados)
  setTimeout(() => sincronizarCarpeta(), 15000);
  setInterval(() => sincronizarCarpeta(), 15 * 60_000);
  CUADERNILLOS.forEach((c, i) => setTimeout(() => cargarCuadernillo(c).catch((e) => console.log(`[ICFES] ${c.id}:`, e?.message || e)), 2000 + i * 1500));
}

export async function paginasDePregunta(p: PreguntaIcfes): Promise<{ paginas: number[]; principal: number; y: number; total: number; ubicada: boolean }> {
  const cargado = await cargarCuadernillo(p.cuadernillo);
  const u = cargado.ubicaciones.get(`${p.examen}-${p.numero}`);
  if (!u) return { paginas: [], principal: 0, y: 0, total: cargado.totalPaginas, ubicada: false };
  const paginas: number[] = [];
  for (let i = u.contexto ?? u.pagina; i <= u.pagina; i++) paginas.push(i);
  return { paginas, principal: u.pagina, y: u.y, total: cargado.totalPaginas, ubicada: true };
}

// PDF de una sola página (lo que ve el estudiante y lo que lee la IA)
export async function pdfDePagina(c: Cuadernillo, indice: number): Promise<Uint8Array> {
  const cargado = await cargarCuadernillo(c);
  if (indice < 0 || indice >= cargado.totalPaginas) throw new Error('Página fuera de rango');
  const enCache = cargado.paginasCache.get(indice);
  if (enCache) return enCache;
  const nuevo = await PDFDocument.create();
  const [copia] = await nuevo.copyPages(cargado.doc, [indice]);
  nuevo.addPage(copia);
  const bytes = await nuevo.save();
  cargado.paginasCache.set(indice, bytes);
  return bytes;
}

export function estadoBanco() {
  return CUADERNILLOS.map((c) => {
    const cargado = cargados.get(c.id);
    return {
      id: c.id,
      area: c.area,
      titulo: c.titulo,
      preguntas: c.examenes.reduce((s, ex) => s + ex.claves.length, 0),
      cargado: !!cargado,
      paginas: cargado?.totalPaginas ?? null,
      ubicadas: cargado?.ubicaciones.size ?? 0,
      conTexto: cargado?.contenidos.size ?? 0,
      error: erroresCarga.get(c.id)?.mensaje ?? null,
    };
  });
}

export function diagnostico(id: string) {
  const c = CUADERNILLOS.find((x) => x.id === id);
  const cargado = c && cargados.get(c.id);
  if (!c || !cargado) return null;
  return Object.fromEntries(
    [...cargado.ubicaciones.entries()].map(([k, u]) => [k, `p${u.pagina + 1}${u.contexto != null ? ` (desde p${u.contexto + 1})` : ''} y=${u.y.toFixed(2)}`])
  );
}


// ===== Extracción de cada pregunta: lectura compartida, enunciado y opciones como texto =====
// Lo que no se puede pasar a texto sin riesgo de deformarlo (gráficas, tablas, fórmulas, imágenes,
// diagramas a dos columnas) se muestra como un RECORTE de esa parte de la página, nunca la página entera.

type Rect4 = [number, number, number, number]; // x, y, ancho, alto (fracciones de la página)
export type BloqueIcfes = { tipo: 'texto'; texto: string; nota?: boolean } | { tipo: 'recorte'; pagina: number; rect: Rect4 };
export interface ContenidoPregunta {
  contexto: { titulo: string; bloques: BloqueIcfes[] } | null;
  enunciado: BloqueIcfes[];
  opciones: Array<{ letra: string; bloques: BloqueIcfes[] }> | null; // null: las opciones van en `recorteOpciones`
  recorteOpciones: BloqueIcfes[] | null;
  letras?: string[]; // letras de respuesta detectadas en la pregunta
}

const mulM = (a: number[], b: number[]) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
const aplicarM = (m: number[], x: number, y: number) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

// Lee una página: textos (y medida desde arriba) y cajas de dibujos/imágenes
export async function leerPaginaPdf(pagina: any, OPS: any) {
  const vista = pagina.getViewport({ scale: 1 });
  const W: number = vista.width, H: number = vista.height;
  const contenido = await pagina.getTextContent();
  const items: any[] = [];
  const girados: any[] = [];
  for (const it of contenido.items || []) {
    if (typeof it.str !== 'string' || !it.str.trim()) continue;
    const t = it.transform || [1, 0, 0, 1, 0, 0];
    if (Math.abs(t[1]) > 0.01 || Math.abs(t[2]) > 0.01) {
      // Texto girado (rótulos de ejes): no va al texto, pero se guarda su caja para no cortarlo en los recortes
      const esc = Math.hypot(t[0], t[1]) || 1;
      const largo = it.width || 0;
      const u = [(t[0] / esc) * largo, (t[1] / esc) * largo];
      const esquinas = [[t[4], t[5]], [t[4] + u[0], t[5] + u[1]], [t[4] + t[2], t[5] + t[3]], [t[4] + u[0] + t[2], t[5] + u[1] + t[3]]];
      girados.push({ x0: Math.min(...esquinas.map((e) => e[0])), x1: Math.max(...esquinas.map((e) => e[0])), y0: H - Math.max(...esquinas.map((e) => e[1])), y1: H - Math.min(...esquinas.map((e) => e[1])) });
      continue;
    }
    const tam = Math.abs(t[3]) || Math.abs(t[0]) || 9;
    items.push({ s: it.str, x: t[4], y: H - t[5], w: it.width || 0, t: tam });
  }
  const ol = await pagina.getOperatorList();
  let ctm = [1, 0, 0, 1, 0, 0];
  const pila: number[][] = [];
  const rects: any[] = [];
  const caja = (m: number[], x0: number, y0: number, x1: number, y1: number, img: boolean, rectangulo = false) => {
    const ps = [aplicarM(m, x0, y0), aplicarM(m, x1, y0), aplicarM(m, x0, y1), aplicarM(m, x1, y1)];
    const xs = ps.map((p) => p[0]), ys = ps.map((p) => H - p[1]);
    rects.push({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys), n: 1, img, rectangulo });
  };
  for (let k = 0; k < ol.fnArray.length; k++) {
    const f = ol.fnArray[k], a = ol.argsArray[k];
    if (f === OPS.save) pila.push(ctm);
    else if (f === OPS.restore) ctm = pila.pop() || ctm;
    else if (f === OPS.transform) ctm = mulM(ctm, a);
    else if (f === OPS.paintFormXObjectBegin) { pila.push(ctm); if (a?.[0]?.length === 6) ctm = mulM(ctm, Array.from(a[0])); }
    else if (f === OPS.paintFormXObjectEnd) ctm = pila.pop() || ctm;
    else if (f === OPS.paintImageXObject || f === OPS.paintInlineImageXObject || f === OPS.paintImageMaskXObject || f === OPS.paintImageXObjectRepeat) caja(ctm, 0, 0, 1, 1, true);
    else if (f === OPS.constructPath) {
      const mm = a?.[2];
      const ops: number[] = Array.from(a?.[0] || []);
      // Recuadro simple: un rectángulo o una línea cerrada de 4 lados (marcos, fondos, rayas)
      const rectangulo = ops.every((o) => o === OPS.rectangle) || (ops.length <= 6 && ops.every((o) => o === OPS.moveTo || o === OPS.lineTo || o === OPS.closePath));
      if (mm && mm.length >= 4 && isFinite(mm[0]) && isFinite(mm[2])) caja(ctm, mm[0], mm[1], mm[2], mm[3], false, rectangulo);
    }
  }
  return { W, H, items, rects, girados };
}

const esMarcaPregunta = (s: string) => /^\d{1,2}\s*\.$/.test(s.trim());
const esLetraOpcion = (s: string) => /^[A-H]\.(\s|$)/.test(s.trim());
const esCorte = (s: string) => /^(PARTE\s+\d+|Examen\s+\d+|Tabla de respuestas|Calle 26)/i.test(s.trim());

// Agrupa textos en líneas (misma altura; se separan si hay un hueco grande: columnas)
function agruparLineas(items: any[]) {
  const filas: any[] = [];
  for (const it of items) {
    const f = filas.find((F) => Math.abs(F.y - it.y) <= Math.max(2.2, it.t * 0.3));
    if (f) f.items.push(it); else filas.push({ y: it.y, items: [it] });
  }
  // Superíndices («14th», «m²»): filas de letra pequeña que quedan justo encima de una línea normal
  filas.sort((a, b) => a.y - b.y);
  for (let i = 0; i < filas.length; i++) {
    const F = filas[i];
    const tMax = Math.max(...F.items.map((it: any) => it.t));
    if (tMax >= 8) continue;
    const abajo = filas.find((G) => G !== F && G.y - F.y > 0.5 && G.y - F.y <= 5 && Math.max(...G.items.map((it: any) => it.t)) > tMax * 1.25 &&
      F.items.every((it: any) => G.items.some((g: any) => it.x >= g.x - 30 && it.x <= g.x + g.w + 30)));
    if (abajo) { abajo.items.push(...F.items); F.items = []; }
  }
  const lineas: any[] = [];
  for (const F of filas.filter((F) => F.items.length)) {
    F.items.sort((a: any, b: any) => a.x - b.x);
    let L: any = null;
    for (const it of F.items) {
      if (L && it.x - L.x1 <= 40) { L.items.push(it); L.x1 = Math.max(L.x1, it.x + it.w); L.t = Math.max(L.t, it.t); L.yTop = Math.min(L.yTop, it.y - it.t * 0.8); L.yBot = Math.max(L.yBot, it.y + it.t * 0.25); }
      else { L = { y: it.y, x0: it.x, x1: it.x + it.w, t: it.t, yTop: it.y - it.t * 0.8, yBot: it.y + it.t * 0.25, items: [it] }; lineas.push(L); }
    }
  }
  return lineas;
}

// Figuras de la página (imágenes, gráficas, tablas) con sus rótulos; y las rayas de fracción
function analizarDibujos(pg: any) {
  const { W, H } = pg;
  const dentro = (it: any, r: any) => it.x >= r.x0 - 2 && it.x + it.w <= r.x1 + 2 && it.y - it.t * 0.7 >= r.y0 - 2 && it.y <= r.y1 + 3;
  const base = pg.rects.filter((r: any) => r.y0 < H - 52 && r.y1 > 40).filter((r: any) => !(r.x1 - r.x0 > W * 0.92 && r.y1 - r.y0 > H * 0.6));
  const barras = base.filter((r: any) => !r.img && r.y1 - r.y0 < 1.6 && r.x1 - r.x0 > 3 && r.x1 - r.x0 < 120);
  let rs = base
    // recuadros simples alrededor de un texto (marcos de lecturas o encabezados): no son figuras
    .filter((r: any) => r.img || !r.rectangulo || !((r.x1 - r.x0) * (r.y1 - r.y0) > 2500 && r.x1 - r.x0 > 150 && pg.items.some((it: any) => dentro(it, r))))
    .map((r: any) => ({ ...r, y1: Math.min(r.y1, H - 52) }));
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (let i = 0; i < rs.length && !cambio; i++) {
      for (let j = i + 1; j < rs.length; j++) {
        const a = rs[i], b = rs[j], m = 5;
        if (a.x0 - m <= b.x1 && b.x0 - m <= a.x1 && a.y0 - m <= b.y1 && b.y0 - m <= a.y1) {
          rs[i] = { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1), n: a.n + b.n, img: a.img || b.img, curva: a.curva || b.curva || !a.rectangulo || !b.rectangulo };
          rs.splice(j, 1); cambio = true; break;
        }
      }
    }
  }
  const figs = rs.filter((r: any) => {
    const w = r.x1 - r.x0, h = r.y1 - r.y0;
    if (w < 28 || h < 18) return false;
    if (r.y1 < 72 || (w > W * 0.88 && h < 80)) return false; // franjas decorativas del encabezado
    if (!r.img && r.n < 3 && !((r.curva || !r.rectangulo) && w >= 40 && h >= 30)) return false;
    const textos = pg.items.filter((it: any) => dentro(it, r));
    if (textos.some((it: any) => /^RESPONDA/.test(it.s.trim()) || (esMarcaPregunta(it.s) && it.x < 140 && it.t >= 8.5))) return false;
    if (!r.img) {
      const lineas = new Set(textos.filter((it: any) => it.t >= 8.5 && it.w > 120).map((it: any) => Math.round(it.y))).size;
      if (lineas >= 6 && r.n < lineas * 1.5) return false; // recuadro alrededor de un texto en prosa
    }
    return true;
  });
  // Rótulos de las figuras (ejes, convenciones, «Tabla», «Figura»): textos cortos pegados a la figura
  const libres = () => pg.items.filter((it: any) => !figs.some((r: any) => dentro(it, r)));
  const todasLineas = agruparLineas(pg.items);
  for (let pasada = 0; pasada < 4; pasada++) {
    let crecio = false;
    for (const L of agruparLineas(libres())) {
      const txt = L.items.map((i: any) => i.s).join(' ').trim();
      if (/^RESPONDA/.test(txt) || esMarcaPregunta(L.items[0].s) || esLetraOpcion(L.items[0].s)) continue;
      // Última línea de un párrafo (debajo de un renglón largo alineado): es texto, no rótulo
      if (todasLineas.some((P: any) => P !== L && P.x1 - P.x0 >= 250 && L.y - P.y > 0 && L.y - P.y < L.t * 1.7 && P.x0 <= L.x0 + 6 && P.x1 > L.x1 + 40)) continue;
      const corta = L.x1 - L.x0 < 150 || L.t < 8;
      if (!corta) continue;
      for (const r of figs) {
        const gapV = Math.max(r.y0 - L.yBot, L.yTop - r.y1, 0);
        const gapH = Math.max(r.x0 - L.x1, L.x0 - r.x1, 0);
        if ((gapV <= 12 && gapH <= 25) || (gapH <= 60 && gapV <= 2)) {
          r.x0 = Math.min(r.x0, L.x0 - 1); r.x1 = Math.max(r.x1, L.x1 + 1); r.y0 = Math.min(r.y0, L.yTop - 1); r.y1 = Math.max(r.y1, L.yBot + 1);
          crecio = true;
          break;
        }
      }
    }
    if (!crecio) break;
  }
  return { figs, barras, dentroFig: (it: any) => figs.some((r: any) => dentro(it, r)) };
}

// Renglones de una página en orden de lectura (texto o figura); marca los que llevan fórmulas
function renglonesDePagina(pg: any, indice: number) {
  const { figs, barras, dentroFig } = analizarDibujos(pg);
  const items = pg.items
    .filter((it: any) => it.y > 40 && it.y < pg.H - 40)
    .filter((it: any) => !(it.y > pg.H - 60 && /^\d{1,3}$/.test(it.s.trim())))
    .filter((it: any) => !dentroFig(it))
    .sort((a: any, b: any) => a.y - b.y || a.x - b.x);
  const res: any[] = agruparLineas(items).map((L: any) => {
    // Fórmulas: subíndices/superíndices, rayas de fracción o radicales en la línea
    const indices = L.items.some((it: any) => it.t < L.t * 0.8 && Math.abs(it.y - L.y) > 1.2 && !/^(\d{1,2}|th|st|nd|rd|er|o|a|°)$/i.test(it.s.trim()));
    const fraccion = barras.some((b: any) => b.x0 < L.x1 && b.x1 > L.x0 && b.y0 > L.yTop - 9 && b.y0 < L.yBot + 9);
    const suelta = L.items.length >= 3 && L.items.filter((it: any) => it.s.trim().length <= 2).length / L.items.length > 0.6;
    const mate = indices || fraccion || suelta || L.items.some((it: any) => /[√∑∫]/.test(it.s));
    return { tipo: 'texto', pagina: indice, y: L.y, yTop: L.yTop, yBot: L.yBot, x0: L.x0, x1: L.x1, t: L.t, items: L.items, mate };
  });
  // Números apilados (fracciones o exponentes escritos como dos renglones muy juntos): también son fórmulas
  const textosPag = res.filter((r) => r.tipo === 'texto');
  for (const a of textosPag)
    for (const b of textosPag) {
      if (a === b) continue;
      const d = Math.abs(a.y - b.y);
      if (d > 2.2 && d < Math.min(a.t, b.t) * 0.95 && a.x0 < b.x1 && b.x0 < a.x1) {
        a.mate = true;
        b.mate = true;
      }
    }
  for (const r of figs) res.push({ tipo: 'figura', pagina: indice, y: r.y0 + Math.min((r.y1 - r.y0) / 2, 12), yTop: r.y0, yBot: r.y1, x0: r.x0, x1: r.x1 });
  res.sort((a, b) => a.y - b.y || a.x0 - b.x0);
  return res.map((r) => ({ ...r, W: pg.W, H: pg.H }));
}

const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function textoDeLinea(L: any) {
  let s = '';
  let finAnt: number | null = null;
  // Línea base: la del texto de mayor tamaño
  const yBase = L.items.reduce((a: any, b: any) => (b.t > a.t ? b : a), L.items[0])?.y ?? L.y;
  for (const it of L.items) {
    const str = it.s;
    // Números pequeños: subíndices (CO₂, MgSO₄) o superíndices (m², notas al pie¹)
    if (it.t < L.t * 0.8 && /^[\d+\-−]{1,3}$/.test(str.trim())) {
      const baja = it.y > yBase + 0.8;
      const mapa = baja ? SUB : SUP;
      s += str.trim().replace(/\d/g, (d: string) => mapa[+d]).replace(/\+/g, baja ? '₊' : '⁺').replace(/[-−]/g, baja ? '₋' : '⁻');
      finAnt = it.x + it.w;
      continue;
    }
    if (finAnt != null && it.x - finAnt > it.t * 0.12 && !/\s$/.test(s) && !/^\s/.test(str)) s += ' ';
    s += str;
    finAnt = it.x + it.w;
  }
  return s.replace(/\s+/g, ' ').trim();
}

// Recorte (por página) que encierra unos renglones
function recortes(renglones: any[], margen = 4): BloqueIcfes[] {
  const porPagina = new Map<number, any[]>();
  for (const r of renglones) porPagina.set(r.pagina, [...(porPagina.get(r.pagina) || []), r]);
  return [...porPagina.entries()].map(([pagina, rs]) => {
    const W = rs[0].W, H = rs[0].H;
    const x0 = Math.max(0, Math.min(...rs.map((r) => r.x0)) - margen), x1 = Math.min(W, Math.max(...rs.map((r) => r.x1)) + margen);
    const y0 = Math.max(0, Math.min(...rs.map((r) => r.yTop)) - margen), y1 = Math.min(H, Math.max(...rs.map((r) => r.yBot)) + margen);
    return { tipo: 'recorte' as const, pagina, rect: [x0 / W, y0 / H, (x1 - x0) / W, (y1 - y0) / H] as Rect4 };
  });
}

// Párrafos: une renglones, corrige guiones de partición, respeta versos; fórmulas y figuras → recorte
function parrafos(renglones: any[]): BloqueIcfes[] {
  // Si hay fórmulas, todo el bloque va como recorte: así ninguna fracción queda partida
  if (renglones.some((r) => r.tipo === 'texto' && r.mate)) return recortes(renglones);
  const grupos: any[][] = [];
  let actual: any[] | null = null;
  let ant: any = null;
  for (const r of renglones) {
    if (r.tipo === 'figura') { grupos.push([r]); actual = null; ant = null; continue; }
    if (!textoDeLinea(r)) continue;
    const nuevo = !actual || !ant || r.pagina !== ant.pagina || r.y - ant.y > Math.max(ant.t, r.t) * 1.55 || Math.abs(r.t - ant.t) > 1.5;
    if (nuevo) { actual = [r]; grupos.push(actual); } else actual!.push(r);
    ant = r;
  }
  const anchoMax = Math.max(0, ...renglones.filter((r) => r.tipo === 'texto').map((r) => r.x1));
  const salida: BloqueIcfes[] = [];
  for (const g of grupos) {
    if (g[0].tipo === 'figura' || g.some((r) => r.mate)) { salida.push(...recortes(g, g[0].tipo === 'figura' ? 2 : 4)); continue; }
    let texto = '';
    g.forEach((r, i) => {
      const txt = textoDeLinea(r);
      if (i === 0) texto = txt;
      else if (/[a-záéíóúñü]-$/i.test(texto) && /^[a-záéíóúñü]/.test(txt)) texto = texto.slice(0, -1) + txt;
      else {
        const prev = g[i - 1];
        const ancho = anchoMax - Math.min(...g.map((r) => r.x0));
        const corta = prev.x1 < anchoMax - 45;
        const muyCorta = prev.x1 - prev.x0 < ancho * 0.45;
        const cierre = /[.:;?!…»"”’)]$/.test(texto);
        const inicioLista = /^([IVX]{1,4}\.|Paso\s+\d|Proceso\s+\d|[•●▪◦–-]\s|\(?[ivx]{1,4}\)|\d{1,2}[.)]\s)/.test(txt);
        texto += ((corta && (muyCorta || cierre || /^[A-ZÁÉÍÓÚÑ¿¡«"“(\d]/.test(txt))) || inicioLista ? '\n' : ' ') + txt;
      }
    });
    salida.push({ tipo: 'texto', texto, ...(g[0].t < 8 ? { nota: true } : {}) });
  }
  // Une recortes consecutivos de la misma página que quedan pegados (una fórmula de varias líneas)
  const unidos: BloqueIcfes[] = [];
  for (const b of salida) {
    const u = unidos[unidos.length - 1];
    if (b.tipo === 'recorte' && u?.tipo === 'recorte' && u.pagina === b.pagina && b.rect[1] - (u.rect[1] + u.rect[3]) < 0.02) {
      const x0 = Math.min(u.rect[0], b.rect[0]), y0 = u.rect[1], x1 = Math.max(u.rect[0] + u.rect[2], b.rect[0] + b.rect[2]), y1 = Math.max(u.rect[1] + u.rect[3], b.rect[1] + b.rect[3]);
      u.rect = [x0, y0, x1 - x0, y1 - y0];
    } else unidos.push(b);
  }
  return unidos;
}

// ¿Hay texto a dos columnas (p. ej. descripciones a la izquierda y palabras a la derecha)?
const tieneColumnas = (renglones: any[]) => {
  const textos = renglones.filter((r) => r.tipo === 'texto');
  let pares = 0;
  for (let i = 0; i < textos.length; i++) for (let j = i + 1; j < textos.length; j++) {
    const a = textos[i], b = textos[j];
    if (a.pagina === b.pagina && Math.abs(a.y - b.y) < 2.5 && Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1) > 40) pares++;
  }
  // Opciones o ejemplos («A.», «0.») escritos al lado de una imagen
  for (const f of renglones.filter((r) => r.tipo === 'figura'))
    for (const L of textos)
      if (L.pagina === f.pagina && L.y > f.yTop && L.y < f.yBot + 4 && (L.x0 > f.x1 + 10 || L.x1 < f.x0 - 10) && /^([A-H]|0)\./.test(L.items[0].s.trim())) pares++;
  return pares >= 2;
};

// Separa enunciado y opciones; si la disposición no es lineal, devuelve null (se recortan)
function separarOpciones(renglones: any[], letras: string[]) {
  const enunciado: any[] = [];
  const opciones: Array<{ letra: string; renglones: any[] }> = [];
  let actual: any = null;
  let primeraOpcion = -1;
  let ok = true;
  let enFila = false;
  renglones.forEach((r, idx) => {
    if (r.tipo === 'figura') { if (actual) ok = false; else enunciado.push(r); return; }
    // Trozos de la fila separados por las marcas de opción esperadas («A. much  B. many  C. a lot»)
    const trozos: Array<{ letra: string | null; items: any[] }> = [];
    let tr: { letra: string | null; items: any[] } | null = null;
    let nuevas = 0;
    for (const it of r.items) {
      const m = /^([A-H])\.\s*(.*)$/.exec(it.s.trim());
      const esperado = letras[opciones.length + nuevas];
      if (m && m[1] === esperado) {
        if (tr) trozos.push(tr);
        tr = { letra: m[1], items: m[2] ? [{ ...it, s: m[2] }] : [] };
        nuevas++;
      } else {
        if (!tr) tr = { letra: null, items: [] };
        tr.items.push(it);
      }
    }
    if (tr) trozos.push(tr);
    if (nuevas > 1) enFila = true;
    for (const t of trozos) {
      const reng = { ...r, items: t.items, x0: t.items[0]?.x ?? r.x0, x1: t.items.length ? Math.max(...t.items.map((i: any) => i.x + i.w)) : r.x1 };
      if (t.letra) {
        if (primeraOpcion < 0) primeraOpcion = idx;
        actual = { letra: t.letra, renglones: [] };
        opciones.push(actual);
        if (t.items.length) actual.renglones.push(reng);
      } else if (t.items.length) {
        if (actual) {
          if (enFila) ok = false; // cuadrícula de opciones con texto de varias líneas: no se puede asegurar el orden
          actual.renglones.push(reng);
        } else enunciado.push(reng);
      }
    }
  });
  if (opciones.length !== letras.length || opciones.some((o) => !o.renglones.length)) ok = false;
  return { enunciado, opciones, ok, primeraOpcion };
}

// Construye el contenido de todas las preguntas de un cuadernillo
export function construirPreguntas(paginas: any[], examenes: Array<{ claves: string; opciones?: (n: number) => string[] }>) {
  const todos: any[] = [];
  paginas.forEach((pg, i) => todos.push(...renglonesDePagina(pg, i)));
  const marcas: any[] = [];
  todos.forEach((r, idx) => {
    if (r.tipo !== 'texto') return;
    const primero = r.items[0];
    const s = primero.s.trim();
    const linea = textoDeLinea(r);
    if (esCorte(linea)) { marcas.push({ tipo: 'corte', idx }); return; }
    const ctx = /^RESPONDA\s+(?:LA|LAS)\s+PREGUNTAS?\s+(\d{1,2})(?:\s*(?:A|Y|-)\s*(\d{1,2}))?/i.exec(linea);
    if (ctx) { marcas.push({ tipo: 'ctx', idx, desde: Number(ctx[1]), hasta: Number(ctx[2] || ctx[1]) }); return; }
    let m = /^(\d{1,2})\s*\.$/.exec(s);
    if (!m && /^\d{1,2}$/.test(s) && (r.items[1]?.s || '').trim().startsWith('.')) m = /^(\d{1,2})$/.exec(s);
    if (!m) m = /^(\d{1,2})\.(?=\s*[A-ZÁÉÍÓÚ¿«"“(])/.exec(s);
    if (m && primero.t >= 8 && primero.x < 140) marcas.push({ tipo: 'num', idx, num: Number(m[1]), pegado: s.length > m[0].length });
  });
  const marcasPreg: any[] = [];
  let k = 0;
  examenes.forEach((ex, e) => {
    let esperado = 1;
    for (; k < marcas.length && esperado <= ex.claves.length; k++) {
      const mk = marcas[k];
      if (mk.tipo === 'num' && mk.num === esperado) { marcasPreg.push({ ...mk, examen: e }); esperado++; }
    }
  });
  // Numeradores o exponentes del enunciado que quedan justo encima del número de la pregunta
  for (const mp of marcasPreg) {
    mp.idxNum = mp.idx;
    let ini = mp.idx;
    const fila = todos[mp.idxNum];
    while (ini - 1 >= 0 && todos[ini - 1].tipo === 'texto' && todos[ini - 1].mate && todos[ini - 1].x1 - todos[ini - 1].x0 < 120 && todos[ini - 1].pagina === fila.pagina && fila.yTop - todos[ini - 1].yBot < 14 && !marcas.some((x) => x.idx === ini - 1)) ini--;
    mp.idx = ini;
  }
  const limites = [...marcas.filter((m) => m.tipo !== 'num'), ...marcasPreg].sort((a, b) => a.idx - b.idx);
  const fin = (pos: number) => limites.find((m) => m.idx > pos)?.idx ?? todos.length;
  const contextos = marcas.filter((m) => m.tipo === 'ctx').map((m) => {
    const rs = todos.slice(m.idx + 1, fin(m.idx));
    const bloques = tieneColumnas(rs) ? recortes(rs) : parrafos(rs);
    return { ...m, titulo: textoDeLinea(todos[m.idx]), bloques };
  });
  const resultado = new Map<string, ContenidoPregunta>();
  const letrasDe = new Map<string, string[]>();
  for (const mp of marcasPreg) {
    const ex = examenes[mp.examen];
    let letras = ex.opciones ? ex.opciones(mp.num) : ['A', 'B', 'C', 'D'];
    const reng = todos.slice(mp.idx, fin(mp.idx)).map((r) => {
      if (r !== todos[mp.idxNum]) return r;
      const items = r.items.slice();
      if (mp.pegado) items[0] = { ...items[0], s: items[0].s.trim().replace(/^\d{1,2}\./, '') };
      else { items.shift(); if ((items[0]?.s || '').trim() === '.') items.shift(); }
      const its = items.filter((it: any) => it.s.trim());
      return { ...r, items: its, x0: its[0]?.x ?? r.x0 };
    }).filter((r) => r.tipo === 'figura' || r.items.length);
    // Cuadernillos nuevos (sin tabla de opciones): las letras se deducen de la clave y de la pregunta
    if (!ex.opciones) {
      const clave = ex.claves[mp.num - 1] || 'A';
      if (clave > 'D') letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      else if (!separarOpciones(reng, letras).ok && separarOpciones(reng, ['A', 'B', 'C']).ok) letras = ['A', 'B', 'C'];
    }
    letrasDe.set(`${mp.examen}-${mp.num}`, letras);
    const inicioEx = marcasPreg.find((x) => x.examen === mp.examen && x.num === 1)?.idx ?? 0;
    const ctx = contextos
      .filter((cx) => cx.idx < mp.idx && mp.num >= cx.desde && mp.num <= cx.hasta && (mp.examen === 0 || cx.idx > inicioEx - 40))
      .sort((a, b) => b.idx - a.idx)[0];
    const contexto = ctx ? { titulo: ctx.titulo, bloques: ctx.bloques } : null;
    // Preguntas de emparejar (A–H): descripción a la izquierda y lista de palabras a la derecha
    if (letras.length > 4 && ctx) {
      const W = reng[0]?.W || 612;
      const ultimo = marcasPreg.filter((x) => x.examen === mp.examen && x.num <= ctx.hasta).sort((a, b) => b.idx - a.idx)[0];
      const zona = todos.slice(ctx.idx + 1, fin(ultimo?.idx ?? mp.idx));
      const lista = new Map<string, string>();
      for (const r of zona) {
        if (r.tipo !== 'texto' || r.x0 < W * 0.45) continue;
        const m = /^([A-H])\.\s*(.+)$/.exec(textoDeLinea(r));
        if (m && !lista.has(m[1])) lista.set(m[1], m[2]);
      }
      const izquierda = (rs: any[]) => rs.filter((r) => r.x1 <= W * 0.55 || r.tipo === 'figura');
      const ctxFiltrado = parrafos(izquierda(todos.slice(ctx.idx + 1, fin(ctx.idx))));
      if (lista.size === letras.length) {
        resultado.set(`${mp.examen}-${mp.num}`, {
          contexto: { titulo: ctx.titulo, bloques: ctxFiltrado },
          enunciado: parrafos(izquierda(reng)),
          opciones: letras.map((l) => ({ letra: l, bloques: [{ tipo: 'texto' as const, texto: lista.get(l) || '' }] })),
          recorteOpciones: null,
        });
        continue;
      }
    }
    if (letras.length > 4) {
      resultado.set(`${mp.examen}-${mp.num}`, { contexto, enunciado: tieneColumnas(reng) ? recortes(reng) : parrafos(reng), opciones: null, recorteOpciones: null });
      continue;
    }
    const sep = separarOpciones(reng, letras);
    // Opciones con fórmulas: se muestran recortadas completas (texto partido = riesgo de error)
    const hayMate = sep.opciones.some((o) => o.renglones.some((r: any) => r.tipo === 'texto' && r.mate));
    if (!sep.ok && tieneColumnas(reng)) {
      resultado.set(`${mp.examen}-${mp.num}`, { contexto, enunciado: recortes(reng), opciones: null, recorteOpciones: null });
      continue;
    }
    if (sep.ok && !hayMate && tieneColumnas(sep.enunciado)) {
      resultado.set(`${mp.examen}-${mp.num}`, {
        contexto,
        enunciado: recortes(sep.enunciado),
        opciones: sep.opciones.map((o) => ({ letra: o.letra, bloques: parrafos(o.renglones) })),
        recorteOpciones: null,
      });
      continue;
    }
    if (sep.ok && !hayMate) {
      resultado.set(`${mp.examen}-${mp.num}`, {
        contexto,
        enunciado: parrafos(sep.enunciado),
        opciones: sep.opciones.map((o) => ({ letra: o.letra, bloques: parrafos(o.renglones) })),
        recorteOpciones: null,
      });
    } else {
      const corte = sep.primeraOpcion >= 0 ? sep.primeraOpcion : reng.length;
      const enun = reng.slice(0, corte);
      const opc = reng.slice(corte);
      // Numeradores o exponentes de la opción A que quedaron justo encima de la letra
      while (enun.length && enun[enun.length - 1].tipo === 'texto' && enun[enun.length - 1].mate && enun[enun.length - 1].x1 - enun[enun.length - 1].x0 < 120 && opc[0] && opc[0].pagina === enun[enun.length - 1].pagina && opc[0].yTop - enun[enun.length - 1].yBot < 14) opc.unshift(enun.pop());
      resultado.set(`${mp.examen}-${mp.num}`, {
        contexto,
        enunciado: enun.length ? parrafos(enun) : [],
        opciones: null,
        recorteOpciones: opc.length ? recortes(opc) : null,
      });
    }
  }
  for (const [k, c] of resultado) c.letras = letrasDe.get(k);
  // Quita las instrucciones de la hoja de respuestas y los rangos de números del cuadernillo
  // (el estudiante ve otra numeración y no usa hoja de respuestas)
  const limpiar = (bs: BloqueIcfes[]) =>
    bs
      .map((b) => (b.tipo !== 'texto' ? b : { ...b, texto: b.texto.split('\n').filter((l) => !/hoja de respuestas/i.test(l)).map((l) => l.replace(/\s*\(\s*\d{1,2}\s*[-–]\s*\d{1,2}\s*\)/g, '')).join('\n').trim() }))
      .filter((b) => b.tipo !== 'texto' || b.texto);
  // Ajusta cada recorte para que ningún texto ni trazo quede partido en el borde:
  // rótulos y fórmulas que asoman se incluyen completos; renglones de prosa que asoman se dejan por fuera
  const ajustar = (bl: BloqueIcfes): BloqueIcfes => {
    if (bl.tipo !== 'recorte') return bl;
    const pg = paginas[bl.pagina];
    if (!pg) return bl;
    let x0 = bl.rect[0] * pg.W, y0 = bl.rect[1] * pg.H, x1 = x0 + bl.rect[2] * pg.W, y1 = y0 + bl.rect[3] * pg.H;
    const orig = [x0, y0, x1, y1];
    x0 -= 2; y0 -= 2; x1 += 2; y1 += 2; // pequeño margen (luego se recortan los renglones que asomen)
    const cajas: any[] = [
      ...pg.items.map((it: any) => ({ x0: it.x, x1: it.x + it.w, y0: it.y - it.t * 0.78, y1: it.y + it.t * 0.22, texto: true })),
      ...pg.rects.filter((r: any) => !r.img && r.x1 - r.x0 < 300 && r.y1 - r.y0 < 300 && r.y0 < pg.H - 52 && !(r.rectangulo && (r.x1 - r.x0) * (r.y1 - r.y0) > 2500)).map((r: any) => ({ ...r, texto: false })),
      ...(pg.girados || []).map((g: any) => ({ ...g, texto: false, girado: true })),
    ];
    for (let k = 0; k < 8; k++) {
      let cambio = false;
      for (const o of cajas) {
        const mg = o.girado ? 12 : 0; // los rótulos girados que quedan pegados al borde también se incluyen
        const ix = Math.min(x1 + mg, o.x1) - Math.max(x0 - mg, o.x0), iy = Math.min(y1 + mg, o.y1) - Math.max(y0 - mg, o.y0);
        if (ix <= 0.5 || iy <= 0.5) continue;
        const fracH = ix / Math.max(1, o.x1 - o.x0);
        if (o.x0 >= x0 - 1 && o.x1 <= x1 + 1 && o.y0 >= y0 - 1.5 && o.y1 <= y1 + 1.5) continue;
        const fracV = iy / Math.max(1, o.y1 - o.y0);
        if (!o.texto || (o.x1 - o.x0 < 150 && fracV >= 0.35) || (fracV >= 0.6 && fracH >= 0.4)) {
          x0 = Math.min(x0, o.x0 - 1); x1 = Math.max(x1, o.x1 + 1); y0 = Math.min(y0, o.y0 - 1); y1 = Math.max(y1, o.y1 + 1);
        } else if (fracV <= fracH) {
          if ((o.y0 + o.y1) / 2 < (y0 + y1) / 2) y0 = o.y1 + 0.5; else y1 = o.y0 - 0.5;
        } else {
          if ((o.x0 + o.x1) / 2 < (x0 + x1) / 2) x0 = o.x1 + 0.5; else x1 = o.x0 - 0.5;
        }
        cambio = true;
      }
      if (!cambio) break;
    }
    if (x1 - x0 < 8 || y1 - y0 < 6) [x0, y0, x1, y1] = orig;
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(pg.W, x1); y1 = Math.min(pg.H, y1);
    return { ...bl, rect: [x0 / pg.W, y0 / pg.H, (x1 - x0) / pg.W, (y1 - y0) / pg.H] };
  };
  const ajustarTodo = (bs: BloqueIcfes[]) => bs.map(ajustar);
  const ctxAjustados = new Map<any, BloqueIcfes[]>();
  for (const [, c] of resultado) {
    if (c.contexto) {
      const original = c.contexto.bloques;
      if (!ctxAjustados.has(original)) ctxAjustados.set(original, ajustarTodo(limpiar(original)));
      c.contexto = { ...c.contexto, bloques: ctxAjustados.get(original)! };
    }
    c.enunciado = ajustarTodo(limpiar(c.enunciado));
    if (c.opciones) c.opciones = c.opciones.map((o) => ({ ...o, bloques: ajustarTodo(o.bloques) }));
    if (c.recorteOpciones) c.recorteOpciones = ajustarTodo(c.recorteOpciones);
  }
  return resultado;
}

// Versión en texto plano para la IA (las partes recortadas se señalan; la IA las ve en la página adjunta)
export function contenidoComoTexto(c: ContenidoPregunta) {
  const b = (bs: BloqueIcfes[]) => bs.map((x) => (x.tipo === 'texto' ? x.texto : '[figura, tabla o fórmula: mírala en la página adjunta]')).join('\n\n');
  return [
    c.contexto ? `TEXTO O SITUACIÓN (${c.contexto.titulo}):\n${b(c.contexto.bloques)}` : '',
    `ENUNCIADO:\n${b(c.enunciado)}`,
    c.opciones ? `OPCIONES:\n${c.opciones.map((o) => `${o.letra}. ${b(o.bloques)}`).join('\n')}` : 'OPCIONES: [están en la página adjunta]',
  ].filter(Boolean).join('\n\n');
}

// Contenido ya extraído de una pregunta (lectura, enunciado, opciones)
export async function contenidoDePregunta(p: PreguntaIcfes): Promise<ContenidoPregunta | null> {
  const cargado = await cargarCuadernillo(p.cuadernillo);
  return cargado.contenidos.get(`${p.examen}-${p.numero}`) || null;
}


// ===== Sincronización con la carpeta de Drive =====
// Cada 15 minutos (y al arrancar) se revisa la carpeta «Interlocutor Crítico – Banco ICFES».
// Cada PDF nuevo se agrega solo: el área se toma del nombre del archivo (o de la portada) y las claves
// oficiales de la «Tabla de respuestas» que traen los cuadernillos del ICFES al final.
// Los cinco cuadernillos de arriba (verificados a mano) se conservan siempre.
export const CARPETA_DRIVE = '1PPs4jeb3oc5H6pslkrTnyeU4SYaMJJQd';
const bytesPrevios = new Map<string, Uint8Array>(); // PDF ya descargado al sincronizar (evita bajarlo dos veces)
const estadoSync: { ultima: string | null; error: string | null; archivos: Array<{ nombre: string; archivo: string; estado: string; preguntas?: number }> } = {
  ultima: null,
  error: null,
  archivos: [],
};
let sincronizando: Promise<any> | null = null;

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function areaDeTexto(t: string) {
  const s = sinTildes(t);
  if (/matemat/.test(s)) return 'matematicas';
  if (/lectura|critica/.test(s)) return 'lectura';
  if (/ingles|english/.test(s)) return 'ingles';
  if (/social|ciudadan/.test(s)) return 'sociales';
  if (/ciencias|naturales|biolog|quimic|fisica/.test(s)) return 'ciencias';
  return '';
}

async function listarCarpeta(): Promise<Array<{ archivo: string; nombre: string }>> {
  const r = await fetch(`https://drive.google.com/embeddedfolderview?id=${CARPETA_DRIVE}`, { redirect: 'follow' });
  if (!r.ok) throw new Error(`Drive respondió ${r.status} al abrir la carpeta (¿está compartida como «Cualquier persona con el enlace»?)`);
  const html = await r.text();
  const archivos: Array<{ archivo: string; nombre: string }> = [];
  const re = /id="entry-([\w-]{20,})"[\s\S]*?\/type\/([^"]+)"[\s\S]*?class="flip-entry-title">([^<]*)</g;
  for (const m of html.matchAll(re)) {
    if (!/pdf/i.test(m[2])) continue; // solo PDF (se ignoran subcarpetas y otros archivos)
    const nombre = m[3].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
    archivos.push({ archivo: m[1], nombre });
  }
  return archivos;
}

// Lee la «Tabla de respuestas» del final del cuadernillo: una cadena de claves por examen
async function leerClaves(bytes: Uint8Array): Promise<{ examenes: string[]; portada: string }> {
  const pdfjs: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const pdf = await pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false, useSystemFonts: false, verbosity: 0 }).promise;
  const total: number = pdf.numPages;
  let portada = '';
  const pares: Array<{ n: number; letra: string; pagina: number; col: number; y: number }> = [];
  try {
    for (let p = 1; p <= Math.min(2, total); p++) {
      const tc = await (await pdf.getPage(p)).getTextContent();
      portada += ' ' + tc.items.map((it: any) => it.str).join(' ');
    }
    for (let p = Math.max(1, total - 7); p <= total; p++) {
      const pagina = await pdf.getPage(p);
      const H = pagina.getViewport({ scale: 1 }).height;
      const tc = await pagina.getTextContent();
      const items = tc.items.filter((it: any) => typeof it.str === 'string' && it.str.trim());
      if (!/tabla\s+de\s+respuestas/.test(sinTildes(items.map((it: any) => it.str).join(' ')))) continue;
      const pos = (it: any) => ({ x: it.transform[4], y: H - it.transform[5], w: it.width || 0 });
      const numeros = items.filter((it: any) => /^\d{1,3}$/.test(it.str.trim())).map((it: any) => ({ n: Number(it.str.trim()), ...pos(it) })).filter((q: any) => q.y < H - 50);
      const letras = items.filter((it: any) => /^[A-H]$/.test(it.str.trim())).map((it: any) => ({ letra: it.str.trim(), ...pos(it) }));
      for (const l of letras) {
        const cand = numeros.filter((q: any) => Math.abs(q.y - l.y) < 3 && q.x < l.x && l.x - q.x < 110).sort((a: any, b: any) => b.x - a.x)[0];
        if (cand) pares.push({ n: cand.n, letra: l.letra, pagina: p, col: Math.round(cand.x / 25), y: l.y });
      }
    }
  } finally {
    try {
      await pdf.destroy();
    } catch {}
  }
  pares.sort((a, b) => a.pagina - b.pagina || a.col - b.col || a.y - b.y);
  const examenes: string[] = [];
  let actual = '';
  let esperado = 1;
  for (const q of pares) {
    if (q.n === 1 && actual) { examenes.push(actual); actual = ''; esperado = 1; }
    if (q.n !== esperado) continue; // número fuera de orden: se ignora
    actual += q.letra;
    esperado++;
  }
  if (actual) examenes.push(actual);
  return { examenes: examenes.filter((e) => e.length >= 5), portada };
}

function preguntasDe(c: Cuadernillo): PreguntaIcfes[] {
  return c.examenes.flatMap((ex, e) =>
    ex.claves.split('').map((clave, i) => ({
      id: c.examenes.length > 1 ? `${c.id}-e${e + 1}-${i + 1}` : `${c.id}-${i + 1}`,
      cuadernillo: c,
      examen: e,
      numero: i + 1,
      clave,
      opciones: ex.opciones ? ex.opciones(i + 1) : clave > 'D' ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] : ['A', 'B', 'C', 'D'],
    }))
  );
}

function quitarCuadernillo(c: Cuadernillo) {
  const i = CUADERNILLOS.indexOf(c);
  if (i >= 0) CUADERNILLOS.splice(i, 1);
  for (let k = PREGUNTAS.length - 1; k >= 0; k--) {
    if (PREGUNTAS[k].cuadernillo === c) {
      PREGUNTA_POR_ID.delete(PREGUNTAS[k].id);
      PREGUNTAS.splice(k, 1);
    }
  }
  cargados.delete(c.id);
}

async function sincronizarAhora() {
  const enCarpeta = await listarCarpeta();
  const fijos = new Set(CUADERNILLOS.filter((c) => !c.dinamico).map((c) => c.archivo));
  const informe: typeof estadoSync.archivos = [];
  // Cuadernillos que ya no están en la carpeta: se retiran
  for (const c of CUADERNILLOS.filter((c) => c.dinamico && !enCarpeta.some((a) => a.archivo === c.archivo))) quitarCuadernillo(c);
  for (const a of enCarpeta) {
    if (fijos.has(a.archivo)) {
      informe.push({ nombre: a.nombre, archivo: a.archivo, estado: 'verificado (incluido desde el inicio)' });
      continue;
    }
    const ya = CUADERNILLOS.find((c) => c.archivo === a.archivo);
    if (ya) {
      informe.push({ nombre: a.nombre, archivo: a.archivo, estado: 'activo', preguntas: PREGUNTAS.filter((p) => p.cuadernillo === ya).length });
      continue;
    }
    try {
      const bytes = await descargarDeDrive(a.archivo);
      const { examenes, portada } = await leerClaves(bytes);
      const area = areaDeTexto(a.nombre) || areaDeTexto(portada);
      if (!area) {
        informe.push({ nombre: a.nombre, archivo: a.archivo, estado: 'sin agregar: no reconocí el área. Pon en el nombre del archivo Matemáticas, Lectura crítica, Ciencias naturales, Sociales o Inglés.' });
        continue;
      }
      if (!examenes.length) {
        informe.push({ nombre: a.nombre, archivo: a.archivo, estado: 'sin agregar: no encontré la «Tabla de respuestas» con las claves oficiales al final del PDF.' });
        continue;
      }
      const c: Cuadernillo = {
        id: 'd' + a.archivo.replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toLowerCase(),
        area,
        titulo: a.nombre.replace(/\.pdf$/i, ''),
        archivo: a.archivo,
        dinamico: true,
        examenes: examenes.map((claves, i) => ({ ...(examenes.length > 1 ? { nombre: `Examen ${i + 1}` } : {}), claves })),
      };
      bytesPrevios.set(a.archivo, bytes);
      CUADERNILLOS.push(c);
      const nuevas = preguntasDe(c);
      PREGUNTAS.push(...nuevas);
      nuevas.forEach((p) => PREGUNTA_POR_ID.set(p.id, p));
      try {
        await cargarCuadernillo(c);
      } catch (e: any) {
        quitarCuadernillo(c);
        throw e;
      }
      const cargado = cargados.get(c.id);
      // Solo quedan las preguntas que se pudieron ubicar en el PDF
      for (const p of nuevas) {
        if (!cargado?.ubicaciones.has(`${p.examen}-${p.numero}`)) {
          const k = PREGUNTAS.indexOf(p);
          if (k >= 0) PREGUNTAS.splice(k, 1);
          PREGUNTA_POR_ID.delete(p.id);
        }
      }
      const activas = PREGUNTAS.filter((p) => p.cuadernillo === c).length;
      informe.push({ nombre: a.nombre, archivo: a.archivo, estado: `agregado (${AREAS_ICFES[area]?.nombre || area})`, preguntas: activas });
      console.log(`[ICFES] Nuevo cuadernillo desde Drive: ${a.nombre} → ${activas} preguntas`);
    } catch (e: any) {
      informe.push({ nombre: a.nombre, archivo: a.archivo, estado: `error: ${e?.message || e}` });
    } finally {
      bytesPrevios.delete(a.archivo);
    }
  }
  estadoSync.archivos = informe;
  estadoSync.ultima = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  estadoSync.error = null;
  return estadoSync;
}

export function sincronizarCarpeta() {
  if (sincronizando) return sincronizando;
  sincronizando = sincronizarAhora()
    .catch((e: any) => {
      estadoSync.error = e?.message || String(e);
      estadoSync.ultima = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
      return estadoSync;
    })
    .finally(() => {
      sincronizando = null;
    });
  return sincronizando;
}

export const estadoSincronizacion = () => estadoSync;
