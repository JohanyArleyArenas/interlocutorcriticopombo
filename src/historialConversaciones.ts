import type { ChatMessage, ChatArchivo } from './components/ChatView.tsx';

export interface SesionConversacion {
  id: string;
  modoKey: string;
  modoTitulo: string;
  tituloResumen: string;
  ultimoMensaje: string;
  turnosEstudiante: number;
  creadoEn: number;
  actualizadoEn: number;
  mensajes: ChatMessage[];
}

const PREFIJO_HISTORIAL = 'interlocutor-historial-v1:';
const MAX_SESIONES_GUARDADAS = 15;
const EVENTO_HISTORIAL_ACTUALIZADO = 'interlocutor:historial-actualizado';

function normalizarClaveEstudiante(estudiante: string): string {
  return String(estudiante || 'anonimo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function obtenerClaveStorage(estudiante: string): string {
  const norm = normalizarClaveEstudiante(estudiante || 'anonimo');
  return `${PREFIJO_HISTORIAL}${norm || 'anonimo'}`;
}

function limpiarArchivoParaStorage(archivo?: ChatArchivo): ChatArchivo | undefined {
  if (!archivo) return undefined;
  return {
    nombre: archivo.nombre,
    mimeType: archivo.mimeType,
    tamano: archivo.tamano,
    esEjemploClase: archivo.esEjemploClase,
    // Omitimos base64 pesado para no saturar localStorage y conservamos texto extraído acotado
    texto: archivo.texto ? archivo.texto.slice(0, 4000) : undefined,
  };
}

function sanitizarMensajesParaStorage(mensajes: ChatMessage[]): ChatMessage[] {
  return mensajes.slice(-40).map((m) => ({
    ...m,
    archivo: limpiarArchivoParaStorage(m.archivo),
    archivos: Array.isArray(m.archivos)
      ? m.archivos.map((a) => limpiarArchivoParaStorage(a)!).filter(Boolean)
      : undefined,
  }));
}

function limpiarTextoResumen(texto: string, maxLen = 80): string {
  const limpio = String(texto || '')
    .replace(/```[\s\S]*?```/g, '[Bloque]')
    .replace(/[#*_>`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!limpio) return 'Conversación sin texto';
  return limpio.length > maxLen ? `${limpio.slice(0, maxLen - 1).trimEnd()}…` : limpio;
}

export function cargarHistorialConversaciones(estudiante: string): SesionConversacion[] {
  if (typeof window === 'undefined' || !estudiante) return [];
  try {
    const raw = localStorage.getItem(obtenerClaveStorage(estudiante));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SesionConversacion =>
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.modoKey === 'string' &&
          Array.isArray(item.mensajes) &&
          item.mensajes.length > 0
      )
      .sort((a, b) => b.actualizadoEn - a.actualizadoEn);
  } catch {
    return [];
  }
}

export function guardarSesionConversacion(params: {
  estudiante: string;
  sesionId: string;
  modoKey: string;
  modoTitulo: string;
  mensajes: ChatMessage[];
  creadoEn?: number;
}): void {
  const { estudiante, sesionId, modoKey, modoTitulo, mensajes, creadoEn } = params;
  if (typeof window === 'undefined' || !estudiante || !sesionId || !modoKey) return;

  const mensajesUsuario = mensajes.filter((m) => m.role === 'user');
  if (mensajesUsuario.length === 0) return;

  try {
    const actuales = cargarHistorialConversaciones(estudiante);
    const existente = actuales.find((s) => s.id === sesionId);

    const primerMensajeUsuario = mensajesUsuario[0];
    const textoPrimerMensaje =
      primerMensajeUsuario?.text ||
      primerMensajeUsuario?.archivo?.nombre ||
      primerMensajeUsuario?.archivos?.[0]?.nombre ||
      modoTitulo;

    const mensajesReales = mensajes.filter((m) => !m.avisoSistema && m.id !== 'greeting');
    const ultimoMsg = mensajesReales[mensajesReales.length - 1] || primerMensajeUsuario;

    const ahora = Date.now();
    const nuevaSesion: SesionConversacion = {
      id: sesionId,
      modoKey,
      modoTitulo,
      tituloResumen: limpiarTextoResumen(textoPrimerMensaje, 72),
      ultimoMensaje: limpiarTextoResumen(ultimoMsg?.text || '', 100),
      turnosEstudiante: mensajesUsuario.length,
      creadoEn: existente?.creadoEn || creadoEn || ahora,
      actualizadoEn: ahora,
      mensajes: sanitizarMensajesParaStorage(mensajes),
    };

    const sinActual = actuales.filter((s) => s.id !== sesionId);
    const nuevaLista = [nuevaSesion, ...sinActual].slice(0, MAX_SESIONES_GUARDADAS);

    localStorage.setItem(obtenerClaveStorage(estudiante), JSON.stringify(nuevaLista));
    window.dispatchEvent(new CustomEvent(EVENTO_HISTORIAL_ACTUALIZADO));
  } catch {
    // Si localStorage alcanza el límite, intentamos guardar con menos sesiones
    try {
      const actuales = cargarHistorialConversaciones(estudiante).slice(0, 5);
      localStorage.setItem(obtenerClaveStorage(estudiante), JSON.stringify(actuales));
    } catch {}
  }
}

export function eliminarSesionConversacion(estudiante: string, sesionId: string): SesionConversacion[] {
  if (typeof window === 'undefined' || !estudiante) return [];
  try {
    const actuales = cargarHistorialConversaciones(estudiante);
    const filtradas = actuales.filter((s) => s.id !== sesionId);
    localStorage.setItem(obtenerClaveStorage(estudiante), JSON.stringify(filtradas));
    window.dispatchEvent(new CustomEvent(EVENTO_HISTORIAL_ACTUALIZADO));
    return filtradas;
  } catch {
    return [];
  }
}

export function formatearFechaRelativa(timestamp: number): string {
  const ahora = Date.now();
  const diffSeg = Math.max(0, Math.floor((ahora - timestamp) / 1000));

  if (diffSeg < 60) return 'Hace un momento';
  const diffMin = Math.floor(diffSeg / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return `Hace ${diffHoras} h`;
  const diffDias = Math.floor(diffHoras / 24);
  if (diffDias === 1) return 'Ayer';
  if (diffDias < 7) return `Hace ${diffDias} días`;

  try {
    return new Date(timestamp).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

export { EVENTO_HISTORIAL_ACTUALIZADO };
