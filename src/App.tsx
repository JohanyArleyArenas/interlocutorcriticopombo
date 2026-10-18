import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ModosGrid } from './components/ModosGrid.tsx';
import { ChatView } from './components/ChatView.tsx';

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

function IngresoNombre({ onListo }: { onListo: (nombre: string) => void }) {
  const [nombre, setNombre] = useState('');
  const [aviso, setAviso] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    // Nombre normalizado: espacios simples y mayúscula inicial en cada palabra,
    // para que «juan  pérez» y «Juan Pérez» queden registrados igual.
    const limpio = nombre
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('es')
      .split(' ')
      .map((p) => p.charAt(0).toLocaleUpperCase('es') + p.slice(1))
      .join(' ');
    if (limpio.split(' ').length < 2) {
      setAviso('Escribe tu nombre y tu apellido.');
      return;
    }
    guardarEstudiante(limpio);
    onListo(limpio);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={enviar}
        style={{ animationDelay: '750ms' }}
        className="anim-tarjeta w-full max-w-[420px] bg-[var(--color-superficie)] rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 sm:p-8 flex flex-col gap-4"
      >
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.02em]">Antes de empezar</h1>
          <p className="mt-1 text-[15px] text-[var(--color-secundario)]">Escribe tu nombre completo.</p>
        </div>
        <label htmlFor="nombre-estudiante" className="sr-only">Nombre completo</label>
        <input
          id="nombre-estudiante"
          type="text"
          autoComplete="name"
          autoFocus
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setAviso('');
          }}
          placeholder="Nombre y apellidos"
          className="h-[48px] px-4 rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[17px] focus:outline-none focus:border-[var(--color-acento)]"
        />
        {aviso && <p className="text-[14px] text-[#B3261E]" role="alert">{aviso}</p>}
        <button
          type="submit"
          className="h-[48px] rounded-full bg-[var(--color-acento)] text-white text-[17px] font-semibold hover:opacity-90 transition-opacity cursor-pointer"
        >
          Entrar
        </button>
        <p className="text-[13px] leading-snug text-[var(--color-secundario)]">
          Tus conversaciones con el Interlocutor Crítico se guardan para fines pedagógicos del docente.
        </p>
      </form>
    </div>
  );
}

export default function App() {
  const [selectedModeKey, setSelectedModeKey] = useState<string | null>(null);
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

  return (
    <div className={`${selectedModeKey ? 'h-[var(--app-h,100dvh)] overflow-hidden' : 'min-h-screen'} flex flex-col bg-[var(--color-fondo)] text-[var(--color-texto)] selection:bg-[#0E5C36]/20 selection:text-[#0E5C36]`}>
      {/* Encabezado Apple HIG translúcido con escudo y nombres */}
      <Header
        onBackToModos={selectedModeKey ? () => setSelectedModeKey(null) : undefined}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 min-h-0 flex flex-col overflow-x-hidden">
        <div key={selectedModeKey ?? 'inicio'} className="vista-entrada flex-1 min-h-0 flex flex-col">
        {!estudiante ? (
          <IngresoNombre onListo={setEstudiante} />
        ) : selectedModeKey ? (
          <ChatView
            key={selectedModeKey}
            modeKey={selectedModeKey}
            estudiante={estudiante}
            onBackToModos={() => setSelectedModeKey(null)}
          />
        ) : (
          <>
            <div className="anim-entrada pt-5 px-4 flex items-center justify-center gap-3 text-[15px] text-[var(--color-secundario)]">
              <span>
                Sesión de <span className="font-semibold text-[var(--color-texto)]">{estudiante}</span>
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
            <ModosGrid onSelectModo={(key) => setSelectedModeKey(key)} />
          </>
        )}
        </div>
      </main>

      {/* Pie de página sobrio de una sola línea */}
      {!selectedModeKey && <Footer />}
    </div>
  );
}
