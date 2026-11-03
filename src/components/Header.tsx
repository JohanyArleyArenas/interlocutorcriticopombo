import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { NotificacionRecompensa } from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { BarraInferiorMovil, type SeccionApp } from './BarraNavegacionApp.tsx';
import { IconoEstrellaPombo, IconoLlamaRacha } from './IconosInsignia.tsx';

interface HeaderProps {
  onBackToModos?: () => void;
  estudiante?: string;
  seccionActiva?: SeccionApp;
  onCambiarSeccion?: (nueva: SeccionApp) => void;
  enChat?: boolean;
}

interface PulsoEstrella {
  id: number;
  cantidadGanada: number;
}

export const Header: React.FC<HeaderProps> = ({
  onBackToModos,
  estudiante,
  seccionActiva = 'inicio',
  onCambiarSeccion,
  enChat = false,
}) => {
  const { estado, infoNivel } = useGamificacion(estudiante || '');
  const progreso = estudiante ? estado : null;
  const nivel = estudiante ? infoNivel.nivelActual : null;

  const [pulsos, setPulsos] = useState<PulsoEstrella[]>([]);
  const [animandoContador, setAnimandoContador] = useState(false);

  const prevEstrellasRef = useRef<number | null>(null);
  const prevEstudianteRef = useRef<string | undefined>(estudiante);
  const ultimoDisparoTsRef = useRef<number>(0);

  const activarPulsoDinamico = (cantidadGanada = 1) => {
    const ahora = Date.now();
    if (ahora - ultimoDisparoTsRef.current < 220) return;
    ultimoDisparoTsRef.current = ahora;

    const nuevoPulso: PulsoEstrella = {
      id: ahora + Math.random(),
      cantidadGanada: Math.max(1, cantidadGanada),
    };

    setPulsos((prev) => [...prev.slice(-1), nuevoPulso]);
    setAnimandoContador(true);

    window.setTimeout(() => {
      setAnimandoContador(false);
    }, 650);

    window.setTimeout(() => {
      setPulsos((prev) => prev.filter((item) => item.id !== nuevoPulso.id));
    }, 1100);
  };

  useEffect(() => {
    if (!progreso) {
      prevEstrellasRef.current = null;
      prevEstudianteRef.current = estudiante;
      return;
    }

    if (prevEstudianteRef.current !== estudiante) {
      prevEstudianteRef.current = estudiante;
      prevEstrellasRef.current = progreso.estrellas;
      return;
    }

    if (prevEstrellasRef.current !== null && progreso.estrellas > prevEstrellasRef.current) {
      const diferencia = progreso.estrellas - prevEstrellasRef.current;
      activarPulsoDinamico(diferencia);
    }

    prevEstrellasRef.current = progreso.estrellas;
  }, [progreso?.estrellas, estudiante]);

  useEffect(() => {
    const manejarEventoRecompensa = (ev: Event) => {
      const custom = ev as CustomEvent<NotificacionRecompensa>;
      const ganadas = custom.detail?.estrellas ?? 0;
      if (ganadas > 0) {
        activarPulsoDinamico(ganadas);
      }
    };

    window.addEventListener('interlocutor:recompensa', manejarEventoRecompensa);
    return () => window.removeEventListener('interlocutor:recompensa', manejarEventoRecompensa);
  }, []);

  const manejarClickLogo = () => {
    if (onBackToModos) {
      onBackToModos();
    } else if (onCambiarSeccion) {
      onCambiarSeccion('inicio');
    }
  };

  return (
    <header className="bg-[var(--color-superficie)] border-b border-[var(--color-separador)] sticky top-0 z-40 transition-colors">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-3">
        {/* Identidad del Liceo con escudo a 36px y Literata 600 */}
        <div
          onClick={manejarClickLogo}
          className={`flex items-center gap-2.5 min-h-[44px] select-none min-w-0 ${
            onBackToModos || onCambiarSeccion ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
          }`}
          role={onBackToModos || onCambiarSeccion ? 'button' : undefined}
          tabIndex={onBackToModos || onCambiarSeccion ? 0 : undefined}
          onKeyDown={(e) => {
            if ((onBackToModos || onCambiarSeccion) && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              manejarClickLogo();
            }
          }}
        >
          {enChat && onBackToModos && (
            <span className="inline-flex items-center gap-0.5 pr-1 text-[var(--color-acento)] font-bold text-[14px] shrink-0">
              <ChevronLeft className="w-5 h-5 -ml-1" strokeWidth={2.2} />
              <span className="hidden xs:inline">Volver</span>
            </span>
          )}

          <img
            src="/escudo-liceo.png"
            alt="Escudo del Liceo Superior Rafael Pombo"
            className="h-[36px] w-auto object-contain shrink-0"
          />

          <div className="flex flex-col justify-center min-w-0">
            <span className="font-literata font-semibold text-[16px] sm:text-[17.5px] leading-tight text-[var(--color-texto)] truncate">
              Liceo Superior Rafael Pombo
            </span>
            <span className="text-[13px] text-[var(--color-secundario)] leading-tight truncate">
              MAIA{progreso?.tituloEquipado ? ` · ${progreso.tituloEquipado}` : ''}
            </span>
          </div>
        </div>

        {/* Barra de navegación: inferior en móvil (<sm) y superior horizontal fija alineada al logo en desktop (sm:) */}
        {estudiante && onCambiarSeccion && !(enChat && progreso?.modoLecturaActivo) && (
          <BarraInferiorMovil
            seccionActiva={seccionActiva}
            onCambiarSeccion={onCambiarSeccion}
            estudiante={estudiante}
            enChat={enChat}
          />
        )}

        {/* Indicadores de racha y estrellas con insignias ilustradas y respuesta dinámica al uso */}
        {progreso && nivel && !(enChat && progreso.modoLecturaActivo) && (
          <div className="relative flex items-center shrink-0 select-none">
            <motion.button
              type="button"
              onClick={() => {
                if (onCambiarSeccion && !enChat) {
                  onCambiarSeccion('retos');
                }
              }}
              animate={
                animandoContador
                  ? { scale: [1, 1.07, 0.98, 1.02, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className={`min-h-[38px] inline-flex items-center gap-2.5 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                animandoContador
                  ? 'border-[var(--color-oro)] bg-[var(--color-oro)]/10'
                  : 'border-[var(--color-separador)] bg-[var(--color-fondo)]/85 hover:border-[var(--color-acento)]/45'
              }`}
              title={`Racha de ${progreso.rachaDias} ${progreso.rachaDias === 1 ? 'día' : 'días'} · ${progreso.estrellas} ${progreso.estrellas === 1 ? 'estrella ganada' : 'estrellas ganadas'}`}
              aria-label={`Racha activa de ${progreso.rachaDias} días y ${progreso.estrellas} estrellas acumuladas`}
            >
              {/* Indicador de racha diaria */}
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-texto)] tabular-nums">
                <IconoLlamaRacha
                  className="w-[17px] h-[17px] shrink-0"
                  activo={progreso.rachaDias > 0}
                />
                <span>{progreso.rachaDias}</span>
              </span>

              <span className="w-px h-3.5 bg-[var(--color-separador)]" aria-hidden="true" />

              {/* Indicador dinámico de estrellas */}
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-texto)] tabular-nums">
                <motion.span
                  animate={
                    animandoContador
                      ? { rotate: [0, -14, 14, -6, 0], scale: [1, 1.25, 1] }
                      : { rotate: 0, scale: 1 }
                  }
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="inline-flex items-center justify-center"
                >
                  <IconoEstrellaPombo
                    className="w-[17px] h-[17px] shrink-0"
                    activo={true}
                  />
                </motion.span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={progreso.estrellas}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.22 }}
                  >
                    {progreso.estrellas}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>

            {/* Aviso dinámico flotante sobre el contador cuando el estudiante gana estrellas al usar la app */}
            <AnimatePresence>
              {pulsos.map((pulso) => (
                <motion.span
                  key={pulso.id}
                  initial={{ opacity: 0, y: 4, scale: 0.85 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -24, scale: [0.9, 1.06, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.0, ease: 'easeOut' }}
                  className="pointer-events-none absolute -top-1 right-1 whitespace-nowrap px-2 py-0.5 rounded-full bg-[var(--color-superficie)] border border-[var(--color-oro)] text-[var(--color-texto)] shadow-sm text-[11.5px] font-bold inline-flex items-center gap-1 z-40"
                >
                  <IconoEstrellaPombo className="w-3 h-3" activo={true} />
                  <span>+{pulso.cantidadGanada}</span>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};
