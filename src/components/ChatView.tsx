import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Upload
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
  explorar: ['Escribe tu pregunta o hipótesis', 'Buscamos y contrastamos información', 'Llegas a tu propia conclusión'],
  argumento: ['Escribe tu tesis y tus razones', 'La pongo a prueba con preguntas y objeciones', 'Fortaleces o ajustas tu argumento'],
  verificar: ['Pega la afirmación y dónde la viste', 'La contrastamos con evidencia', 'Recibes un veredicto con sus razones'],
  auditar: ['Pega la pregunta y la respuesta de la otra IA', 'Revisamos errores, vacíos y sesgos', 'Decides qué conservar y qué no'],
  escrito: ['Sube tu archivo o pega tu texto', 'Señalo fortalezas y aspectos por mejorar', 'Tú haces las correcciones'],
};

const EJEMPLOS_MODO: Record<string, string[]> = {
  socratico: ['Quiero entender las ecuaciones de segundo grado', 'Quiero aprender qué es la fotosíntesis'],
  explorar: ['¿Las redes sociales afectan la concentración de los jóvenes?'],
  argumento: ['Tesis: el uniforme escolar debería ser opcional, porque…'],
  verificar: ['«Tomar agua fría después de comer es peligroso». Lo vi en WhatsApp.'],
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Identificador de esta conversación (para agrupar los turnos en la hoja de registro)
  const sesionRef = useRef(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`);

  const listRef = useRef<HTMLDivElement | null>(null);
  const [espacioFinal, setEspacioFinal] = useState(0);

  // Barra del modo: se oculta al bajar y reaparece al subir (el encabezado general queda fijo)
  const [barraVisible, setBarraVisible] = useState(true);
  const ultimoScrollRef = useRef(0);
  const manejarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const actual = e.currentTarget.scrollTop;
    const delta = actual - ultimoScrollRef.current;
    if (actual < 24) {
      setBarraVisible(true);
      ultimoScrollRef.current = actual;
    } else if (Math.abs(delta) > 6) {
      setBarraVisible(delta < 0);
      ultimoScrollRef.current = actual;
    }
  };

  const getContenedor = () =>
    messagesEndRef.current?.closest('.overflow-y-auto') as HTMLElement | null;

  const scrollToBottom = (smooth = true) => {
    // Desplaza solo el hilo de mensajes (no toda la página), para que el encabezado no desaparezca en móvil
    const contenedor = getContenedor();
    if (contenedor) {
      contenedor.scrollTo({ top: contenedor.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

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

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    ajustarAlUltimoMensaje(true);
  }, [messages.length, isLoading, errorMessage]);

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
    if ((!trimmed && !attachedFile) || isLoading || isProcessingFile) return;

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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      }

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
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      setErrorMessage(
        err.message || 'No se pudo obtener respuesta del interlocutor. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
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
        className="absolute top-0 inset-x-0 bg-[var(--color-superficie)]/80 backdrop-blur-md border-b border-[var(--color-separador)] px-4 h-[50px] z-20 transition-transform duration-200 ease-out"
        style={{ transform: barraVisible ? 'translateY(0)' : 'translateY(-100%)' }}
        onFocus={() => setBarraVisible(true)}
      >
        <div className="max-w-[720px] mx-auto h-full flex items-center justify-between relative">
          {/* Botón ‹ Modos */}
          <button
            onClick={onBackToModos}
            type="button"
            className="inline-flex items-center gap-1 text-[15px] font-medium text-[var(--color-acento)] hover:opacity-75 transition-opacity z-10 -ml-1 focus-visible:outline-none"
            aria-label="Volver a la selección de modos"
          >
            <ChevronLeft className="w-5 h-5 -mr-1" />
            <span>Modos</span>
          </button>

          {/* Título del modo centrado */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <h2 className="text-[16px] font-semibold text-[var(--color-texto)] tracking-tight truncate max-w-[280px] sm:max-w-[400px]">
              {modo.titulo}
            </h2>
          </div>

          <div className="w-12" />
        </div>
      </div>

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
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-[74px] pb-6 space-y-6" onScroll={manejarScroll}>
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
              const ejemplos = EJEMPLOS_MODO[modeKey] || [];
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
                          <li key={i} className="flex sm:flex-col items-start gap-3 sm:gap-2 rounded-2xl bg-[var(--color-fondo)] px-3.5 py-3">
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
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
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
                      remarkPlugins={[remarkGfm]}
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
                      {msg.text}
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

          <div ref={messagesEndRef} />
        </div>
        <div aria-hidden="true" style={{ height: espacioFinal }} />
      </div>

      {/* Campo de mensaje: tipo cápsula, flotante y centrado abajo (max-width 720px), radio 28px, fondo superficie, sombra suave, borde 1px #D2D2D7 */}
      <div className="p-3 sm:pb-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0 bg-transparent">
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
