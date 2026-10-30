import React, { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { PanelGamificacion, ToastRecompensaFlotante } from './components/PanelGamificacion.tsx';
import {
  BarraInferiorMovil,
  ORDEN_SECCIONES,
  type SeccionApp,
} from './components/BarraNavegacionApp.tsx';
import type { CategoriaCulturaGeneral } from './gamificacion.ts';
import { useSonidos } from './useSonidos.ts';

// Carga diferida de vistas para acelerar el arranque inicial en el navegador
const cargarPantallaInicio = () => import('./components/PantallaInicio.tsx');
const PantallaInicio = React.lazy(() =>
  cargarPantallaInicio().then((m) => ({ default: m.PantallaInicio }))
);

const cargarModosGrid = () => import('./components/ModosGrid.tsx');
const ModosGrid = React.lazy(() => cargarModosGrid().then((m) => ({ default: m.ModosGrid })));

const cargarPantallaPerfil = () => import('./components/PantallaPerfil.tsx');
const PantallaPerfil = React.lazy(() =>
  cargarPantallaPerfil().then((m) => ({ default: m.PantallaPerfil }))
);

// El chat (con fórmulas, gráficas y entrenador) se descarga en segundo plano
const cargarChat = () => import('./components/ChatView.tsx');
const ChatView = React.lazy(() => cargarChat().then((m) => ({ default: m.ChatView })));

// ===== Identificación del estudiante (se pide una vez por pestaña) =====
const CLAVE_ESTUDIANTE = 'interlocutor-estudiante';
let estudianteEnMemoria = '';

function leerEstudiante(): string {
  try {
    return sessionStorage.getItem(CLAVE_ESTUDIANTE) || estudianteEnMemoria;
  } catch {
    return estudianteEnMemoria;
  }
}

function guardarEstudiante(nombre: string) {
  estudianteEnMemoria = nombre;
  try {
    if (nombre) sessionStorage.setItem(CLAVE_ESTUDIANTE, nombre);
    else sessionStorage.removeItem(CLAVE_ESTUDIANTE);
  } catch {
    /* sin almacenamiento: se conserva en memoria */
  }
}

function IngresoNombre({ onListo }: { onListo: (codigo: string) => void }) {
  const [curso, setCurso] = useState('');
  const [numeroLista, setNumeroLista] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [aviso, setAviso] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso) {
      setAviso('Elige tu grado o rol.');
      return;
    }
    const sinLista = curso === 'Otro' || curso === 'DOCENTE';
    if (!sinLista && !numeroLista) {
      setAviso('Elige tu número de lista.');
      return;
    }
    if (!acepto) {
      setAviso('Debes leer y aceptar la información para participar.');
      return;
    }

    const codigo = curso === 'Otro' ? 'VISITA' : curso === 'DOCENTE' ? 'DOCENTE' : `${curso}-${numeroLista}`;
    guardarEstudiante(codigo);
    onListo(codigo);
  };

  const sinLista = curso === 'Otro' || curso === 'DOCENTE';
  const botonHabilitado = acepto && !!curso && (sinLista || !!numeroLista);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <form
        onSubmit={enviar}
        className="w-full max-w-[520px] bg-[var(--color-superficie)] border border-[var(--color-separador)] rounded-[14px] p-6 sm:p-8 flex flex-col gap-4 text-left"
      >
        <div>
          <h1 className="font-literata text-[24px] sm:text-[26px] font-semibold tracking-[-0.015em] text-[var(--color-texto)] leading-snug">
            Participación y consentimiento
          </h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--color-secundario)]">
            Este espacio hace parte del proyecto escolar La IA y su incidencia en el pensamiento crítico, del Liceo Superior Rafael Pombo. No escribes tu nombre: entras con un código (tu grado y tu número de lista). Se guardan tus mensajes, las respuestas del agente y tu reflexión final, asociados solo a ese código, con fines pedagógicos y de investigación del docente. No escribas en el chat datos personales (nombre, teléfono, dirección, documentos) ni subas fotos de personas. Tu participación es voluntaria y puedes pedirle al docente que borre tus registros. Tratamiento de datos conforme a la Ley 1581 de 2012.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="flex-1">
            <label htmlFor="curso-estudiante" className="block text-[14px] font-semibold text-[var(--color-texto)] mb-1.5">
              Grado o rol en el Liceo
            </label>
            <select
              id="curso-estudiante"
              value={curso}
              onChange={(e) => {
                setCurso(e.target.value);
                setAviso('');
              }}
              className="w-full h-[46px] px-3.5 rounded-[10px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[15px] sm:text-[16px] text-[var(--color-texto)] focus:outline-none focus:border-[var(--color-acento)]"
            >
              <option value="">Elige tu grado</option>
              <option value="11">Grado 11°</option>
              <option value="10">Grado 10°</option>
              <option value="9">Grado 9°</option>
              <option value="8">Grado 8°</option>
              <option value="7">Grado 7°</option>
              <option value="6">Grado 6°</option>
              <option value="PRIM">Básica Primaria</option>
              <option value="DOCENTE">Docente / Directivo</option>
              <option value="Otro">Otro (visitante)</option>
            </select>
          </div>

          {!sinLista && (
            <div className="flex-1">
              <label htmlFor="numero-estudiante" className="block text-[14px] font-semibold text-[var(--color-texto)] mb-1.5">
                Número de lista
              </label>
              <select
                id="numero-estudiante"
                value={numeroLista}
                onChange={(e) => {
                  setNumeroLista(e.target.value);
                  setAviso('');
                }}
                className="w-full h-[46px] px-3.5 rounded-[10px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[15px] sm:text-[16px] text-[var(--color-texto)] focus:outline-none focus:border-[var(--color-acento)]"
              >
                <option value="">Número (1 a 45)</option>
                {Array.from({ length: 45 }, (_, i) => {
                  const num = i + 1;
                  const nn = String(num).padStart(2, '0');
                  return (
                    <option key={num} value={nn}>
                      {nn}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {curso && (
          <div className="px-3.5 py-2 rounded-[10px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[14px] text-[var(--color-secundario)]">
            Tu código anónimo será:{' '}
            <span className="font-semibold text-[var(--color-texto)]">
              {curso === 'Otro' ? 'VISITA' : curso === 'DOCENTE' ? 'DOCENTE' : numeroLista ? `${curso}-${numeroLista}` : `${curso}-…`}
            </span>
          </div>
        )}

        <div className="rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] px-4 py-3.5 text-[14px] text-[var(--color-texto)]">
          <p className="font-semibold text-[var(--color-acento)] mb-2">Nuestro pacto de uso</p>
          <ol className="list-decimal list-inside space-y-1 text-[var(--color-texto)] leading-snug">
            <li>Pienso primero, pregunto después.</li>
            <li>La IA puede equivocarse: compruebo lo importante en otra fuente.</li>
            <li>No entrego como mío lo que escribió la IA.</li>
            <li>Uso la IA para entender, no para terminar rápido.</li>
          </ol>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none text-[14px] text-[var(--color-texto)] leading-snug pt-1">
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => {
              setAcepto(e.target.checked);
              setAviso('');
            }}
            className="mt-0.5 w-4 h-4 rounded border-[var(--color-separador)] text-[var(--color-acento)] focus:ring-[var(--color-acento)] shrink-0 accent-[var(--color-acento)]"
          />
          <span>Leí esta información, acepto participar y me comprometo con el pacto de uso.</span>
        </label>

        {aviso && <p className="text-[14px] text-[var(--color-rojo)]" role="alert">{aviso}</p>}

        <button
          type="submit"
          disabled={!botonHabilitado}
          className="h-[48px] rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[16px] font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-1 sombra-boton-acento"
        >
          Entrar al cuaderno
        </button>
      </form>
    </div>
  );
}

export default function App() {
  // Precarga progresiva en segundo plano cuando el navegador está libre:
  // primero la cuadrícula de modos y luego la vista de conversación.
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let tChat: number | undefined;
    const precargar = () => {
      cargarPantallaInicio().catch(() => {});
      cargarModosGrid().catch(() => {});
      cargarPantallaPerfil().catch(() => {});
      tChat = window.setTimeout(() => cargarChat().catch(() => {}), 600);
    };
    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(precargar, { timeout: 1000 });
      return () => {
        win.cancelIdleCallback?.(idleId);
        if (tChat) window.clearTimeout(tChat);
      };
    }
    const t = window.setTimeout(precargar, 250);
    return () => {
      window.clearTimeout(t);
      if (tChat) window.clearTimeout(tChat);
    };
  }, []);

  const [selectedModeKey, setSelectedModeKey] = useState<string | null>(null);
  const [transferredMessages, setTransferredMessages] = useState<any[] | undefined>(undefined);
  const [sesionIdReanudada, setSesionIdReanudada] = useState<string | undefined>(undefined);
  const [esReanudacion, setEsReanudacion] = useState<boolean>(false);
  const [estudiante, setEstudiante] = useState<string>(() => leerEstudiante());
  const [seccionActiva, setSeccionActiva] = useState<SeccionApp>('inicio');
  const [direccionVista, setDireccionVista] = useState<number>(1);
  const [pestanaRetosInicial, setPestanaRetosInicial] = useState<
    'retos' | 'desafio' | 'recompensas' | 'logros'
  >('desafio');
  const [categoriaDesafioInicial, setCategoriaDesafioInicial] = useState<
    'Todas' | CategoriaCulturaGeneral
  >('Todas');
  const { tocarClic, tocarNavegacion } = useSonidos(estudiante, {
    escucharEventosGlobales: true,
  });

  // Móvil: ajusta la altura de la app al área visible cuando aparece el teclado,
  // así el encabezado queda fijo y solo se mueve el hilo del chat.
  useEffect(() => {
    const vv = window.visualViewport;
    const raiz = document.documentElement;
    raiz.classList.toggle('chat-activo', !!selectedModeKey);
    const temporizadores: number[] = [];
    const ajustar = () => {
      const alto = vv ? vv.height : window.innerHeight;
      raiz.style.setProperty('--app-h', `${Math.round(alto)}px`);
      const el = document.activeElement as HTMLElement | null;
      const escribiendo = !!el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT');
      raiz.classList.toggle('teclado-abierto', escribiendo && window.matchMedia('(pointer: coarse)').matches);
      if (selectedModeKey && (window.scrollY !== 0 || (vv && vv.offsetTop !== 0))) window.scrollTo(0, 0);
    };
    // El teclado de iPhone y Android se abre/cierra con animación: se vuelve a medir
    // varias veces hasta que la altura final se estabiliza (evita que el chat quede a medias).
    const ajustarEnCascada = () => {
      ajustar();
      temporizadores.splice(0).forEach((id) => window.clearTimeout(id));
      [60, 160, 320, 600].forEach((ms) => temporizadores.push(window.setTimeout(ajustar, ms)));
    };
    ajustar();
    window.scrollTo({ top: 0, behavior: 'auto' });
    vv?.addEventListener('resize', ajustarEnCascada);
    vv?.addEventListener('scroll', ajustar);
    window.addEventListener('resize', ajustarEnCascada);
    window.addEventListener('orientationchange', ajustarEnCascada);
    document.addEventListener('focusin', ajustarEnCascada);
    document.addEventListener('focusout', ajustarEnCascada);
    return () => {
      temporizadores.forEach((id) => window.clearTimeout(id));
      vv?.removeEventListener('resize', ajustarEnCascada);
      vv?.removeEventListener('scroll', ajustar);
      window.removeEventListener('resize', ajustarEnCascada);
      window.removeEventListener('orientationchange', ajustarEnCascada);
      document.removeEventListener('focusin', ajustarEnCascada);
      document.removeEventListener('focusout', ajustarEnCascada);
      raiz.classList.remove('chat-activo', 'teclado-abierto');
    };
  }, [selectedModeKey]);

  const cambiarModo = (idModo: string, historial?: any[]) => {
    if (!idModo) return;
    tocarClic();
    setDireccionVista(1);
    setSesionIdReanudada(undefined);
    setEsReanudacion(false);
    if (idModo === 'icfes' || !Array.isArray(historial) || historial.length === 0) {
      setTransferredMessages(undefined);
    } else {
      setTransferredMessages(historial);
    }
    setSelectedModeKey(idModo);
  };

  const retomarConversacion = (sesion: {
    id: string;
    modoKey: string;
    mensajes: any[];
  }) => {
    if (!sesion?.modoKey) return;
    tocarClic();
    setDireccionVista(1);
    setSesionIdReanudada(sesion.id);
    setEsReanudacion(true);
    setTransferredMessages(sesion.mensajes);
    setSelectedModeKey(sesion.modoKey);
  };

  const cambiarSeccionNavegacion = (nuevaSeccion: SeccionApp) => {
    if (selectedModeKey) {
      const ev = new CustomEvent('interlocutor:intentar-volver-modos', { cancelable: true });
      const noInterceptado = window.dispatchEvent(ev);
      if (!noInterceptado) return;
      tocarNavegacion();
      setDireccionVista(-1);
      setTransferredMessages(undefined);
      setSesionIdReanudada(undefined);
      setEsReanudacion(false);
      setSelectedModeKey(null);
      setSeccionActiva(nuevaSeccion);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (nuevaSeccion === seccionActiva) {
      tocarClic();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    tocarNavegacion();
    const dir = ORDEN_SECCIONES[nuevaSeccion] > ORDEN_SECCIONES[seccionActiva] ? 1 : -1;
    setDireccionVista(dir);
    setSeccionActiva(nuevaSeccion);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const abrirDesafioCulturalDirecto = (
    categoria: 'Todas' | CategoriaCulturaGeneral = 'Todas'
  ) => {
    tocarClic();
    const dir = ORDEN_SECCIONES['retos'] >= ORDEN_SECCIONES[seccionActiva] ? 1 : -1;
    setDireccionVista(dir);
    setCategoriaDesafioInicial(categoria);
    setPestanaRetosInicial('desafio');
    setSeccionActiva('retos');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const variantesTransicionPantalla = {
    entrar: {
      y: 8,
      opacity: 0,
    },
    centro: {
      y: 0,
      opacity: 1,
    },
    salir: {
      opacity: 0,
    },
  };

  const claveVistaActiva = !estudiante
    ? 'consentimiento'
    : selectedModeKey
    ? `chat-${selectedModeKey}`
    : `tab-${seccionActiva}`;

  return (
    <div
      className={`${
        selectedModeKey ? 'h-[var(--app-h,100dvh)] overflow-hidden' : 'min-h-screen'
      } flex flex-col bg-[var(--color-fondo)] text-[var(--color-texto)] selection:bg-[var(--color-acento-suave)] selection:text-[var(--color-acento)]`}
    >
      <Header
        estudiante={estudiante}
        seccionActiva={seccionActiva}
        onCambiarSeccion={estudiante ? cambiarSeccionNavegacion : undefined}
        enChat={!!selectedModeKey}
        onBackToModos={
          selectedModeKey
            ? () => {
                const ev = new CustomEvent('interlocutor:intentar-volver-modos', {
                  cancelable: true,
                });
                const noInterceptado = window.dispatchEvent(ev);
                if (noInterceptado) {
                  setDireccionVista(-1);
                  setTransferredMessages(undefined);
                  setSelectedModeKey(null);
                }
              }
            : undefined
        }
      />

      <main className="flex-1 min-h-0 flex flex-col overflow-x-hidden">
        <AnimatePresence mode="wait" custom={direccionVista} initial={false}>
          <motion.div
            key={claveVistaActiva}
            custom={direccionVista}
            variants={variantesTransicionPantalla}
            initial="entrar"
            animate="centro"
            exit="salir"
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-h-0 flex flex-col"
          >
            {!estudiante ? (
              <IngresoNombre onListo={setEstudiante} />
            ) : selectedModeKey ? (
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center py-16">
                    <span
                      className="w-7 h-7 rounded-full border-[3px] border-[var(--color-separador)] border-t-[var(--color-acento)] animate-spin"
                      aria-label="Cargando"
                    />
                  </div>
                }
              >
                <ChatView
                  key={sesionIdReanudada ? `${selectedModeKey}-${sesionIdReanudada}` : selectedModeKey}
                  modeKey={selectedModeKey}
                  estudiante={estudiante}
                  initialMessages={transferredMessages}
                  sesionIdInicial={sesionIdReanudada}
                  esReanudacion={esReanudacion}
                  onCambiarModo={cambiarModo}
                  onChangeModo={cambiarModo}
                  onBackToModos={() => {
                    setDireccionVista(-1);
                    setTransferredMessages(undefined);
                    setSesionIdReanudada(undefined);
                    setEsReanudacion(false);
                    setSelectedModeKey(null);
                  }}
                />
              </Suspense>
            ) : (
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center py-16">
                    <span
                      className="w-7 h-7 rounded-full border-[3px] border-[var(--color-separador)] border-t-[var(--color-acento)] animate-spin"
                      aria-label="Cargando sección"
                    />
                  </div>
                }
              >
                {seccionActiva === 'inicio' && (
                  <PantallaInicio
                    estudiante={estudiante}
                    onSelectModo={(key) => cambiarModo(key)}
                    onCambiarSeccion={cambiarSeccionNavegacion}
                    onAbrirDesafioCultural={abrirDesafioCulturalDirecto}
                  />
                )}

                {seccionActiva === 'modos' && (
                  <ModosGrid
                    estudiante={estudiante}
                    onSelectModo={(key) => cambiarModo(key)}
                    mostrarGamificacion={false}
                  />
                )}

                {seccionActiva === 'retos' && (
                  <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-8 flex flex-col">
                    <div className="mb-6 select-none">
                      <h1 className="font-literata text-[30px] font-semibold tracking-[-0.015em] text-[var(--color-texto)] leading-tight">
                        Retos y logros
                      </h1>
                      <p className="text-[15px] text-[var(--color-secundario)] mt-1">
                        Cultura general, misiones diarias y reconocimientos académicos.
                      </p>
                    </div>
                    <PanelGamificacion
                      estudiante={estudiante}
                      onSelectModo={(key) => cambiarModo(key)}
                      pestanaInicial={pestanaRetosInicial}
                      categoriaDesafioInicial={categoriaDesafioInicial}
                    />
                  </div>
                )}

                {seccionActiva === 'perfil' && (
                  <PantallaPerfil
                    estudiante={estudiante}
                    onSelectModo={(key) => cambiarModo(key)}
                    onRetomarConversacion={retomarConversacion}
                    onCambiarSeccion={cambiarSeccionNavegacion}
                    onAbrirDesafioCultural={abrirDesafioCulturalDirecto}
                    onSalirEstudiante={() => {
                      guardarEstudiante('');
                      setEstudiante('');
                      setSeccionActiva('inicio');
                    }}
                  />
                )}
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Barra de Navegación Inferior estilo iPhone (Solo en móvil cuando no está en un chat) */}
      {estudiante && !selectedModeKey && (
        <BarraInferiorMovil
          seccionActiva={seccionActiva}
          onCambiarSeccion={cambiarSeccionNavegacion}
          estudiante={estudiante}
        />
      )}

      {/* Notificación flotante de estrellas, retos e insignias */}
      <ToastRecompensaFlotante />

      {/* Pie de página sobrio en Web/Tablet */}
      {!selectedModeKey && (
        <div className="hidden sm:block">
          <Footer />
        </div>
      )}
    </div>
  );
}
