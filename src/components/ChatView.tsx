import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { obtenerSugerenciasAleatorias } from '../sugerencias';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Fórmulas: el modelo a veces escribe \( … \) o \[ … \]; se pasan a $ … $ y $$ … $$
// para que remark-math las reconozca y KaTeX las dibuje bien.
const prepararMatematicas = (texto: string) =>
  (texto || '')
    .replace(/\\\[([\s\S]+?)\\\]/g, (_m, f) => '\n$$\n' + f.trim() + '\n$$\n')
    .replace(/\\\(([\s\S]+?)\\\)/g, (_m, f) => '$' + f.trim() + '$');
import { 
  ChevronLeft, 
  ArrowUp, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Globe, 
  ExternalLink,
  AlertCircle,
  MessageSquareQuote,
  Search,
  Scale,
  CheckCircle2,
  Cpu,
  Upload,
  Flag,
  Download,
  Sigma,
  GraduationCap
} from 'lucide-react';
import { Grafica } from './Grafica.tsx';
import { SelectorArea, TarjetaPregunta, PreguntaIcfesMeta, EstadoPreguntaIcfes } from './EntrenadorIcfes.tsx';
import { AGENTE, ModoConfig } from '../parametros.ts';

// Bloques ```grafica: la IA describe la gráfica en JSON y aquí se dibuja (ver Grafica.tsx)
const renderPre = ({ node, children, ...props }: any) => {
  const hijo: any = node?.children?.[0];
  const clases = hijo?.properties?.className;
  const lista: string[] = Array.isArray(clases) ? clases.map(String) : typeof clases === 'string' ? clases.split(' ') : [];
  if (lista.includes('language-grafica')) {
    const texto = (hijo?.children || []).map((t: any) => t?.value || '').join('');
    return <Grafica fuente={texto} />;
  }
  return <pre {...props}>{children}</pre>;
};

// Presentación de cada modo en la tarjeta de bienvenida del chat
const ICONOS_MODO: Record<string, React.ElementType> = {
  socratico: MessageSquareQuote,
  explorar: Search,
  argumento: Scale,
  verificar: CheckCircle2,
  auditar: Cpu,
  escrito: FileText,
  tutor: Sigma,
  icfes: GraduationCap,
};

const EJEMPLOS_MODO: Record<string, string[]> = {
  socratico: ['Quiero entender las ecuaciones de segundo grado', 'Quiero aprender qué es la fotosíntesis'],
  explorar: ['¿Las redes sociales afectan la concentración de los jóvenes?'],
  argumento: ['Tesis: el uniforme escolar debería ser opcional, porque…'],
  verificar: ['«Tomar agua fría después de comer es peligroso». Lo vi en WhatsApp.'],
  tutor: ['No entiendo cómo despejar x en 3x + 5 = 20', 'Un carro pasa de 0 a 20 m/s en 4 s, ¿cómo hallo la aceleración?'],
};

// Modos que muestran el botón «Terminar» y «Lo verifiqué por fuera» (todos excepto icfes)
const MODOS_CON_CIERRE = ['socratico', 'explorar', 'argumento', 'verificar', 'auditar', 'escrito', 'tutor'];

const PLACEHOLDERS_CAMPO = [
  '¿Qué estás pensando?',
  'Cuéntame tu idea, aunque sea a medias…',
  '¿Por dónde va tu idea?',
  'Empieza por lo que ya sospechas…',
  'Escribe lo que se te ocurra; lo pensamos juntos',
];

const normalizarTextoModo = (s: string): string =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Tabla de correspondencia fija entre el nombre visible en la interfaz (y variantes) y el id interno
const TABLA_CORRESPONDENCIA_MODOS: Array<{ nombreNorm: string; id: string; soloExplicito?: boolean }> = [
  { nombreNorm: 'dialogo socratico', id: 'socratico' },
  { nombreNorm: 'socratico', id: 'socratico', soloExplicito: true },
  { nombreNorm: 'guia de investigacion', id: 'explorar' },
  { nombreNorm: 'guia investigacion', id: 'explorar' },
  { nombreNorm: 'explorar', id: 'explorar', soloExplicito: true },
  { nombreNorm: 'taller de argumentos', id: 'argumento' },
  { nombreNorm: 'poner a prueba un argumento', id: 'argumento' },
  { nombreNorm: 'argumento', id: 'argumento', soloExplicito: true },
  { nombreNorm: 'verificar una afirmacion', id: 'verificar' },
  { nombreNorm: 'verificar afirmacion', id: 'verificar' },
  { nombreNorm: 'verificar', id: 'verificar', soloExplicito: true },
  { nombreNorm: 'auditar una respuesta de ia', id: 'auditar' },
  { nombreNorm: 'auditar respuesta de ia', id: 'auditar' },
  { nombreNorm: 'auditar', id: 'auditar', soloExplicito: true },
  { nombreNorm: 'tutor de matematicas fisica y quimica', id: 'tutor' },
  { nombreNorm: 'tutor de matematicas', id: 'tutor' },
  { nombreNorm: 'tutor', id: 'tutor', soloExplicito: true },
  { nombreNorm: 'revisar mi escrito', id: 'escrito' },
  { nombreNorm: 'escrito', id: 'escrito', soloExplicito: true },
  { nombreNorm: 'entrenador saber 11', id: 'icfes' },
  { nombreNorm: 'saber 11', id: 'icfes', soloExplicito: true },
  { nombreNorm: 'icfes', id: 'icfes', soloExplicito: true },
];

const resolverIdModo = (raw: string): string | null => {
  const norm = normalizarTextoModo(raw)
    .replace(/^modo\s+/, '')
    .replace(/^cambiar\s+a(?:l\s+modo)?\s+/, '')
    .trim();
  if (!norm) return null;
  const exacto = TABLA_CORRESPONDENCIA_MODOS.find((m) => m.nombreNorm === norm);
  if (exacto) return exacto.id;
  const parcial = TABLA_CORRESPONDENCIA_MODOS.find(
    (m) => m.nombreNorm.length >= 5 && norm.includes(m.nombreNorm)
  );
  return parcial ? parcial.id : null;
};

const PATRON_MARCA_MODO_CLIENTE = /`?\s*⟦\s*modo\s*:\s*([^⟧]+?)\s*⟧\s*`?/gi;
const PATRON_ENLACE_MODO_CLIENTE = /\[([^\]]*)\]\(\s*\/?#?modo:([^)]+)\)/gi;

const extraerModosSugeridosYLimpiar = (
  texto: string,
  modoActual: string,
  modoServidor?: string
): { textoLimpio: string; modosSugeridos: string[] } => {
  const encontrados = new Set<string>();
  if (modoServidor) {
    const idSrv = resolverIdModo(modoServidor);
    if (idSrv && idSrv !== modoActual && AGENTE.modos[idSrv]) encontrados.add(idSrv);
  }
  let textoLimpio = String(texto || '');
  textoLimpio = textoLimpio.replace(PATRON_MARCA_MODO_CLIENTE, (_m, rawId) => {
    const id = resolverIdModo(rawId);
    if (id && id !== modoActual && AGENTE.modos[id]) encontrados.add(id);
    return '';
  });
  textoLimpio = textoLimpio.replace(PATRON_ENLACE_MODO_CLIENTE, (_m, label, rawHref) => {
    const id = resolverIdModo(rawHref) || resolverIdModo(label);
    if (id && id !== modoActual && AGENTE.modos[id]) encontrados.add(id);
    return '';
  });
  if (encontrados.size === 0 && textoLimpio) {
    const textoNorm = normalizarTextoModo(textoLimpio);
    for (const item of TABLA_CORRESPONDENCIA_MODOS) {
      if (item.id === modoActual || !AGENTE.modos[item.id]) continue;
      if (!item.soloExplicito && textoNorm.includes(item.nombreNorm)) {
        encontrados.add(item.id);
      } else if (item.soloExplicito && textoNorm.includes(`modo ${item.nombreNorm}`)) {
        encontrados.add(item.id);
      }
    }
  }
  return { textoLimpio: textoLimpio.trimEnd(), modosSugeridos: Array.from(encontrados) };
};

export interface ChatArchivo {
  nombre: string;
  mimeType: string;
  data?: string;   // base64
  texto?: string;  // texto extraido
  tamano?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  archivo?: ChatArchivo;
  fuentes?: Array<{ titulo: string; url: string }>;
  modoSugerido?: string;
  avisoSistema?: boolean;
  esRedireccion?: boolean;
  pregunta?: PreguntaIcfesMeta;
  selector?: boolean;
  icfes?: { id: string; accion: string; respuesta?: string };
  timestamp: number;
}

interface ChatViewProps {
  modeKey: string;
  onBackToModos: () => void;
  onCambiarModo?: (newModeKey: string, mensajesConservar?: ChatMessage[]) => void;
  onChangeModo?: (newModeKey: string, mensajesConservar?: ChatMessage[]) => void;
  initialMessages?: ChatMessage[];
  estudiante?: string;
}

interface AttachedFilePreview {
  file: File;
  nombre: string;
  mimeType: string;
  tamano: string;
  data?: string;
  texto?: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ modeKey, onBackToModos, onCambiarModo, onChangeModo, initialMessages, estudiante }) => {
  const modo: ModoConfig = AGENTE.modos[modeKey] || {
    titulo: 'Diálogo socrático',
    descripcion: '',
    saludo: '',
    guia: ['', '', ''],
    instrucciones: '',
    busqueda: false,
    adjuntos: false,
    temperatura: 0.7,
    maxTokens: 1000,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saludoInicial: ChatMessage = {
      id: 'greeting',
      role: 'model',
      text: modo.saludo,
      timestamp: Date.now(),
    };
    if (modeKey !== 'icfes' && Array.isArray(initialMessages) && initialMessages.length > 0) {
      const previos = initialMessages.filter((m) => m.id !== 'greeting' && !m.pregunta && !m.selector);
      if (previos.length > 0) {
        const avisoCambio: ChatMessage = {
          id: `aviso-modo-${Date.now()}`,
          role: 'model',
          text: `Cambiaste al modo ${modo.titulo}`,
          avisoSistema: true,
          timestamp: Date.now(),
        };
        return [saludoInicial, ...previos, avisoCambio];
      }
    }
    return [saludoInicial];
  });

  const [inputText, setInputText] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(() =>
    Math.floor(Math.random() * PLACEHOLDERS_CAMPO.length)
  );
  const prevVacioRef = useRef(true);
  useEffect(() => {
    const vacio = inputText.length === 0;
    if (vacio && !prevVacioRef.current) {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS_CAMPO.length);
    }
    prevVacioRef.current = vacio;
  }, [inputText]);

  const cambiarAModo = (rawDestino: string) => {
    const destino = resolverIdModo(rawDestino) || rawDestino;
    if (!destino || !AGENTE.modos[destino] || destino === modeKey) return;
    console.log(`[Cambio de modo] de ${modeKey} a ${destino}`);
    const fnCambiar = onCambiarModo || onChangeModo;
    if (!fnCambiar) return;
    if (destino === 'icfes') {
      fnCambiar('icfes', undefined);
      return;
    }
    const idxUltimoUser = messages.map((m) => m.role === 'user').lastIndexOf(true);
    const historialParaNuevoModo = messages
      .filter((m) => m.id !== 'greeting' && !m.pregunta && !m.selector)
      .map((m, idx, arr) => {
        const idxOriginal = messages.indexOf(m);
        const esPosteriorAUltimoUser =
          idxUltimoUser >= 0 && idxOriginal > idxUltimoUser && m.role === 'model' && !m.avisoSistema;
        const esUltimaRespuestaModelo = idx === arr.length - 1 && m.role === 'model' && !m.avisoSistema;
        return esPosteriorAUltimoUser || esUltimaRespuestaModelo ? { ...m, esRedireccion: true } : m;
      });
    fnCambiar(destino, historialParaNuevoModo);
  };
  const [attachedFile, setAttachedFile] = useState<AttachedFilePreview | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
// ===== Entrenador Saber 11 =====
const esIcfes = modeKey === 'icfes';
const [estadosIcfes, setEstadosIcfes] = useState<Record<string, EstadoPreguntaIcfes>>({});
const [marcador, setMarcador] = useState<Record<string, { aciertos: number; intentos: number }>>({});
const [cargandoPregunta, setCargandoPregunta] = useState(false);
// Preguntas ya vistas por este estudiante (se guardan en el navegador para no repetirlas al volver)
  const claveVistas = `icfes-vistas:${(estudiante || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()}`;
  const vistasRef = useRef<string[]>(
    (() => {
      try {
        const v = JSON.parse(localStorage.getItem(claveVistas) || '[]');
        return Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(-600) : [];
      } catch {
        return [];
      }
    })()
  );
  const guardarVistas = () => {
    try {
      localStorage.setItem(claveVistas, JSON.stringify(vistasRef.current.slice(-600)));
    } catch {}
  };
const ultimaAreaRef = useRef('');
const ultimoMsgPregunta = [...messages].reverse().find((m) => !!m.pregunta);
const preguntaActiva = ultimoMsgPregunta?.pregunta;


  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Sugerencias dinámicas: cambian en cada ingreso y con el botón 'Otras ideas'
  const [rondaIdeas, setRondaIdeas] = useState(0);
  const cacheIdeasRef = useRef<Record<string, string[]>>({});
  const ideasPara = (clave: string): string[] => {
    const base = EJEMPLOS_MODO[clave] || [];
if (clave === 'tutor') return base;
    if (base.length === 0) return base;
    const k = clave + '#' + rondaIdeas;
    if (!cacheIdeasRef.current[k]) {
      let nuevas: string[] = [];
      try {
        nuevas = obtenerSugerenciasAleatorias(2, clave).map((s) => s.texto);
      } catch {
        nuevas = [];
      }
      cacheIdeasRef.current[k] = nuevas.length > 0 ? nuevas : base.slice(0, 2);
    }
    return cacheIdeasRef.current[k];
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Identificador de esta conversación (para agrupar los turnos en la hoja de registro)
  const sesionRef = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`);

  // ===== Cierre de sesión: reflexión del estudiante y descarga de la conversación =====
  const inicioSesionRef = useRef(Date.now());
  const [cierreAbierto, setCierreAbierto] = useState(false);
  const [avisoSalidaSinCierre, setAvisoSalidaSinCierre] = useState(false);
  const [cierreEstado, setCierreEstado] = useState<'editando' | 'enviando' | 'listo'>('editando');
  const [cierreError, setCierreError] = useState('');
  const [aprendi, setAprendi] = useState('');
  const [comprobe, setComprobe] = useState('');
  const [sinAyuda, setSinAyuda] = useState('');
  const [dudas, setDudas] = useState('');
  const [confianza, setConfianza] = useState(0);
  const turnosEstudiante = messages.filter((m) => m.role === 'user').length;

  const intentarVolverAModos = () => {
    if (MODOS_CON_CIERRE.includes(modeKey) && turnosEstudiante > 0 && cierreEstado !== 'listo') {
      setAvisoSalidaSinCierre(true);
      setCierreAbierto(true);
      setBarraVisible(true);
      return;
    }
    onBackToModos();
  };

  useEffect(() => {
    const manejarIntentoSalida = (e: Event) => {
      e.preventDefault();
      intentarVolverAModos();
    };
    window.addEventListener('interlocutor:intentar-volver-modos', manejarIntentoSalida);
    return () => window.removeEventListener('interlocutor:intentar-volver-modos', manejarIntentoSalida);
  });

  // ===== Lo verifiqué por fuera: formulario breve de contrastación externa =====
  const [verifAbierta, setVerifAbierta] = useState(false);
  const [verifDato, setVerifDato] = useState('');
  const [verifFuente, setVerifFuente] = useState('');
  const [verifResultado, setVerifResultado] = useState<'Coincide' | 'No coincide' | 'Matiza' | ''>('');
  const [verifError, setVerifError] = useState('');

  const contarPalabrasReales = (s: string): number =>
    s
      .trim()
      .split(/\s+/)
      .filter((p) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}/.test(p)).length;

  const enviarCierre = async () => {
    if (contarPalabrasReales(aprendi) < 5) {
      setCierreError('En la pregunta 1, escribe una idea completa con tus palabras (mínimo 5 palabras).');
      return;
    }
    if (contarPalabrasReales(comprobe) < 5) {
      setCierreError('En la pregunta 2, explica con al menos 5 palabras qué comprobaste fuera (o qué habrías podido comprobar y dónde).');
      return;
    }
    if (contarPalabrasReales(sinAyuda) < 5) {
      setCierreError('En la pregunta 3, cuenta con al menos 5 palabras qué hiciste o habrías hecho por tu cuenta.');
      return;
    }
    if (confianza < 1 || confianza > 5) {
      setCierreError('En el punto 5, elige de 1 a 5 qué tan seguro te sientes de explicarlo sin ayuda.');
      return;
    }
    setCierreEstado('enviando');
    setCierreError('');
    try {
      const r = await fetch('/api/cierre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modeKey,
          estudiante: estudiante || '',
          sesion: sesionRef.current,
          aprendi: aprendi.trim(),
          comprobe: comprobe.trim(),
          sinAyuda: sinAyuda.trim(),
          dudas: dudas.trim(),
          confianza,
          turnos: turnosEstudiante,
          segundos: Math.round((Date.now() - inicioSesionRef.current) / 1000),
        }),
      });
      if (!r.ok) {
        const d: any = await r.json().catch(() => ({}));
        throw new Error(d.error || 'No se pudo guardar tu reflexión. Intenta de nuevo.');
      }
      setCierreEstado('listo');
      setAvisoSalidaSinCierre(false);
    } catch (e: any) {
      setCierreEstado('editando');
      setCierreError(e?.message || 'No se pudo guardar tu reflexión. Intenta de nuevo.');
    }
  };

  const descargarConversacion = () => {
    const fecha = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    const lineas: string[] = [`Interlocutor Crítico — ${modo.titulo}`, `Código: ${estudiante || ''}`, `Fecha: ${fecha}`, ''];
    messages.forEach((m) => {
      lineas.push(m.role === 'user' ? 'YO:' : 'INTERLOCUTOR CRÍTICO:');
      if (m.archivo) lineas.push(`[Archivo: ${m.archivo.nombre}]`);
      lineas.push(m.text || '', '');
    });
    if (cierreEstado === 'listo') {
      lineas.push(
        'MI REFLEXIÓN FINAL',
        `Qué aprendí: ${aprendi}`,
        `Qué comprobé fuera de la IA: ${comprobe}`,
        `Qué habría hecho sin ayuda: ${sinAyuda}`,
        `Qué me quedó dudoso: ${dudas || '—'}`,
        `Confianza para explicarlo sin ayuda (1 a 5): ${confianza || '—'}`
      );
    }
    const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    const nombreArchivo = `${modo.titulo}-${estudiante || 'conversacion'}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    enlace.href = url;
    enlace.download = `${nombreArchivo || 'conversacion'}.txt`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const listRef = useRef<HTMLDivElement | null>(null);
  const [espacioFinal, setEspacioFinal] = useState(0);

  // Barra del modo: se oculta al bajar y reaparece al subir (el encabezado general queda fijo)
  const [barraVisible, setBarraVisible] = useState(true);
  const ultimoScrollRef = useRef(0);
  // ¿El estudiante está viendo el final del hilo? Si sí, el final se mantiene visible aunque la respuesta crezca.
  const pegadoAlFondoRef = useRef(true);
  // Evita enviar otro mensaje mientras la respuesta anterior todavía se está escribiendo
  const enviandoRef = useRef(false);
  const manejarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const actual = e.currentTarget.scrollTop;
    pegadoAlFondoRef.current = e.currentTarget.scrollHeight - actual - e.currentTarget.clientHeight < 80;
    const delta = actual - ultimoScrollRef.current;
    if (actual < 24) {
      setBarraVisible(true);
      ultimoScrollRef.current = actual;
    } else if (Math.abs(delta) > 6) {
      setBarraVisible(delta < 0);
      ultimoScrollRef.current = actual;
    }
  };

  const esMovil = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;


  const getContenedor = () =>
    messagesEndRef.current?.closest('.overflow-y-auto') as HTMLElement | null;

  const scrollToBottom = (smooth = true) => {
    // Desplaza solo el hilo de mensajes (no toda la página), para que el encabezado no desaparezca en móvil
    const contenedor = getContenedor();
    if (contenedor) {
      contenedor.scrollTo({ top: contenedor.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Estilo WhatsApp: cuando se abre el teclado y el hilo se encoge, los mensajes
  // suben junto con la casilla de escritura (y bajan de nuevo al cerrarlo).
  useEffect(() => {
    const contenedor = getContenedor();
    if (!contenedor || typeof ResizeObserver === 'undefined') return;
    let altoPrevio = contenedor.clientHeight;
    const observador = new ResizeObserver(() => {
      const alto = contenedor.clientHeight;
      const diferencia = altoPrevio - alto;
      if (diferencia === 0) return;
      // Si el estudiante estaba viendo el final, el final se queda pegado a la casilla
      // (al abrir y al cerrar el teclado, en Android y en iPhone).
      const distanciaAlFondo = contenedor.scrollHeight - contenedor.scrollTop - altoPrevio;
      altoPrevio = alto;
      if (distanciaAlFondo < 120) {
        contenedor.scrollTop = contenedor.scrollHeight;
      } else {
        contenedor.scrollTop += diferencia;
      }
    });
    observador.observe(contenedor);
    return () => observador.disconnect();
  }, []);

  // Como en Claude: al enviar, el último mensaje del estudiante sube al borde superior
  // y la respuesta aparece debajo, legible desde su inicio. Lo anterior queda arriba.
  const ajustarAlUltimoMensaje = (smooth = true) => {
    const contenedor = getContenedor();
    const lista = listRef.current;
    if (!contenedor || !lista) return;
    const usuarios = lista.querySelectorAll<HTMLElement>('[data-role="user"]');
    const ultimo = usuarios[usuarios.length - 1];
    if (!ultimo) {
      setEspacioFinal(0);
      return;
    }
    const margen = 16;
    const altoDesdeUltimo = lista.getBoundingClientRect().bottom - ultimo.getBoundingClientRect().top;
    setEspacioFinal(Math.max(0, contenedor.clientHeight - altoDesdeUltimo - margen * 3));
    requestAnimationFrame(() => {
      const top =
        ultimo.getBoundingClientRect().top - contenedor.getBoundingClientRect().top + contenedor.scrollTop - margen;
      contenedor.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
    });
  };

  // Al abrir un modo (solo el saludo, sin conversación) la vista empieza arriba, mostrando la presentación
  // del modo. Antes bajaba al final y luego había que subir: eso producía los saltos al entrar.
  const irAlInicio = () => {
    const contenedor = getContenedor();
    pegadoAlFondoRef.current = false;
    if (contenedor) contenedor.scrollTop = 0;
  };

  useLayoutEffect(() => {
    if (messages.length === 1) irAlInicio();
    else scrollToBottom(false);
  }, []);

  useEffect(() => {
    // Estilo ChatGPT: cuando ya hay conversación, el hilo queda mostrando el final
    setEspacioFinal(0);
    if (messages.length === 1 && !isLoading && !errorMessage) {
      irAlInicio();
      return;
    }
    pegadoAlFondoRef.current = true;
    requestAnimationFrame(() => scrollToBottom(false));
  }, [messages.length, isLoading, errorMessage]);

  // Cuando el contenido cambia de alto después de pintarse (fórmulas, listas, imágenes),
  // se vuelve a bajar hasta el final para que la vista no quede a mitad de la respuesta.
  useEffect(() => {
    const contenedor = getContenedor();
    const lista = listRef.current;
    if (!contenedor || !lista || typeof ResizeObserver === 'undefined') return;
    const observadorLista = new ResizeObserver(() => {
      if (pegadoAlFondoRef.current) contenedor.scrollTop = contenedor.scrollHeight;
    });
    observadorLista.observe(lista);
    return () => observadorLista.disconnect();
  }, []);

  // Adjust textarea height up to 6 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 144)}px`;
    }
  }, [inputText]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [mostrarAvisoPrivacidadArchivo, setMostrarAvisoPrivacidadArchivo] = useState(false);
  const avisoPrivacidadMostradoRef = useRef(false);
  const activarAvisoPrivacidadUnaVez = () => {
    if (!avisoPrivacidadMostradoRef.current) {
      avisoPrivacidadMostradoRef.current = true;
      setMostrarAvisoPrivacidadArchivo(true);
    }
  };

  const processFile = async (file: File) => {
    activarAvisoPrivacidadUnaVez();

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt', 'docx'];
    if (!allowed.includes(ext)) {
      setErrorMessage(
        'Formato de archivo no válido. Solo puedes subir imágenes (JPG, PNG, WEBP), PDF, texto (.txt) o Word (.docx).'
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      setErrorMessage('El archivo supera el límite de 10 MB. Sube un archivo más liviano.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const mimePorExt: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      pdf: 'application/pdf',
      txt: 'text/plain',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    setIsProcessingFile(true);
    try {
      let texto: string | undefined = undefined;
      let data: string | undefined = undefined;

      if (ext === 'txt') {
        texto = await file.text();
      } else {
        // Imágenes, PDF y Word (.docx): se leen en base64 (el servidor extrae el texto de .docx con mammoth)
        data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setAttachedFile({
        file,
        nombre: file.name,
        mimeType: mimePorExt[ext] || file.type || `application/${ext}`,
        tamano: formatFileSize(file.size),
        data,
        texto,
      });
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Error al procesar archivo:', err);
      setErrorMessage('No se pudo leer el archivo. Intenta de nuevo.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const enviarConversacionAlServidor = async (
    mensajesActuales: ChatMessage[],
    icfesPayload?: ChatMessage['icfes']
  ) => {
    enviandoRef.current = true;
    setErrorMessage(null);
    if (esMovil()) textareaRef.current?.blur();
    setIsLoading(true);

    try {
      // En el entrenador solo se envía la conversación de la pregunta en curso (desde su tarjeta)
      const baseMensajes = esIcfes
        ? mensajesActuales.slice(Math.max(0, mensajesActuales.map((mm) => !!mm.pregunta).lastIndexOf(true)))
        : mensajesActuales;
      const payloadMessages = baseMensajes
        .filter((msg) => !msg.selector && !msg.avisoSistema && !msg.esRedireccion)
        .map((msg) => ({
          role: msg.role,
          text: msg.text,
          archivo: msg.archivo,
          icfes: msg.icfes,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modeKey,
          messages: payloadMessages,
          estudiante: estudiante || '',
          sesion: sesionRef.current,
          stream: true,
          icfes: icfesPayload,
        }),
      });

      const MENSAJE_NO_DISPONIBLE =
        'El agente no está disponible en este momento. Intenta de nuevo en un minuto; si sigue fallando, avisa al docente.';

      if (!res.ok) {
        const textoErr = await res.text().catch(() => '');
        let errorMsg = '';
        try {
          const errorData = JSON.parse(textoErr);
          if (errorData && typeof errorData.error === 'string') {
            errorMsg = errorData.error;
          }
        } catch {
          errorMsg = MENSAJE_NO_DISPONIBLE;
        }
        throw new Error(errorMsg || MENSAJE_NO_DISPONIBLE);
      }

      const tipo = res.headers.get('content-type') || '';
      if (tipo.includes('application/x-ndjson') && res.body) {
        // Respuesta en vivo: el texto aparece mientras el modelo lo escribe
        const idRespuesta = `model-${Date.now()}`;
        let acumulado = '';
        let creado = false;
        const pintar = (texto: string, fuentesFinales?: any[], modoSug?: string) => {
          const { textoLimpio, modosSugeridos } = extraerModosSugeridosYLimpiar(texto, modeKey, modoSug);
          const modoDest = modosSugeridos[0];
          if (!creado) {
            creado = true;
            setIsLoading(false);
            const nuevoMensaje: ChatMessage = {
              id: idRespuesta,
              role: 'model',
              text: textoLimpio,
              fuentes: fuentesFinales || [],
              ...(modoDest ? { modoSugerido: modoDest } : {}),
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, nuevoMensaje]);
          } else {
            setMessages((prev) =>
              prev.map((mm) =>
                mm.id === idRespuesta
                  ? {
                      ...mm,
                      text: textoLimpio,
                      ...(fuentesFinales ? { fuentes: fuentesFinales } : {}),
                      ...(modoDest ? { modoSugerido: modoDest } : {}),
                    }
                  : mm
              )
            );
          }
        };
        const lector = res.body.getReader();
        const decodificador = new TextDecoder();
        let pendiente = '';
        let terminado = false;
        while (!terminado) {
          const { value, done } = await lector.read();
          if (done) break;
          pendiente += decodificador.decode(value, { stream: true });
          let corte = pendiente.indexOf('\n');
          while (corte >= 0) {
            const linea = pendiente.slice(0, corte).trim();
            pendiente = pendiente.slice(corte + 1);
            corte = pendiente.indexOf('\n');
            if (!linea) continue;
            let evento: any;
            try {
              evento = JSON.parse(linea);
            } catch {
              throw new Error(MENSAJE_NO_DISPONIBLE);
            }
            if (evento.t === 'delta') {
              acumulado += evento.text || '';
              pintar(acumulado);
            } else if (evento.t === 'reinicio') {
              acumulado = '';
            } else if (evento.t === 'fin') {
              if (evento.icfes) aplicarResultadoIcfes(evento.icfes);
              acumulado = evento.reply || acumulado;
              pintar(
                acumulado,
                Array.isArray(evento.fuentes) ? evento.fuentes : [],
                typeof evento.modoSugerido === 'string' ? evento.modoSugerido : undefined
              );
              terminado = true;
            } else if (evento.t === 'error') {
              throw new Error(evento.error || MENSAJE_NO_DISPONIBLE);
            }
          }
        }
        if (!creado) throw new Error(MENSAJE_NO_DISPONIBLE);
      } else {
        const rawText = await res.text().catch(() => '');
        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error(MENSAJE_NO_DISPONIBLE);
        }
        const { textoLimpio, modosSugeridos } = extraerModosSugeridosYLimpiar(
          data?.reply || '',
          modeKey,
          typeof data?.modoSugerido === 'string' ? data.modoSugerido : undefined
        );
        const fuentes = Array.isArray(data?.fuentes) ? data.fuentes : [];

        const agentMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: textoLimpio,
          fuentes,
          ...(modosSugeridos[0] ? { modoSugerido: modosSugeridos[0] } : {}),
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      const msg = String(err?.message || '');
      const esTecnicoOJson =
        !msg ||
        /unexpected token|is not valid json|<!doctype|syntaxerror|failed to fetch|networkerror|load failed/i.test(msg);
      setErrorMessage(
        esTecnicoOJson
          ? 'El agente no está disponible en este momento. Intenta de nuevo en un minuto; si sigue fallando, avisa al docente.'
          : msg
      );
    } finally {
      enviandoRef.current = false;
      setIsLoading(false);
      // Solo en computador se devuelve el cursor al cuadro de texto;
      // en móvil no, para que el teclado no tape la respuesta
      if (!esMovil()) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 50);
      }
    }
  };

  // Si se llega a este modo desde una sugerencia de cambio de modo, retoma automáticamente la última petición del estudiante
  const retomadoAlCambiarRef = useRef(false);
  useEffect(() => {
    if (retomadoAlCambiarRef.current) return;
    if (modeKey !== 'icfes' && Array.isArray(initialMessages) && initialMessages.length > 0) {
      const tienePeticionEstudiante = messages.some((m) => m.role === 'user');
      if (tienePeticionEstudiante) {
        retomadoAlCambiarRef.current = true;
        enviarConversacionAlServidor(messages);
      }
    }
  }, []);

  const handleSendMessage = async (forzadoArg?: any) => {
    const f: { texto: string; archivo?: ChatArchivo; icfes?: ChatMessage['icfes']; reintento?: boolean } | undefined =
      forzadoArg && typeof forzadoArg.texto === 'string' ? forzadoArg : undefined;
    const trimmed = (f ? f.texto : inputText).trim();
    if ((!trimmed && !attachedFile && !f?.archivo) || isLoading || isProcessingFile || enviandoRef.current) return;

    let userArchivo: ChatArchivo | undefined = f?.archivo;
    if (attachedFile && !f) {
      userArchivo = {
        nombre: attachedFile.nombre,
        mimeType: attachedFile.mimeType,
        data: attachedFile.data,
        texto: attachedFile.texto,
        tamano: attachedFile.tamano,
      };
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      archivo: userArchivo,
      icfes: f ? f.icfes : esIcfes && preguntaActiva ? { id: preguntaActiva.id, accion: 'conversar' } : undefined,
      timestamp: Date.now(),
    };

    const nextMessages = [...(f?.reintento ? messages.slice(0, -1) : messages), userMessage];
    setMessages(nextMessages);
    if (!f) {
      setInputText('');
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS_CAMPO.length);
      prevVacioRef.current = true;
      setAttachedFile(null);
      setMostrarAvisoPrivacidadArchivo(false);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await enviarConversacionAlServidor(nextMessages, userMessage.icfes);
  };

  
// ===== Entrenador Saber 11: pedir preguntas, responder, pistas y marcador =====
const llevarAPregunta = (idMensaje: string) => {
  window.setTimeout(() => {
    const contenedor = getContenedor();
    const el = document.querySelector<HTMLElement>(`[data-mensaje="${idMensaje}"]`);
    if (!contenedor || !el) return;
    pegadoAlFondoRef.current = false;
    const top = el.getBoundingClientRect().top - contenedor.getBoundingClientRect().top + contenedor.scrollTop - 12;
    contenedor.scrollTo({ top, behavior: 'auto' });
  }, 120);
};

const pedirPregunta = async (area: string) => {
  if (cargandoPregunta || isLoading) return;
  ultimaAreaRef.current = area;
  setCargandoPregunta(true);
  setErrorMessage(null);
  try {
    const excluir = vistasRef.current.slice(-400).join(',');
    const r = await fetch(`/api/icfes/pregunta?area=${encodeURIComponent(area)}&excluir=${encodeURIComponent(excluir)}&estudiante=${encodeURIComponent(estudiante || '')}&despuesDe=${encodeURIComponent(preguntaActiva && preguntaActiva.area === area ? preguntaActiva.id : '')}`);
    const d: any = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'No se pudo traer la pregunta. Intenta de nuevo.');
    const p = d as PreguntaIcfesMeta;
      p.orden = messages.filter((m: any) => !!m.pregunta).length + 1;
    if (p.reinicio) {
        const fuera = new Set<string>((p as any).limpiar || []);
        vistasRef.current = vistasRef.current.filter((id) => !fuera.has(id) && !id.startsWith(p.cuadernilloId + '-'));
      }
    vistasRef.current.push(p.id);
      guardarVistas();
    const idMensaje = `pregunta-${p.id}-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: idMensaje,
        role: 'model',
        text: `Te propuse la pregunta ${p.orden ?? p.numero} de ${p.areaNombre}, tomada del ${p.cuadernillo}.`,
        pregunta: p,
        timestamp: Date.now(),
      },
    ]);
    llevarAPregunta(idMensaje);
  } catch (e: any) {
    setErrorMessage(e?.message || 'No se pudo traer la pregunta. Intenta de nuevo.');
  } finally {
    setCargandoPregunta(false);
  }
};

const mostrarSelectorAreas = () => {
  const idMensaje = `selector-${Date.now()}`;
  setMessages((prev) => [...prev, { id: idMensaje, role: 'model', text: '', selector: true, timestamp: Date.now() }]);
  llevarAPregunta(idMensaje);
};

const responderIcfes = (p: PreguntaIcfesMeta, letra: string, justificacion: string) => {
  setEstadosIcfes((prev) => ({ ...prev, [p.id]: { ...prev[p.id], respuesta: letra } }));
  handleSendMessage({
    texto: `Mi respuesta: ${letra}.` + (justificacion ? `\nMi razonamiento: ${justificacion}` : ''),
    icfes: { id: p.id, accion: 'responder', respuesta: letra },
  });
};

const pistaIcfes = (p: PreguntaIcfesMeta) => {
  const usadas = estadosIcfes[p.id]?.pistas || 0;
  setEstadosIcfes((prev) => ({ ...prev, [p.id]: { ...prev[p.id], pistas: usadas + 1 } }));
  handleSendMessage({
    texto: usadas ? 'Necesito otra pista, un poco más concreta (sin la respuesta).' : '¿Cómo abordo esta pregunta? Dame una pista sin decirme la respuesta.',
    icfes: { id: p.id, accion: 'pista' },
  });
};

const aplicarResultadoIcfes = (r: { id: string; clave: string; correcta: boolean; area: string }) => {
  if (!r || !r.id) return;
  setEstadosIcfes((prev) => ({ ...prev, [r.id]: { ...prev[r.id], clave: r.clave, correcta: !!r.correcta } }));
  setMarcador((prev) => {
    const a = prev[r.area] || { aciertos: 0, intentos: 0 };
    return { ...prev, [r.area]: { aciertos: a.aciertos + (r.correcta ? 1 : 0), intentos: a.intentos + 1 } };
  });
};

// Reintentar: vuelve a enviar el último mensaje del estudiante (o vuelve a pedir la pregunta)
const reintentar = () => {
  const ultimo = messages[messages.length - 1];
  if (ultimo?.role === 'user') {
    handleSendMessage({ texto: ultimo.text, archivo: ultimo.archivo, icfes: ultimo.icfes, reintento: true });
  } else if (esIcfes && ultimaAreaRef.current) {
    pedirPregunta(ultimaAreaRef.current);
  } else {
    handleSendMessage();
  }
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!modo.adjuntos) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!modo.adjuntos) return;
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!modo.adjuntos) return;
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className="relative flex-1 flex flex-col min-h-0 w-full bg-transparent overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Barra superior del chat: botón '‹ Modos' a la izquierda y el título centrado */}
      <div
        className="absolute top-0 inset-x-0 bg-[var(--color-superficie)]/80 backdrop-blur-md border-b border-[var(--color-separador)] px-4 h-[50px] z-20 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: barraVisible ? 'translateY(0)' : 'translateY(-100%)' }}
        onFocus={() => setBarraVisible(true)}
      >
        <div className="max-w-[720px] mx-auto h-full flex items-center justify-between gap-1 relative">
          {/* Botón ‹ Modos */}
          <button
            onClick={intentarVolverAModos}
            type="button"
            className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--color-acento)] hover:opacity-75 transition-opacity z-10 -ml-1 shrink-0 focus-visible:outline-none"
            aria-label="Volver a la selección de modos"
          >
            <ChevronLeft className="w-5 h-5 -mr-1" />
            <span>Modos</span>
          </button>

          {/* Título del modo centrado */}
          <div className="flex-1 min-w-0 flex items-center justify-center pointer-events-none px-2">
            <h2 className="text-[15px] sm:text-[16px] font-semibold text-[var(--color-texto)] tracking-tight truncate leading-[1.5] py-0.5 max-w-full sm:max-w-[400px]">
              {modo.titulo}
            </h2>
          </div>

          {MODOS_CON_CIERRE.includes(modeKey) ? (
            <div className="flex items-center gap-2 sm:gap-3 z-10 -mr-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setVerifAbierta(true);
                  setVerifError('');
                  setBarraVisible(true);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[var(--color-acento)]/30 bg-[var(--color-acento)]/10 text-[13px] sm:text-[14px] font-medium text-[var(--color-acento)] hover:bg-[var(--color-acento)]/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none"
                aria-label="Registrar lo que verificaste fuera de la IA"
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Lo verifiqué por fuera</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAvisoSalidaSinCierre(false);
                  setCierreAbierto(true);
                  setBarraVisible(true);
                }}
                disabled={turnosEstudiante === 0 || isLoading}
                className="inline-flex items-center gap-1 text-[14px] sm:text-[15px] font-medium text-[var(--color-acento)] hover:opacity-75 transition-opacity shrink-0 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none"
                aria-label="Terminar la sesión y reflexionar"
              >
                <Flag className="w-4 h-4" />
                <span>Terminar</span>
              </button>
            </div>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>

      {/* Lo verifiqué por fuera: formulario de contrastación externa */}
      {verifAbierta && (
        <div
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-center justify-center px-4 sm:px-6 py-6"
          onClick={() => setVerifAbierta(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-verif"
            onClick={(e) => e.stopPropagation()}
            className="message-appear w-full max-w-[540px] max-h-full overflow-y-auto overscroll-contain rounded-[20px] bg-[var(--color-superficie)] border border-[var(--color-separador)]/60 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[var(--color-acento)]/10 text-[var(--color-acento)] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 id="titulo-verif" className="text-[18px] font-semibold tracking-tight text-[var(--color-texto)] leading-snug">
                    Lo verifiqué por fuera
                  </h3>
                  <p className="text-[14px] text-[var(--color-secundario)] leading-relaxed mt-0.5">
                    Cuéntale al interlocutor qué dato contrastaste en otra fuente.
                  </p>
                </div>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium text-[var(--color-texto)]">
                  ¿Qué dato o idea comprobaste?
                </span>
                <textarea
                  value={verifDato}
                  onChange={(e) => {
                    setVerifDato(e.target.value);
                    setVerifError('');
                  }}
                  rows={2}
                  maxLength={800}
                  placeholder="Ej.: La fecha o definición que mencionamos…"
                  className="w-full px-3.5 py-2 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[15px] leading-snug resize-none placeholder:text-[var(--color-secundario)]/70 focus:outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-superficie)] transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium text-[var(--color-texto)]">
                  ¿En qué fuente lo comprobaste? (nombre o enlace)
                </span>
                <input
                  type="text"
                  value={verifFuente}
                  onChange={(e) => {
                    setVerifFuente(e.target.value);
                    setVerifError('');
                  }}
                  maxLength={500}
                  placeholder="Ej.: Libro guía de Química, enciclopedia, enlace…"
                  className="w-full h-[42px] px-3.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[15px] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)]/70 focus:outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-superficie)] transition-colors"
                />
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="text-[14px] font-medium text-[var(--color-texto)]">
                  ¿Qué dice esa fuente?
                </span>
                <div className="grid grid-cols-3 gap-2" role="group" aria-label="Qué dice la fuente">
                  {(['Coincide', 'No coincide', 'Matiza'] as const).map((opcion) => (
                    <button
                      key={opcion}
                      type="button"
                      onClick={() => {
                        setVerifResultado(opcion);
                        setVerifError('');
                      }}
                      aria-pressed={verifResultado === opcion}
                      className={`h-10 rounded-[12px] border text-[14px] font-semibold transition-colors ${
                        verifResultado === opcion
                          ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-white'
                          : 'bg-[var(--color-fondo)] border-[var(--color-separador)] text-[var(--color-texto)] hover:border-[var(--color-acento)]/50'
                      }`}
                    >
                      {opcion}
                    </button>
                  ))}
                </div>
              </div>

              {verifError && (
                <p className="text-[14px] text-[#B3261E] -mt-1" role="alert">
                  {verifError}
                </p>
              )}

              <div className="flex gap-2.5 pt-1 w-full">
                <button
                  type="button"
                  onClick={() => setVerifAbierta(false)}
                  className="flex-1 min-h-[48px] h-[48px] px-4 py-3 whitespace-nowrap rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-medium text-[var(--color-acento)] inline-flex items-center justify-center hover:bg-[var(--color-fondo)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!verifDato.trim()) {
                      setVerifError('Escribe qué dato o idea comprobaste.');
                      return;
                    }
                    if (!verifFuente.trim()) {
                      setVerifError('Indica en qué fuente lo comprobaste.');
                      return;
                    }
                    if (!verifResultado) {
                      setVerifError('Selecciona qué dice la fuente (coincide, no coincide o matiza).');
                      return;
                    }
                    const texto = `[Verificación externa]\nDato o idea comprobada: ${verifDato.trim()}\nFuente: ${verifFuente.trim()}\nQué dice la fuente: ${verifResultado}`;
                    setVerifAbierta(false);
                    setVerifDato('');
                    setVerifFuente('');
                    setVerifResultado('');
                    setVerifError('');
                    handleSendMessage({ texto });
                  }}
                  className="flex-1 min-h-[48px] h-[48px] px-4 py-3 whitespace-nowrap rounded-full bg-[var(--color-acento)] text-white text-[15px] font-semibold inline-flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  Enviar al chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cierre de sesión: reflexión metacognitiva y descarga */}
      {cierreAbierto && (
        <div
          className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-center justify-center px-4 sm:px-6 py-6"
          onClick={() => {
            if (cierreEstado !== 'enviando') setCierreAbierto(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-cierre"
            onClick={(e) => e.stopPropagation()}
            className="message-appear w-full max-w-[720px] max-h-full overflow-y-auto overscroll-contain rounded-[20px] bg-[var(--color-superficie)] border border-[var(--color-separador)]/60 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              {/* Encabezado con el mismo estilo de la tarjeta de bienvenida del modo */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 text-[var(--color-acento)] flex items-center justify-center shrink-0">
                  {cierreEstado === 'listo' ? (
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Flag className="w-6 h-6" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 id="titulo-cierre" className="text-[19px] font-semibold tracking-tight text-[var(--color-texto)] leading-snug">
                    {cierreEstado === 'listo' ? 'Sesión terminada' : 'Antes de terminar'}
                  </h3>
                  <p className="text-[15px] text-[var(--color-secundario)] leading-relaxed mt-1">
                    {cierreEstado === 'listo'
                      ? 'Tu reflexión quedó guardada. Puedes descargar la conversación para repasarla o llevarla a NotebookLM.'
                      : 'Piensa un momento en lo que hiciste. Tu reflexión le llega al docente.'}
                  </p>
                </div>
              </div>

              {avisoSalidaSinCierre && cierreEstado !== 'listo' && (
                <div className="px-3.5 py-2.5 rounded-[14px] bg-[var(--color-acento)]/10 border border-[var(--color-acento)]/30 text-[14px] font-medium text-[var(--color-texto)] leading-snug">
                  Antes de volver a los modos, completa tu reflexión final para guardar el cierre de tu sesión.
                </div>
              )}

              {cierreEstado === 'listo' ? (
                <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={descargarConversacion}
                    className="w-full sm:flex-1 min-h-[48px] h-[48px] px-4 py-3 whitespace-nowrap rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-medium text-[var(--color-acento)] inline-flex items-center justify-center gap-2 hover:bg-[var(--color-fondo)] transition-colors"
                  >
                    <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Descargar conversación
                  </button>
                  <button
                    type="button"
                    onClick={onBackToModos}
                    className="w-full sm:flex-1 min-h-[48px] h-[48px] px-4 py-3 whitespace-nowrap rounded-full bg-[var(--color-acento)] text-white text-[15px] font-semibold inline-flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    Volver a los modos
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="flex items-start gap-2.5 text-[15px] font-medium text-[var(--color-texto)] leading-snug">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">1</span>
                        <span className="pt-0.5">¿Qué aprendiste tú hoy?</span>
                      </span>
                      <textarea
                        value={aprendi}
                        onChange={(e) => {
                          setAprendi(e.target.value);
                          setCierreError('');
                        }}
                        rows={2}
                        maxLength={1500}
                        placeholder="Escríbelo con tus palabras…"
                        className="w-full px-3.5 py-2.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[16px] leading-snug resize-none placeholder:text-[var(--color-secundario)]/70 focus:outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-superficie)] transition-colors"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="flex items-start gap-2.5 text-[15px] font-medium text-[var(--color-texto)] leading-snug">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">2</span>
                        <span className="pt-0.5">¿Qué comprobaste fuera de la IA hoy y dónde? (Si no comprobaste nada, escríbelo y di qué habrías podido comprobar.)</span>
                      </span>
                      <textarea
                        value={comprobe}
                        onChange={(e) => {
                          setComprobe(e.target.value);
                          setCierreError('');
                        }}
                        rows={2}
                        maxLength={1500}
                        placeholder="Escríbelo con tus palabras…"
                        className="w-full px-3.5 py-2.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[16px] leading-snug resize-none placeholder:text-[var(--color-secundario)]/70 focus:outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-superficie)] transition-colors"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="flex items-start gap-2.5 text-[15px] font-medium text-[var(--color-texto)] leading-snug">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">3</span>
                        <span className="pt-0.5">¿Qué habrías hecho sin ayuda de la IA? ¿Qué parte pensaste por tu cuenta?</span>
                      </span>
                      <textarea
                        value={sinAyuda}
                        onChange={(e) => {
                          setSinAyuda(e.target.value);
                          setCierreError('');
                        }}
                        rows={2}
                        maxLength={1500}
                        placeholder="Escríbelo con tus palabras…"
                        className="w-full px-3.5 py-2.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[16px] leading-snug resize-none placeholder:text-[var(--color-secundario)]/70 focus:outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-superficie)] transition-colors"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="flex items-start gap-2.5 text-[15px] font-medium text-[var(--color-texto)] leading-snug">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">4</span>
                        <span className="pt-0.5">
                          ¿Qué te quedó dudoso o qué te gustaría profundizar?{' '}
                          <span className="font-normal text-[var(--color-secundario)]">(opcional)</span>
                        </span>
                      </span>
                      <textarea
                        value={dudas}
                        onChange={(e) => setDudas(e.target.value)}
                        rows={2}
                        maxLength={1500}
                        className="w-full px-3.5 py-2.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[16px] leading-snug resize-none focus:outline-none focus:border-[var(--color-acento)] focus:bg-[var(--color-superficie)] transition-colors"
                      />
                    </label>

                    <div className="flex flex-col gap-2">
                      <span className="flex items-start gap-2.5 text-[15px] font-medium text-[var(--color-texto)] leading-snug">
                        <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">5</span>
                        <span className="pt-0.5">¿Qué tan seguro te sientes de explicarlo sin ayuda?</span>
                      </span>
                      <div className="flex gap-2" role="group" aria-label="Nivel de seguridad de 1 a 5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => {
                              setConfianza(n);
                              setCierreError('');
                            }}
                            aria-pressed={confianza === n}
                            className={`flex-1 h-10 rounded-[12px] border text-[15px] font-semibold transition-colors ${
                              confianza === n
                                ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-white'
                                : 'bg-[var(--color-fondo)] border-[var(--color-separador)] text-[var(--color-texto)] hover:border-[var(--color-acento)]/50'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-[12px] text-[var(--color-secundario)] px-0.5">
                        <span>Nada seguro</span>
                        <span>Muy seguro</span>
                      </div>
                    </div>
                  </div>

                  {cierreError && (
                    <p className="text-[14px] text-[#B3261E] -mt-1" role="alert">
                      {cierreError}
                    </p>
                  )}

                  <div className="flex gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => setCierreAbierto(false)}
                      disabled={cierreEstado === 'enviando'}
                      className="flex-1 min-h-[48px] h-[48px] px-4 py-3 whitespace-nowrap rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-medium text-[var(--color-acento)] inline-flex items-center justify-center hover:bg-[var(--color-fondo)] transition-colors"
                    >
                      Seguir conversando
                    </button>
                    <button
                      type="button"
                      onClick={enviarCierre}
                      disabled={cierreEstado === 'enviando'}
                      className="flex-1 min-h-[48px] h-[48px] px-4 py-3 whitespace-nowrap rounded-full bg-[var(--color-acento)] text-white text-[15px] font-semibold inline-flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-60"
                    >
                      {cierreEstado === 'enviando' ? 'Guardando…' : 'Terminar sesión'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de arrastre de archivo */}
      {isDragging && modo.adjuntos && (
        <div className="fixed inset-0 z-50 bg-[var(--color-acento)]/15 backdrop-blur-xs border-4 border-dashed border-[var(--color-acento)] flex items-center justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[var(--color-superficie)] px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <Paperclip className="w-6 h-6 text-[var(--color-acento)]" />
            <span className="text-[17px] font-semibold text-[var(--color-texto)]">
              Suelta tu archivo aquí (PDF, DOCX, TXT, Imagen)
            </span>
          </div>
        </div>
      )}

      {/* Hilo de mensajes scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-[74px] pb-2" onScroll={manejarScroll}>
        <div ref={listRef} className="max-w-[720px] mx-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
// Entrenador Saber 11: tarjeta de la pregunta (página real del cuadernillo + opciones)
if (msg.pregunta) {
  const p = msg.pregunta;
  return (
    <div key={msg.id} data-mensaje={msg.id}>
      <TarjetaPregunta
        pregunta={p}
        estado={estadosIcfes[p.id] || {}}
        activa={ultimoMsgPregunta?.id === msg.id}
        ocupado={isLoading || cargandoPregunta}
        marcadorArea={marcador[p.area]}
        onResponder={(letra, justificacion) => responderIcfes(p, letra, justificacion)}
        onPista={() => pistaIcfes(p)}
        onSiguiente={() => pedirPregunta(p.area)}
        onCambiarArea={mostrarSelectorAreas}
      />
    </div>
  );
}
if (msg.selector) {
  return (
    <div key={msg.id} data-mensaje={msg.id} className="message-appear rounded-[20px] bg-[var(--color-superficie)] border border-[var(--color-separador)]/60 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 sm:p-6">
      <p className="text-[17px] font-semibold text-[var(--color-texto)]">¿Qué área quieres practicar ahora?</p>
      <SelectorArea onElegir={pedirPregunta} deshabilitado={cargandoPregunta || isLoading} marcador={marcador} />
    </div>
  );
}


            if (msg.avisoSistema) {
              return (
                <div key={msg.id} className="flex justify-center my-2 message-appear">
                  <span className="px-3.5 py-1 rounded-full bg-[var(--color-superficie)] border border-[var(--color-separador)] text-[13px] font-medium text-[var(--color-secundario)] shadow-2xs">
                    {msg.text}
                  </span>
                </div>
              );
            }

            if (isUser) {
              return (
                <div key={msg.id} data-role="user" className="flex flex-col items-end message-appear">
                  {/* Ficha del archivo adjunto en el mensaje del estudiante */}
                  {msg.archivo && (
                    <div className="mb-2 max-w-[85%] sm:max-w-[70%] bg-[var(--color-superficie)] border border-[var(--color-separador)] rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-xs">
                      {msg.archivo.mimeType.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-[var(--color-acento)] shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-[var(--color-acento)] shrink-0" />
                      )}
                      <div className="truncate text-left">
                        <p className="text-[13px] font-medium text-[var(--color-texto)] truncate">
                          {msg.archivo.nombre}
                        </p>
                        {msg.archivo.tamano && (
                          <p className="text-[11px] text-[var(--color-secundario)]">
                            {msg.archivo.tamano}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Burbuja del estudiante: verde #0E5C36, texto blanco, radio 20px (esquina inferior derecha 6px) */}
                  {msg.text && (
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-[20px] rounded-br-[6px] px-4 py-2.5 bg-[#0E5C36] text-white shadow-xs text-[16px] leading-relaxed whitespace-pre-wrap select-text">
                      {msg.text}
                    </div>
                  )}
                </div>
              );
            }

            // Tarjeta de bienvenida del modo (instrucciones iniciales)
            if (msg.id === 'greeting') {
              const IconoModo = ICONOS_MODO[modeKey] || MessageSquareQuote;
              const pasos = modo.guia || [];
              const ejemplos = ideasPara(modeKey);
              const sinMensajes = messages.length === 1;
              return (
                <div key={msg.id} className="message-appear rounded-[20px] bg-[var(--color-superficie)] border border-[var(--color-separador)]/60 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--color-acento)]/10 text-[var(--color-acento)] flex items-center justify-center shrink-0">
                        <IconoModo className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[19px] font-semibold tracking-tight text-[var(--color-texto)] leading-snug">
                          {modo.titulo}
                        </h3>
                        {modo.descripcion && (
                          <p className="text-[15px] text-[var(--color-secundario)] leading-relaxed mt-1">
                            {modo.descripcion}
                          </p>
                        )}
                        {(modo.busqueda || modo.adjuntos) && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {modo.busqueda && (
                              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-fondo)] text-[var(--color-secundario)]">
                                <Globe className="w-3.5 h-3.5" aria-hidden="true" /> Busca en Google
                              </span>
                            )}
                            {modo.adjuntos && (
                              <span className="inline-flex items-center gap-1 text-[12px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-fondo)] text-[var(--color-secundario)]">
                                <Paperclip className="w-3.5 h-3.5" aria-hidden="true" /> Acepta archivos
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {pasos.length > 0 && (
                      <ol className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Cómo funciona">
                        {pasos.map((paso, i) => (
                          <li key={i} style={{ animationDelay: `${180 + i * 90}ms` }} className="anim-entrada flex sm:flex-col items-start gap-3 sm:gap-2 rounded-2xl bg-[var(--color-fondo)] px-3.5 py-3">
                            <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-[14px] leading-snug text-[var(--color-texto)]">{paso}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="px-5 sm:px-6 py-4 border-t border-[var(--color-separador)]/60">
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-acento)] mb-1.5">
                      Para empezar
                    </p>
                    <div className="prose-apple select-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{prepararMatematicas(msg.text)}</ReactMarkdown>
                    </div>

                    {esIcfes && (
<SelectorArea onElegir={pedirPregunta} deshabilitado={cargandoPregunta || isLoading} marcador={marcador} areaActual={preguntaActiva?.area} />
)}
{sinMensajes && (ejemplos.length > 0 || modeKey === 'tutor' || modeKey === 'escrito') && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ejemplos.map((ej) => (
                          <button
                            key={ej}
                            type="button"
                            onClick={() => {
                              setInputText(ej);
                              textareaRef.current?.focus();
                            }}
                            className="text-left text-[14px] leading-snug px-3.5 py-2 min-h-[44px] rounded-2xl border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[var(--color-texto)] hover:border-[var(--color-acento)] transition-colors"
                          >
                            {ej}
                          </button>
                        ))}
                        {ejemplos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setRondaIdeas((r) => r + 1)}
                            className="self-center text-[12px] px-2 py-1 bg-transparent text-[var(--color-texto)] opacity-50 hover:opacity-90 hover:underline transition-opacity"
                          >
                            ↻ otras ideas
                          </button>
                        )}
                        {(modeKey === 'tutor' || modeKey === 'escrito') && modo.adjuntos && (
                          <button
                            type="button"
                            onClick={() => {
                              activarAvisoPrivacidadUnaVez();
                              fileInputRef.current?.click();
                            }}
                            className="inline-flex items-center justify-center gap-2 text-[14px] font-medium px-4 py-2 min-h-[44px] rounded-2xl bg-[var(--color-acento)] text-white hover:opacity-90 transition-opacity"
                          >
                            <Upload className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span>{modeKey === 'tutor' ? 'Subir foto del ejercicio' : 'Subir mi escrito'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Respuesta de la IA: sin burbuja, sin avatar, texto sobre el fondo
            const { textoLimpio: textoMensajeLimpio, modosSugeridos } = extraerModosSugeridosYLimpiar(
              msg.text || '',
              modeKey,
              msg.modoSugerido
            );
            return (
              <div key={msg.id} className="flex flex-col message-appear">
                <div className="overflow-hidden">
                  <div className="prose-apple select-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}
                      components={{
                        pre: renderPre,
                        a: ({ node, href, children, ...props }) => {
                          const matchModo = /^\/?#?modo:(.+)$/i.exec(String(href || '').trim());
                          if (matchModo) {
                            const claveDestino = resolverIdModo(matchModo[1]) || matchModo[1].toLowerCase().trim();
                            const modoDestino = AGENTE.modos[claveDestino];
                            if (modoDestino && claveDestino !== modeKey) {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    cambiarAModo(claveDestino);
                                  }}
                                  className="relative z-10 pointer-events-auto w-full sm:w-auto min-h-[46px] h-[46px] mt-1.5 mr-2 px-5 py-2.5 rounded-full bg-[var(--color-acento)]/12 border border-[var(--color-acento)]/35 text-[15px] font-semibold text-[var(--color-acento)] inline-flex items-center justify-center gap-2 hover:bg-[var(--color-acento)]/20 transition-colors cursor-pointer"
                                >
                                  <span>{children || `Cambiar a ${modoDestino.titulo}`}</span>
                                  <span aria-hidden="true">→</span>
                                </button>
                              );
                            }
                          }
                          return (
                            <a
                              {...props}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--color-acento)] underline font-medium hover:opacity-85"
                            >
                              {children}
                            </a>
                          );
                        },
                      }}
                    >
                      {prepararMatematicas(textoMensajeLimpio)}
                    </ReactMarkdown>
                  </div>

                  {modosSugeridos.length > 0 && (onCambiarModo || onChangeModo) && (
                    <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2.5 relative z-10 pointer-events-auto">
                      {modosSugeridos.map((claveSug) => (
                        <button
                          key={claveSug}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            cambiarAModo(claveSug);
                          }}
                          className="relative z-10 pointer-events-auto w-full sm:w-auto min-h-[46px] h-[46px] px-5 py-2.5 rounded-full bg-[var(--color-acento)]/12 border border-[var(--color-acento)]/35 text-[15px] font-semibold text-[var(--color-acento)] inline-flex items-center justify-center gap-2 hover:bg-[var(--color-acento)]/20 transition-colors cursor-pointer"
                        >
                          <span>Cambiar a {AGENTE.modos[claveSug].titulo}</span>
                          <span aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chips redondeados de fuentes debajo de la respuesta */}
                  {msg.fuentes && msg.fuentes.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-separador)]/50">
                      <div className="text-[12px] font-semibold text-[var(--color-secundario)] uppercase tracking-wider mb-2">
                        Fuentes consultadas
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.fuentes.map((f, fIdx) => {
                          let hostname = '';
                          try {
                            hostname = new URL(f.url).hostname.replace(/^www\./, '');
                          } catch {
                            hostname = f.titulo;
                          }
                          return (
                            <a
                              key={fIdx}
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] bg-[var(--color-superficie)] text-[var(--color-texto)] border border-[var(--color-separador)] hover:border-[var(--color-acento)] transition-colors shadow-xs"
                              title={f.url}
                            >
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                                alt=""
                                className="w-3.5 h-3.5 rounded-xs shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <span className="truncate max-w-[300px] sm:max-w-[360px] font-medium">
                                {f.titulo || hostname}
                              </span>
                              <ExternalLink className="w-3 h-3 text-[var(--color-secundario)] shrink-0 opacity-70" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Mientras espera: en Verificar "Buscando en Google…"; en los demás, tres puntos animados */}
          {isLoading && (
            <div className="flex items-center gap-2 py-1 text-[15px] text-[var(--color-secundario)] message-appear">
              {modeKey === 'verificar' ? (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--color-acento)] animate-spin" />
                  <span className="font-medium text-[var(--color-texto)]">
                    Buscando en Google…
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 py-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-secundario)] dot-1" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-secundario)] dot-2" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-secundario)] dot-3" />
                </div>
              )}
            </div>
          )}

          {/* Entrenador Saber 11: buscando pregunta / seguir después de la retroalimentación */}
{esIcfes && cargandoPregunta && (
<div className="py-1 text-[15px] text-[var(--color-secundario)] message-appear">Buscando una pregunta en los cuadernillos del ICFES…</div>
)}
{esIcfes && preguntaActiva && estadosIcfes[preguntaActiva.id]?.correcta !== undefined && !isLoading && !cargandoPregunta && messages[messages.length - 1]?.role === 'model' && !messages[messages.length - 1]?.pregunta && !messages[messages.length - 1]?.selector && (
<div className="flex flex-col sm:flex-row gap-2.5 message-appear">
<button type="button" onClick={() => pedirPregunta(preguntaActiva.area)} className="w-full sm:w-auto sm:flex-1 h-[46px] shrink-0 rounded-full bg-[var(--color-acento)] text-white text-[15px] font-semibold hover:opacity-90 transition-opacity">
Siguiente pregunta de {preguntaActiva.areaNombre} →
</button>
<button type="button" onClick={mostrarSelectorAreas} className="w-full sm:w-auto h-[46px] shrink-0 px-4 rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-medium text-[var(--color-acento)] hover:bg-[var(--color-fondo)] transition-colors">
Cambiar de área
</button>
</div>
)}
{/* Tarjeta discreta de error con botón Reintentar */}
          {errorMessage && (
            <div className="p-3.5 bg-[var(--color-superficie)] border border-[var(--color-separador)] rounded-2xl text-[14px] text-[var(--color-texto)] flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#9B1C1C] shrink-0 mt-0.5" />
                <p className="text-[var(--color-secundario)]">{errorMessage}</p>
              </div>
              <button
                onClick={reintentar}
                type="button"
                className="px-3 py-1 rounded-lg bg-[var(--color-fondo)] text-[var(--color-texto)] font-medium text-[13px] hover:bg-[var(--color-separador)]/50 transition-colors shrink-0"
              >
                Reintentar
              </button>
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" className="-mt-4" />
        </div>
        <div aria-hidden="true" style={{ height: espacioFinal }} />
      </div>

      {/* Campo de mensaje: tipo cápsula, flotante y centrado abajo (max-width 720px), radio 28px, fondo superficie, sombra suave, borde 1px #D2D2D7 */}
      <div className="zona-entrada px-3 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4 shrink-0 bg-transparent">
        <div className="max-w-[720px] mx-auto relative flex flex-col">
          {/* Ficha de archivo adjunto previo al envío */}
          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-superficie)] border border-[var(--color-separador)] shadow-xs self-start message-appear">
              {attachedFile.mimeType.startsWith('image/') ? (
                <ImageIcon className="w-4 h-4 text-[var(--color-acento)] shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-[var(--color-acento)] shrink-0" />
              )}
              <span className="text-[13px] font-medium text-[var(--color-texto)] truncate max-w-[220px]">
                {attachedFile.nombre}
              </span>
              <span className="text-[11px] text-[var(--color-secundario)]">
                ({attachedFile.tamano})
              </span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="ml-1 text-[var(--color-secundario)] hover:text-[var(--color-texto)] p-0.5"
                title="Quitar archivo"
                aria-label="Quitar archivo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Formulario cápsula */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="w-full min-h-[52px] bg-[var(--color-superficie)] border border-[var(--color-separador)] rounded-[28px] shadow-sm px-2.5 py-1.5 flex items-center gap-2 transition-all"
          >
            {/* Input para adjuntar archivo (solo en modos con adjuntos=true) */}
            {modo.adjuntos && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }}
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.docx"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    activarAvisoPrivacidadUnaVez();
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading || isProcessingFile}
                  className="w-[38px] h-[38px] p-0 rounded-full flex items-center justify-center self-center text-[var(--color-secundario)] hover:text-[var(--color-texto)] hover:bg-[var(--color-fondo)] transition-colors shrink-0 leading-none"
                  title="Adjuntar archivo (JPG, PNG, WEBP, PDF, TXT, DOCX — máx. 10 MB)"
                  aria-label="Adjuntar archivo"
                >
                  <Paperclip className="w-5 h-5 block shrink-0" />
                </button>
              </>
            )}

            {/* Textarea que crece automáticamente hasta 6 líneas */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || (esIcfes && !preguntaActiva)}
              placeholder={esIcfes && !preguntaActiva ? 'Elige un área para empezar' : PLACEHOLDERS_CAMPO[placeholderIdx]}
              className={`flex-1 bg-transparent py-1.5 ${modo.adjuntos ? 'pl-0.5' : 'pl-2'} pr-1 text-[16px] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] resize-none focus:outline-none max-h-[144px] leading-snug self-center`}
            />

            {/* Botón enviar circular dentro del campo a la derecha (verde, icono flecha hacia arriba, deshabilitado y gris si está vacío) */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedFile) || isLoading || isProcessingFile}
              className={`w-[38px] h-[38px] p-0 rounded-full flex items-center justify-center self-center shrink-0 leading-none transition-all ${
                (inputText.trim() || attachedFile) && !isLoading && !isProcessingFile
                  ? 'bg-[#0E5C36] dark:bg-[#2E9E64] text-white cursor-pointer active:scale-95 shadow-xs'
                  : 'bg-[var(--color-separador)]/50 text-[var(--color-secundario)] cursor-not-allowed opacity-60'
              }`}
              title="Enviar mensaje (Enter)"
              aria-label="Enviar mensaje"
            >
              <ArrowUp className="w-5 h-5 block shrink-0 stroke-[2.5]" />
            </button>
          </form>

          {modo.adjuntos && mostrarAvisoPrivacidadArchivo && (
            <p className="mt-1.5 px-4 text-[12px] text-[var(--color-secundario)] leading-snug message-appear">
              No subas documentos con tu nombre, fotos de personas ni datos personales.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
