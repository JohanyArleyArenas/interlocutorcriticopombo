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
import mammoth from 'mammoth';
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
  Download
} from 'lucide-react';
import { AGENTE, ModoConfig } from '../parametros.ts';

// Presentación de cada modo en la tarjeta de bienvenida del chat
const ICONOS_MODO: Record<string, React.ElementType> = {
  socratico: MessageSquareQuote,
  explorar: Search,
  argumento: Scale,
  verificar: CheckCircle2,
  auditar: Cpu,
  escrito: FileText,
};

const PASOS_MODO: Record<string, string[]> = {
  socratico: ['Dime el tema y la materia', 'Te explico un poco y te hago una pregunta', 'Avanzas paso a paso hasta explicarlo con tus palabras'],
  explorar: ['Afinamos tu pregunta de investigación', 'Aprendes a buscar fuentes académicas gratuitas', 'Las estudias en NotebookLM y evalúas lo hallado'],
  argumento: ['Escribe tu tesis y tus razones', 'La revisamos por etapas: estructura, falacias, sesgos y objeciones', 'La pules hasta que esté lista para redactar'],
  verificar: ['Pega la afirmación y dónde la viste', 'La contrastamos con evidencia', 'Recibes un veredicto con sus razones'],
  auditar: ['Pega la pregunta y la respuesta de la otra IA', 'Revisamos errores, vacíos y sesgos', 'Decides qué conservar y qué no'],
  escrito: ['Sube tu archivo o pega tu texto', 'Reviso por rondas: estructura, párrafos, oraciones y ortografía', 'Corriges y me envías cada nueva versión'],
};

const EJEMPLOS_MODO: Record<string, string[]> = {
  socratico: ['Quiero entender las ecuaciones de segundo grado', 'Quiero aprender qué es la fotosíntesis'],
  explorar: ['¿Las redes sociales afectan la concentración de los jóvenes?'],
  argumento: ['Tesis: el uniforme escolar debería ser opcional, porque…'],
  verificar: ['«Tomar agua fría después de comer es peligroso». Lo vi en WhatsApp.'],
};

// Modos que muestran el botón «Terminar» (cierre con reflexión)
const MODOS_CON_CIERRE = ['socratico', 'argumento'];

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
  timestamp: number;
}

interface ChatViewProps {
  modeKey: string;
  onBackToModos: () => void;
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

export const ChatView: React.FC<ChatViewProps> = ({ modeKey, onBackToModos, estudiante }) => {
  const modo: ModoConfig = AGENTE.modos[modeKey] || {
    titulo: 'Diálogo socrático',
    descripcion: '',
    saludo: '',
    instrucciones: '',
    busqueda: false,
    adjuntos: false,
    temperatura: 0.7,
    maxTokens: 1000,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greeting',
      role: 'model',
      text: modo.saludo,
      timestamp: Date.now(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFilePreview | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Sugerencias dinámicas: cambian en cada ingreso y con el botón 'Otras ideas'
  const [rondaIdeas, setRondaIdeas] = useState(0);
  const cacheIdeasRef = useRef<Record<string, string[]>>({});
  const ideasPara = (clave: string): string[] => {
    const base = EJEMPLOS_MODO[clave] || [];
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
  const [cierreEstado, setCierreEstado] = useState<'editando' | 'enviando' | 'listo'>('editando');
  const [cierreError, setCierreError] = useState('');
  const [aprendi, setAprendi] = useState('');
  const [dudas, setDudas] = useState('');
  const [confianza, setConfianza] = useState(0);
  const turnosEstudiante = messages.filter((m) => m.role === 'user').length;

  const enviarCierre = async () => {
    if (!aprendi.trim()) {
      setCierreError('Escribe al menos qué aprendiste.');
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
          aprendi,
          dudas,
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
    } catch (e: any) {
      setCierreEstado('editando');
      setCierreError(e?.message || 'No se pudo guardar tu reflexión. Intenta de nuevo.');
    }
  };

  const descargarConversacion = () => {
    const fecha = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    const lineas: string[] = [`Interlocutor Crítico — ${modo.titulo}`, `Estudiante: ${estudiante || ''}`, `Fecha: ${fecha}`, ''];
    messages.forEach((m) => {
      lineas.push(m.role === 'user' ? 'YO:' : 'INTERLOCUTOR CRÍTICO:');
      if (m.archivo) lineas.push(`[Archivo: ${m.archivo.nombre}]`);
      lineas.push(m.text || '', '');
    });
    if (cierreEstado === 'listo') {
      lineas.push(
        'MI REFLEXIÓN FINAL',
        `Qué aprendí: ${aprendi}`,
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

  const processFile = async (file: File) => {
    const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
    if (file.size > MAX_SIZE) {
      alert('El archivo no debe superar 15 MB.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg', 'webp'];
    if (!allowed.includes(ext)) {
      alert('Formato no admitido. Acepta: PDF, DOCX, TXT, MD, PNG, JPG, WEBP.');
      return;
    }

    setIsProcessingFile(true);
    try {
      let texto: string | undefined = undefined;
      let data: string | undefined = undefined;

      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        texto = result.value;
      } else if (ext === 'txt' || ext === 'md') {
        texto = await file.text();
      } else {
        // PDF or Image: read as DataURL base64
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
        mimeType: file.type || `application/${ext}`,
        tamano: formatFileSize(file.size),
        data,
        texto,
      });
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Error al procesar archivo:', err);
      alert('No se pudo leer el archivo. Intenta de nuevo.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if ((!trimmed && !attachedFile) || isLoading || isProcessingFile || enviandoRef.current) return;
    enviandoRef.current = true;

    let userArchivo: ChatArchivo | undefined = undefined;
    if (attachedFile) {
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
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInputText('');
    setAttachedFile(null);
    setErrorMessage(null);
    // En móvil se cierra el teclado al enviar para poder leer la respuesta
    if (esMovil()) textareaRef.current?.blur();
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const payloadMessages = nextMessages.map((msg) => ({
        role: msg.role,
        text: msg.text,
        archivo: msg.archivo,
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || (res.status === 429
          ? 'El tutor está atendiendo a muchas personas en este momento. Espera un minuto y vuelve a intentarlo.'
          : res.status >= 500
            ? 'El tutor tuvo un problema técnico. Intenta de nuevo en unos segundos.'
            : `Error del servidor (${res.status})`));
      }

      const tipo = res.headers.get('content-type') || '';
      if (tipo.includes('application/x-ndjson') && res.body) {
        // Respuesta en vivo: el texto aparece mientras el modelo lo escribe
        const idRespuesta = `model-${Date.now()}`;
        let acumulado = '';
        let creado = false;
        const pintar = (texto: string, fuentesFinales?: any[]) => {
          if (!creado) {
            creado = true;
            setIsLoading(false);
            const nuevoMensaje: ChatMessage = {
              id: idRespuesta,
              role: 'model',
              text: texto,
              fuentes: fuentesFinales || [],
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, nuevoMensaje]);
          } else {
            setMessages((prev) =>
              prev.map((mm) => (mm.id === idRespuesta ? { ...mm, text: texto, ...(fuentesFinales ? { fuentes: fuentesFinales } : {}) } : mm))
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
            const evento = JSON.parse(linea);
            if (evento.t === 'delta') {
              acumulado += evento.text || '';
              pintar(acumulado);
            } else if (evento.t === 'reinicio') {
              acumulado = '';
            } else if (evento.t === 'fin') {
              acumulado = evento.reply || acumulado;
              pintar(acumulado, Array.isArray(evento.fuentes) ? evento.fuentes : []);
              terminado = true;
            } else if (evento.t === 'error') {
              throw new Error(evento.error || 'Se interrumpió la respuesta. Intenta de nuevo.');
            }
          }
        }
        if (!creado) throw new Error('No llegó respuesta del interlocutor. Intenta de nuevo.');
      } else {
        const data = await res.json();
        const replyText = data.reply || '';
        const fuentes = Array.isArray(data.fuentes) ? data.fuentes : [];
  
        const agentMessage: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: replyText,
          fuentes,
          timestamp: Date.now(),
        };
  
        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      setErrorMessage(
        err.message || 'No se pudo obtener respuesta del interlocutor. Por favor intenta de nuevo.'
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
            onClick={onBackToModos}
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
            <button
                type="button"
                onClick={() => {
                  setCierreAbierto(true);
                  setBarraVisible(true);
                }}
                disabled={turnosEstudiante === 0 || isLoading}
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--color-acento)] hover:opacity-75 transition-opacity z-10 -mr-1 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none"
                aria-label="Terminar la sesión y reflexionar"
              >
                <Flag className="w-4 h-4" />
                <span>Terminar</span>
              </button>
            ) : (
              <div className="w-12" />
            )}
        </div>
      </div>

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

              {cierreEstado === 'listo' ? (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={descargarConversacion}
                    className="flex-1 h-[46px] rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-medium text-[var(--color-acento)] inline-flex items-center justify-center gap-2 hover:bg-[var(--color-fondo)] transition-colors"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Descargar conversación
                  </button>
                  <button
                    type="button"
                    onClick={onBackToModos}
                    className="flex-1 h-[46px] rounded-full bg-[var(--color-acento)] text-white text-[15px] font-semibold hover:opacity-90 transition-opacity"
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
                        <span className="pt-0.5">¿Qué aprendiste o qué cambió en tu forma de pensar el tema?</span>
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
                        <span className="w-6 h-6 rounded-full bg-[var(--color-acento)] text-white text-[13px] font-semibold flex items-center justify-center shrink-0">3</span>
                        <span className="pt-0.5">¿Qué tan seguro te sientes de explicarlo sin ayuda?</span>
                      </span>
                      <div className="flex gap-2" role="group" aria-label="Nivel de seguridad de 1 a 5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setConfianza(n)}
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

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCierreAbierto(false)}
                      disabled={cierreEstado === 'enviando'}
                      className="flex-1 h-[46px] px-3 whitespace-nowrap rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[14px] sm:text-[15px] font-medium text-[var(--color-acento)] hover:bg-[var(--color-fondo)] transition-colors"
                    >
                      Seguir conversando
                    </button>
                    <button
                      type="button"
                      onClick={enviarCierre}
                      disabled={cierreEstado === 'enviando'}
                      className="flex-1 h-[46px] px-3 whitespace-nowrap rounded-full bg-[var(--color-acento)] text-white text-[14px] sm:text-[15px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
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
              const pasos = PASOS_MODO[modeKey] || [];
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

                    {sinMensajes && (ejemplos.length > 0 || modo.adjuntos) && (
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
                        {modo.adjuntos && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 text-[14px] font-medium px-4 py-2 min-h-[44px] rounded-2xl bg-[var(--color-acento)] text-white hover:opacity-90 transition-opacity"
                          >
                            <Upload className="w-4 h-4" aria-hidden="true" /> Subir mi escrito
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Respuesta de la IA: sin burbuja, sin avatar, texto sobre el fondo
            return (
              <div key={msg.id} className="flex flex-col message-appear">
                <div className="overflow-hidden">
                  <div className="prose-apple select-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-acento)] underline font-medium hover:opacity-85"
                          />
                        ),
                      }}
                    >
                      {prepararMatematicas(msg.text)}
                    </ReactMarkdown>
                  </div>

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
                              <span className="truncate max-w-[200px] font-medium">
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

          {/* Mientras espera: en modos con búsqueda "Buscando en Google…"; en los demás, tres puntos animados */}
          {isLoading && (
            <div className="flex items-center gap-2 py-1 text-[15px] text-[var(--color-secundario)] message-appear">
              {modo.busqueda ? (
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

          {/* Tarjeta discreta de error con botón Reintentar */}
          {errorMessage && (
            <div className="p-3.5 bg-[var(--color-superficie)] border border-[var(--color-separador)] rounded-2xl text-[14px] text-[var(--color-texto)] flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#9B1C1C] shrink-0 mt-0.5" />
                <p className="text-[var(--color-secundario)]">{errorMessage}</p>
              </div>
              <button
                onClick={handleSendMessage}
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
            className="w-full bg-[var(--color-superficie)] border border-[var(--color-separador)] rounded-[28px] shadow-sm px-4 py-2 flex items-end gap-2 transition-all"
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
                  accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isProcessingFile}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-secundario)] hover:text-[var(--color-texto)] hover:bg-[var(--color-fondo)] transition-colors shrink-0 mb-0.5"
                  title="Adjuntar archivo (.pdf, .docx, .txt, .md, imagen)"
                  aria-label="Adjuntar archivo"
                >
                  <Paperclip className="w-5 h-5" />
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
              disabled={isLoading}
              placeholder="Escribe aquí…"
              className="flex-1 bg-transparent py-2 text-[16px] text-[var(--color-texto)] placeholder:text-[var(--color-secundario)] resize-none focus:outline-none max-h-[144px] leading-snug"
            />

            {/* Botón enviar circular de 36px dentro del campo a la derecha (verde, icono flecha hacia arriba, deshabilitado y gris si está vacío) */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedFile) || isLoading || isProcessingFile}
              className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-all ${
                (inputText.trim() || attachedFile) && !isLoading && !isProcessingFile
                  ? 'bg-[#0E5C36] dark:bg-[#2E9E64] text-white cursor-pointer active:scale-95 shadow-xs'
                  : 'bg-[var(--color-separador)]/50 text-[var(--color-secundario)] cursor-not-allowed opacity-60'
              }`}
              title="Enviar mensaje (Enter)"
              aria-label="Enviar mensaje"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
