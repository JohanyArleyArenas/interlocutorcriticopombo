import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Sigma,
  MessageSquareQuote,
  CheckCircle2,
  Check,
  Star,
  Flame,
  Zap,
} from 'lucide-react';
import {
  CATALOGO_RETOS_DIARIOS,
  CategoriaCulturaGeneral,
} from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { AGENTE } from '../parametros.ts';
import type { SeccionApp } from './BarraNavegacionApp.tsx';

interface PantallaInicioProps {
  estudiante: string;
  onSelectModo: (key: string) => void;
  onCambiarSeccion: (seccion: SeccionApp) => void;
  onAbrirDesafioCultural: (categoria?: 'Todas' | CategoriaCulturaGeneral) => void;
}

const ESTACIONES_DESTACADAS: Array<{
  key: string;
  recompensa: string;
  icono: React.ElementType;
}> = [
  {
    key: 'icfes',
    recompensa: '+2 estrellas por acierto',
    icono: GraduationCap,
  },
  {
    key: 'tutor',
    recompensa: '+2 estrellas con apuntes',
    icono: Sigma,
  },
  {
    key: 'socratico',
    recompensa: '+1 estrella por argumento',
    icono: MessageSquareQuote,
  },
  {
    key: 'verificar',
    recompensa: '+3 estrellas al contrastar',
    icono: CheckCircle2,
  },
];

const TEMAS_CULTURA: Array<{ id: 'Todas' | CategoriaCulturaGeneral; label: string }> = [
  { id: 'Todas', label: 'Mixto' },
  { id: 'Colombia y Santander', label: 'Colombia y Santander' },
  { id: 'Literatura y Arte', label: 'Literatura y arte' },
  { id: 'Ciencia y Universo', label: 'Ciencia y universo' },
  { id: 'Historia y Mundo', label: 'Historia y mundo' },
];

export const PantallaInicio: React.FC<PantallaInicioProps> = ({
  estudiante,
  onSelectModo,
  onCambiarSeccion,
  onAbrirDesafioCultural,
}) => {
  const { estado, infoNivel } = useGamificacion(estudiante);
  const porcentajeMetaHoy = Math.min(
    100,
    Math.round((estado.estrellasHoy / estado.metaEstrellasDiaria) * 100)
  );
  const retosCompletadosHoy = CATALOGO_RETOS_DIARIOS.filter(
    (r) => estado.retos[r.id]?.completado
  ).length;

  return (
    <div className="vista-entrada w-full max-w-[820px] mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-9 flex flex-col gap-7">
      {/* Saludo y línea discreta con nivel y racha */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-literata text-[30px] font-semibold text-[var(--color-texto)] leading-tight">
            Hola, {estudiante}
          </h1>
          <p className="text-[14px] text-[var(--color-secundario)] mt-1">
            Nivel {infoNivel.nivelActual.nivel} ({infoNivel.nivelActual.nombre}), racha activa de{' '}
            {estado.rachaDias} {estado.rachaDias === 1 ? 'día' : 'días'}
            {estado.tituloEquipado ? `, ${estado.tituloEquipado}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCambiarSeccion('perfil')}
          className="min-h-[44px] px-3 inline-flex items-center text-[14px] font-bold text-[var(--color-acento)] hover:underline cursor-pointer shrink-0"
        >
          Ver perfil
        </button>
      </div>

      {/* Tarjeta protagonista única: Desafío del día */}
      <section aria-label="Desafío del día">
        <div className="rounded-[20px] bg-[#1F5A40] text-[#FBFCFA] p-5 sm:p-6 flex flex-col gap-5 border border-[#1F5A40]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[540px]">
              <h2 className="font-literata text-[21px] sm:text-[22px] font-semibold text-[#FBFCFA] leading-snug">
                Desafío del día: cultura general
              </h2>
              <p className="text-[16px] text-[#E2ECE5] mt-1.5 leading-relaxed">
                Cuatro preguntas sobre Santander, literatura, ciencia e historia universal con explicación formativa. Suma hasta 8 estrellas por ronda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAbrirDesafioCultural('Todas')}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#FBFCFA] text-[#1F5A40] text-[15px] font-bold hover:opacity-95 transition-opacity shrink-0 self-start sm:self-center cursor-pointer sombra-boton-acento"
            >
              Comenzar ronda
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3.5 border-t border-[#FBFCFA]/20">
            {TEMAS_CULTURA.map((tema) => (
              <button
                key={tema.id}
                type="button"
                onClick={() => onAbrirDesafioCultural(tema.id)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-[#FBFCFA]/14 hover:bg-[#FBFCFA]/24 text-[#FBFCFA] text-[14px] transition-colors cursor-pointer"
              >
                {tema.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Franja compacta de una línea (Estrellas, Racha y XP) + Barras finas sin caja */}
      <section aria-label="Progreso diario" className="flex flex-col gap-4">
        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[15px]">
          <div className="inline-flex items-center gap-2">
            <Star className="w-4 h-4 text-[var(--color-oro)] fill-[var(--color-oro)] shrink-0" />
            <span className="font-bold text-[var(--color-texto)] tabular-nums">{estado.estrellas}</span>
            <span className="text-[14px] text-[var(--color-secundario)]">estrellas</span>
          </div>

          <div className="inline-flex items-center gap-2">
            <Flame className="w-4 h-4 text-[var(--color-rojo)] fill-[var(--color-rojo)] shrink-0" />
            <span className="font-bold text-[var(--color-texto)] tabular-nums">{estado.rachaDias}</span>
            <span className="text-[14px] text-[var(--color-secundario)]">
              {estado.rachaDias === 1 ? 'día de racha' : 'días de racha'}
            </span>
          </div>

          <div className="inline-flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--color-acento)] shrink-0" />
            <span className="font-bold text-[var(--color-texto)] tabular-nums">{estado.xp}</span>
            <span className="text-[14px] text-[var(--color-secundario)]">puntos de experiencia</span>
          </div>
        </div>

        {/* Meta diaria y nivel como barras finas con su texto, sin caja */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
          <div>
            <div className="flex items-baseline justify-between text-[14px] mb-1.5">
              <span className="text-[var(--color-secundario)]">
                Meta de hoy:{' '}
                <strong className="font-bold text-[var(--color-texto)] tabular-nums">
                  {estado.estrellasHoy} de {estado.metaEstrellasDiaria} estrellas
                </strong>
              </span>
              <span className="text-[var(--color-texto)] font-bold tabular-nums">
                {porcentajeMetaHoy}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentajeMetaHoy}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full rounded-full bg-[var(--color-acento)]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between text-[14px] mb-1.5">
              <span className="text-[var(--color-secundario)]">
                Nivel {infoNivel.nivelActual.nivel}:{' '}
                <strong className="font-bold text-[var(--color-texto)]">
                  {infoNivel.nivelActual.nombre}
                </strong>
              </span>
              <span className="text-[var(--color-secundario)] tabular-nums">
                {infoNivel.siguienteNivel
                  ? `Faltan ${infoNivel.xpParaSiguiente} XP`
                  : 'Nivel máximo'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${infoNivel.progresoPorcentaje}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full rounded-full bg-[var(--color-acento)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modos destacados en cuadrícula de 2 columnas (1 en < 360px) */}
      <section aria-label="Modos de estudio destacados">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Estaciones de estudio
          </h2>
          <button
            type="button"
            onClick={() => onCambiarSeccion('modos')}
            className="min-h-[44px] px-2 inline-flex items-center text-[14px] font-bold text-[var(--color-acento)] hover:underline cursor-pointer"
          >
            Ver los 8 modos
          </button>
        </div>

        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3.5">
          {ESTACIONES_DESTACADAS.map((est) => {
            const modoCfg = AGENTE.modos[est.key];
            if (!modoCfg) return null;
            const Icono = est.icono;
            return (
              <button
                key={est.key}
                type="button"
                onClick={() => onSelectModo(est.key)}
                className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] hover:border-[var(--color-acento)] p-4 text-left flex flex-col justify-between gap-3 transition-colors cursor-pointer"
              >
                <div>
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center mb-3">
                    <Icono className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <h3 className="font-literata text-[17px] font-semibold text-[var(--color-texto)] leading-snug">
                    {modoCfg.titulo}
                  </h3>
                  <p className="text-[14px] text-[var(--color-secundario)] leading-relaxed mt-1 line-clamp-2">
                    {modoCfg.descripcion}
                  </p>
                </div>

                <span className="text-[13px] font-bold text-[var(--color-acento)] pt-2 border-t border-[var(--color-separador)]">
                  {est.recompensa}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Misiones del día: lista tipo cuaderno con casilla circular, descripción completa y recompensa a la derecha */}
      <section aria-label="Misiones del día">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Misiones del día ({retosCompletadosHoy} de {CATALOGO_RETOS_DIARIOS.length})
          </h2>
          <button
            type="button"
            onClick={() => onCambiarSeccion('retos')}
            className="min-h-[44px] px-2 inline-flex items-center text-[14px] font-bold text-[var(--color-acento)] hover:underline cursor-pointer"
          >
            Abrir sección de retos
          </button>
        </div>

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
          {CATALOGO_RETOS_DIARIOS.map((reto) => {
            const prog = estado.retos[reto.id] || {
              actual: 0,
              completado: false,
              reclamado: false,
            };
            return (
              <button
                key={reto.id}
                type="button"
                onClick={() =>
                  prog.completado ? onCambiarSeccion('retos') : onSelectModo(reto.modoSugerido)
                }
                className="w-full px-4 py-4 text-left flex items-start justify-between gap-4 hover:bg-[var(--color-acento-suave)]/35 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      prog.completado
                        ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-[var(--color-superficie)]'
                        : 'border-[var(--color-secundario)]/60 bg-transparent'
                    }`}
                  >
                    {prog.completado && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`text-[16px] font-bold leading-snug ${
                        prog.completado
                          ? 'text-[var(--color-secundario)] line-through'
                          : 'text-[var(--color-texto)]'
                      }`}
                    >
                      {reto.titulo}
                    </p>
                    <p className="text-[14px] text-[var(--color-secundario)] leading-relaxed mt-0.5">
                      {reto.descripcion} ({prog.actual} de {reto.meta})
                    </p>
                  </div>
                </div>

                <span className="text-[14px] font-bold text-[var(--color-oro)] shrink-0 tabular-nums pt-0.5">
                  +{reto.estrellas} {reto.estrellas === 1 ? 'estrella' : 'estrellas'}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PantallaInicio;
