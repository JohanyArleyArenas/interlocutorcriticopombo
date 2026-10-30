import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Star, Sparkles, ChevronLeft } from 'lucide-react';
import type { NotificacionRecompensa } from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { BarraInferiorMovil, type SeccionApp } from './BarraNavegacionApp.tsx';

interface HeaderProps {
  onBackToModos?: () => void;
  estudiante?: string;
  seccionActiva?: SeccionApp;
  onCambiarSeccion?: (nueva: SeccionApp) => void;
  enChat?: boolean;
}

interface ParticulaEstrella {
  id: number;
  dx: number;
  dy: number;
  escala: number;
  rotacion: number;
  color: string;
  forma: 'estrella' | 'destello' | 'punto';
  retraso: number;
}

interface ExplosionActiva {
  id: number;
  cantidadGanada: number;
  particulas: ParticulaEstrella[];
}

const COLORES_PARTICULAS = [
  'var(--color-oro)',
  'var(--color-acento)',
  '#D9B25A',
  '#A97C1F',
];

function crearParticulasExplosion(semilla: number, total = 12): ParticulaEstrella[] {
  return Array.from({ length: total }, (_, i) => {
    const anguloBase = (Math.PI * 2 * i) / total;
    const variacionAngulo = ((semilla + i * 17) % 10) * 0.04 - 0.2;
    const angulo = anguloBase + variacionAngulo;
    const distancia = 24 + ((i * 13 + semilla) % 24);
    const formas: ParticulaEstrella['forma'][] = ['estrella', 'destello', 'punto'];

    return {
      id: i,
      dx: Math.cos(angulo) * distancia,
      dy: Math.sin(angulo) * distancia - 6,
      escala: 0.65 + ((i * 7) % 5) * 0.12,
      rotacion: (i % 2 === 0 ? 1 : -1) * (90 + i * 22),
      color: COLORES_PARTICULAS[i % COLORES_PARTICULAS.length],
      forma: formas[i % formas.length],
      retraso: (i % 4) * 0.02,
    };
  });
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

  const [explosiones, setExplosiones] = useState<ExplosionActiva[]>([]);
  const [animandoContador, setAnimandoContador] = useState(false);

  const prevEstrellasRef = useRef<number | null>(null);
  const prevEstudianteRef = useRef<string | undefined>(estudiante);
  const ultimoDisparoTsRef = useRef<number>(0);

  const dispararExplosionEstrellas = (cantidadGanada = 1) => {
    const ahora = Date.now();
    if (ahora - ultimoDisparoTsRef.current < 180) return;
    ultimoDisparoTsRef.current = ahora;

    const nuevaExplosion: ExplosionActiva = {
      id: ahora + Math.random(),
      cantidadGanada: Math.max(1, cantidadGanada),
      particulas: crearParticulasExplosion(ahora, 12),
    };

    setExplosiones((prev) => [...prev.slice(-2), nuevaExplosion]);
    setAnimandoContador(true);

    window.setTimeout(() => {
      setAnimandoContador(false);
    }, 700);

    window.setTimeout(() => {
      setExplosiones((prev) => prev.filter((item) => item.id !== nuevaExplosion.id));
    }, 1050);
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
      dispararExplosionEstrellas(diferencia);
    }

    prevEstrellasRef.current = progreso.estrellas;
  }, [progreso?.estrellas, estudiante]);

  useEffect(() => {
    const manejarEventoRecompensa = (ev: Event) => {
      const custom = ev as CustomEvent<NotificacionRecompensa>;
      const ganadas = custom.detail?.estrellas ?? 0;
      if (ganadas > 0) {
        dispararExplosionEstrellas(ganadas);
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
              Interlocutor Crítico{progreso?.tituloEquipado ? `, ${progreso.tituloEquipado}` : ''}
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

        {/* Indicadores de racha y estrellas */}
        {progreso && nivel && !(enChat && progreso.modoLecturaActivo) && (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 select-none text-[14px] text-[var(--color-texto)] tabular-nums">
            <span
              className="inline-flex items-center gap-1 min-h-[44px] px-1.5 text-[var(--color-rojo)] font-bold"
              title={`Racha activa de ${progreso.rachaDias} ${progreso.rachaDias === 1 ? 'día' : 'días'}`}
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>{progreso.rachaDias}</span>
            </span>

            <div className="relative inline-flex items-center justify-center">
              <motion.button
                type="button"
                onClick={() => {
                  dispararExplosionEstrellas(1);
                  if (onCambiarSeccion && !enChat) {
                    onCambiarSeccion('perfil');
                  }
                }}
                animate={
                  animandoContador
                    ? { scale: [1, 1.2, 0.96, 1.08, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-separador)] bg-[var(--color-fondo)] text-[var(--color-texto)] hover:border-[var(--color-oro)] transition-colors cursor-pointer"
                title={`${progreso.estrellas} estrellas acumuladas`}
                aria-label={`${progreso.estrellas} estrellas acumuladas`}
              >
                <Star className="w-4 h-4 text-[var(--color-oro)] fill-[var(--color-oro)]" />
                <span className="font-bold">{progreso.estrellas}</span>
              </motion.button>

              <AnimatePresence>
                {explosiones.map((exp) => (
                  <React.Fragment key={exp.id}>
                    <motion.span
                      initial={{ scale: 0.7, opacity: 0.8 }}
                      animate={{ scale: 2.1, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="pointer-events-none absolute inset-0 rounded-full border-2 border-[var(--color-oro)]"
                    />

                    <motion.span
                      initial={{ opacity: 0, y: 4, scale: 0.8 }}
                      animate={{ opacity: [0, 1, 1, 0], y: -26, scale: [0.85, 1.1, 1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[var(--color-oro)] text-[#FBFCFA] text-[11px] font-bold z-40"
                    >
                      +{exp.cantidadGanada}
                    </motion.span>

                    {exp.particulas.map((p) => (
                      <motion.span
                        key={p.id}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                        animate={{
                          x: p.dx,
                          y: p.dy,
                          scale: [0, p.escala, p.escala * 0.85, 0],
                          opacity: [1, 1, 0.85, 0],
                          rotate: p.rotacion,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 0.78,
                          delay: p.retraso,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{ color: p.color }}
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                      >
                        {p.forma === 'estrella' ? (
                          <Star className="w-3 h-3 fill-current" />
                        ) : p.forma === 'destello' ? (
                          <Sparkles className="w-3 h-3 fill-current" />
                        ) : (
                          <span
                            className="block w-2 h-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        )}
                      </motion.span>
                    ))}
                  </React.Fragment>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
