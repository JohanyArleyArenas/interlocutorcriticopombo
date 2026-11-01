import React from 'react';
import {
  GraduationCap,
  Sigma,
  MessageSquareQuote,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { CategoriaCulturaGeneral } from '../gamificacion.ts';
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
  icono: React.ElementType;
}> = [
  {
    key: 'icfes',
    icono: GraduationCap,
  },
  {
    key: 'tutor',
    icono: Sigma,
  },
  {
    key: 'socratico',
    icono: MessageSquareQuote,
  },
  {
    key: 'verificar',
    icono: CheckCircle2,
  },
];

const TEMAS_CULTURA: Array<{ id: 'Todas' | CategoriaCulturaGeneral; label: string }> = [
  { id: 'Todas', label: 'Mixto' },
  { id: 'Colombia y Santander', label: 'Colombia y Santander' },
  { id: 'Matemáticas y Lógica', label: 'Matemáticas y lógica' },
  { id: 'Geografía y Planeta', label: 'Geografía y planeta' },
  { id: 'Ciencia y Universo', label: 'Ciencia y universo' },
  { id: 'Literatura y Arte', label: 'Literatura y arte' },
  { id: 'Historia y Mundo', label: 'Historia y mundo' },
];

export const PantallaInicio: React.FC<PantallaInicioProps> = ({
  estudiante,
  onSelectModo,
  onCambiarSeccion,
  onAbrirDesafioCultural,
}) => {
  const { estado, infoNivel } = useGamificacion(estudiante);

  return (
    <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 pt-5 pb-[76px] sm:py-7 flex flex-col gap-5">
      {/* Saludo y estado actual */}
      <div
        style={{ animationDelay: '40ms' }}
        className="anim-entrada flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-literata text-[28px] sm:text-[30px] font-semibold text-[var(--color-texto)] leading-tight">
            Hola, {estudiante}
          </h1>
          <p className="text-[14.5px] text-[var(--color-secundario)] mt-1">
            Nivel {infoNivel.nivelActual.nivel} · {infoNivel.nivelActual.nombre}
            {estado.tituloEquipado ? ` · ${estado.tituloEquipado}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onCambiarSeccion('perfil')}
          className="min-h-[40px] px-3 inline-flex items-center text-[14px] font-semibold text-[var(--color-acento)] hover:underline cursor-pointer shrink-0"
        >
          Historial y perfil
        </button>
      </div>

      {/* Estaciones principales de estudio */}
      <section aria-label="Estaciones de estudio">
        <div
          style={{ animationDelay: '90ms' }}
          className="anim-entrada flex items-baseline justify-between mb-3"
        >
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Estaciones de estudio
          </h2>
          <button
            type="button"
            onClick={() => onCambiarSeccion('modos')}
            className="min-h-[40px] px-2 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--color-acento)] hover:underline cursor-pointer"
          >
            <span>Ver los 8 modos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3.5">
          {ESTACIONES_DESTACADAS.map((est, idxEst) => {
            const modoCfg = AGENTE.modos[est.key];
            if (!modoCfg) return null;
            const Icono = est.icono;
            return (
              <button
                key={est.key}
                type="button"
                style={{ animationDelay: `${120 + idxEst * 55}ms` }}
                onClick={() => onSelectModo(est.key)}
                className="anim-tarjeta group rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] hover:border-[var(--color-acento)] p-4 sm:p-5 text-left flex flex-col justify-between gap-2 transition-colors cursor-pointer"
              >
                <div>
                  <div className="w-9 h-9 rounded-[10px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center mb-3">
                    <Icono className="w-[18px] h-[18px]" strokeWidth={2} />
                  </div>
                  <h3 className="font-literata text-[17.5px] font-semibold text-[var(--color-texto)] group-hover:text-[var(--color-acento)] transition-colors leading-snug">
                    {modoCfg.titulo}
                  </h3>
                  <p className="text-[14.5px] text-[var(--color-secundario)] leading-relaxed mt-1 line-clamp-2">
                    {modoCfg.descripcion}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tarjeta de Desafío Cultural */}
      <section
        aria-label="Desafío del día"
        style={{ animationDelay: '260ms' }}
        className="anim-tarjeta"
      >
        <div className="rounded-[18px] bg-[#1F5A40] text-[#FBFCFA] p-5 sm:p-6 flex flex-col gap-4 border border-[#1F5A40]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-[540px]">
              <h2 className="font-literata text-[20px] sm:text-[21px] font-semibold text-[#FBFCFA] leading-snug">
                Desafío de cultura general
              </h2>
              <p className="text-[14.5px] text-[#E2ECE5] mt-1 leading-relaxed">
                Rondas breves de cuatro preguntas con explicación formativa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAbrirDesafioCultural('Todas')}
              className="min-h-[42px] px-5 py-2 rounded-full bg-[#FBFCFA] text-[#1F5A40] text-[14.5px] font-bold hover:opacity-95 transition-opacity shrink-0 self-start sm:self-center cursor-pointer sombra-boton-acento"
            >
              Comenzar ronda
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#FBFCFA]/18">
            {TEMAS_CULTURA.map((tema) => (
              <button
                key={tema.id}
                type="button"
                onClick={() => onAbrirDesafioCultural(tema.id)}
                className="min-h-[34px] px-3 py-1 rounded-full bg-[#FBFCFA]/12 hover:bg-[#FBFCFA]/22 text-[#FBFCFA] text-[13.5px] transition-colors cursor-pointer"
              >
                {tema.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PantallaInicio;
