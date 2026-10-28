import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ModosGrid } from './components/ModosGrid.tsx';
// El chat (con el visor de PDF, fórmulas y gráficas) se descarga aparte: la pantalla inicial abre más rápido
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
      setAviso('Elige tu curso.');
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
        style={{ animationDelay: '750ms' }}
        className="anim-tarjeta w-full max-w-[520px] bg-[var(--color-superficie)] rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-4 text-left"
      >
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[var(--color-texto)] leading-snug">
            Participación y consentimiento
          </h1>
          <p className="mt-2.5 text-[14px] sm:text-[15px] leading-relaxed text-[var(--color-secundario)]">
            Este espacio hace parte del proyecto escolar La IA y su incidencia en el pensamiento crítico, del Liceo Superior Rafael Pombo. No escribes tu nombre: entras con un código (tu curso y tu número de lista). Se guardan tus mensajes, las respuestas del agente y tu reflexión final, asociados solo a ese código, con fines pedagógicos y de investigación del docente. No escribas en el chat datos personales (nombre, teléfono, dirección, documentos) ni subas fotos de personas. Tu participación es voluntaria y puedes pedirle al docente que borre tus registros. Tratamiento de datos conforme a la Ley 1581 de 2012.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="flex-1">
            <label htmlFor="curso-estudiante" className="block text-[13px] font-medium text-[var(--color-secundario)] mb-1.5">
              Curso o rol en el Liceo
            </label>
            <select
              id="curso-estudiante"
              value={curso}
              onChange={(e) => {
                setCurso(e.target.value);
                setAviso('');
              }}
              className="w-full h-[48px] px-3.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[15px] sm:text-[16px] text-[var(--color-texto)] focus:outline-none focus:border-[var(--color-acento)]"
            >
              <option value="">Elige tu curso</option>
              <option value="1001">1001 (Grado 10°)</option>
              <option value="1002">1002 (Grado 10°)</option>
              <option value="1101">1101 (Grado 11°)</option>
              <option value="1102">1102 (Grado 11°)</option>
              <option value="901">Grado 9°</option>
              <option value="801">Grado 8°</option>
              <option value="701">Grado 7°</option>
              <option value="601">Grado 6°</option>
              <option value="PRIM">Básica Primaria</option>
              <option value="DOCENTE">Docente / Directivo</option>
              <option value="Otro">Otro (visitante)</option>
            </select>
          </div>

          {!sinLista && (
            <div className="flex-1">
              <label htmlFor="numero-estudiante" className="block text-[13px] font-medium text-[var(--color-secundario)] mb-1.5">
                Número de lista
              </label>
              <select
                id="numero-estudiante"
                value={numeroLista}
                onChange={(e) => {
                  setNumeroLista(e.target.value);
                  setAviso('');
                }}
                className="w-full h-[48px] px-3.5 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[15px] sm:text-[16px] text-[var(--color-texto)] focus:outline-none focus:border-[var(--color-acento)]"
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
          <div className="px-3.5 py-2 rounded-[12px] bg-[var(--color-fondo)] text-[13px] text-[var(--color-secundario)]">
            Tu código anónimo será:{' '}
            <span className="font-semibold text-[var(--color-texto)]">
              {curso === 'Otro' ? 'VISITA' : curso === 'DOCENTE' ? 'DOCENTE' : numeroLista ? `${curso}-${numeroLista}` : `${curso}-…`}
            </span>
          </div>
        )}

        <div className="rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] px-4 py-3.5 text-[13.5px] sm:text-[14px] text-[var(--color-texto)]">
          <p className="font-semibold text-[var(--color-acento)] mb-2">Nuestro pacto de uso</p>
          <ol className="list-decimal list-inside space-y-1 text-[var(--color-texto)] leading-snug">
            <li>Pienso primero, pregunto después.</li>
            <li>La IA puede equivocarse: compruebo lo importante en otra fuente.</li>
            <li>No entrego como mío lo que escribió la IA.</li>
            <li>Uso la IA para entender, no para terminar rápido.</li>
          </ol>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none text-[13.5px] sm:text-[14px] text-[var(--color-texto)] leading-snug pt-1">
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => {
              setAcepto(e.target.checked);
              setAviso('');
            }}
            className="mt-0.5 w-4 h-4 rounded border-[var(--color-separador)] text-[var(--color-acento)] focus:ring-[var(--color-acento)] shrink-0 accent-[#0E5C36]"
          />
          <span>Leí esta información, acepto participar y me comprometo con el pacto de uso.</span>
        </label>

        {aviso && <p className="text-[14px] text-[#B3261E]" role="alert">{aviso}</p>}

        <button
          type="submit"
          disabled={!botonHabilitado}
          className="h-[48px] rounded-full bg-[var(--color-acento)] text-white text-[17px] font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-1"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default function App() {
  // Mientras el estudiante escribe su nombre o elige el modo, el chat se descarga en segundo plano
  useEffect(() => {
    const t = window.setTimeout(() => cargarChat().catch(() => {}), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const [selectedModeKey, setSelectedModeKey] = useState<string | null>(null);
  const [transferredMessages, setTransferredMessages] = useState<any[] | undefined>(undefined);
  const [estudiante, setEstudiante] = useState<string>(() => leerEstudiante());

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
    if (idModo === 'icfes' || !Array.isArray(historial) || historial.length === 0) {
      setTransferredMessages(undefined);
    } else {
      setTransferredMessages(historial);
    }
    setSelectedModeKey(idModo);
  };

  return (
    <div className={`${selectedModeKey ? 'h-[var(--app-h,100dvh)] overflow-hidden' : 'min-h-screen'} flex flex-col bg-[var(--color-fondo)] text-[var(--color-texto)] selection:bg-[#0E5C36]/20 selection:text-[#0E5C36]`}>
      {/* Encabezado Apple HIG translúcido con escudo y nombres */}
      <Header
        onBackToModos={
          selectedModeKey
            ? () => {
                const ev = new CustomEvent('interlocutor:intentar-volver-modos', { cancelable: true });
                const noInterceptado = window.dispatchEvent(ev);
                if (noInterceptado) {
                  setTransferredMessages(undefined);
                  setSelectedModeKey(null);
                }
              }
            : undefined
        }
      />

      {/* Contenedor Principal */}
      <main className="flex-1 min-h-0 flex flex-col overflow-x-hidden">
        <div key={selectedModeKey ?? 'inicio'} className="vista-entrada flex-1 min-h-0 flex flex-col">
        {!estudiante ? (
          <IngresoNombre onListo={setEstudiante} />
        ) : selectedModeKey ? (
          <React.Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center py-16">
                <span className="w-7 h-7 rounded-full border-[3px] border-[var(--color-separador)] border-t-[var(--color-acento)] animate-spin" aria-label="Cargando" />
              </div>
            }
          >
            <ChatView
              key={selectedModeKey}
              modeKey={selectedModeKey}
              estudiante={estudiante}
              initialMessages={transferredMessages}
              onCambiarModo={cambiarModo}
              onChangeModo={cambiarModo}
              onBackToModos={() => {
                setTransferredMessages(undefined);
                setSelectedModeKey(null);
              }}
            />
          </React.Suspense>
        ) : (
          <>
            <div className="anim-entrada pt-5 px-4 flex items-center justify-center gap-3 text-[15px] text-[var(--color-secundario)]">
              <span>
                Código: <span className="font-semibold text-[var(--color-texto)]">{estudiante}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  guardarEstudiante('');
                  setEstudiante('');
                }}
                className="min-h-[36px] px-3.5 rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[14px] font-medium text-[var(--color-acento)] hover:bg-[var(--color-fondo)] transition-colors"
              >
                Salir
              </button>
            </div>
            <ModosGrid
              onSelectModo={(key) => cambiarModo(key)}
            />
          </>
        )}
        </div>
      </main>

      {/* Pie de página sobrio de una sola línea */}
      {!selectedModeKey && <Footer />}
    </div>
  );
}
