import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import {
  CategoriaCulturaGeneral,
  INSIGNIAS_CATALOGO,
  PREGUNTAS_DESAFIO_RELAMPAGO,
  RECOMPENSAS_CANJEABLES,
} from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { AGENTE } from '../parametros.ts';
import { IconoEstrellaPombo } from './IconosInsignia.tsx';

export interface PanelLogrosProps {
  estudiante: string;
  onSelectModo?: (key: string) => void;
  onIniciarDesafioCultural?: (categoria: 'Todas' | CategoriaCulturaGeneral) => void;
}

const RANGOS_CULTURALES = [
  {
    min: 0,
    titulo: 'Explorador cultural',
    metaSiguiente: 2,
    descripcion: 'Recorrido inicial por el patrimonio de Santander, la ciencia y las artes.',
  },
  {
    min: 2,
    titulo: 'Cronista de Santander',
    metaSiguiente: 5,
    descripcion: 'Conexión entre la historia local y los grandes hitos universales.',
  },
  {
    min: 5,
    titulo: 'Lector Rafael Pombo',
    metaSiguiente: 10,
    descripcion: 'Dominio de relaciones entre literatura, pensamiento científico e historia.',
  },
  {
    min: 10,
    titulo: 'Mente enciclopédica',
    metaSiguiente: 15,
    descripcion: 'Referente de cultura general y rigor intelectual en el Liceo.',
  },
];

const AREAS_CULTURALES: Array<{
  id: CategoriaCulturaGeneral;
  titulo: string;
  subtitulo: string;
}> = [
  {
    id: 'Colombia y Santander',
    titulo: 'Colombia y Santander',
    subtitulo: 'Cañón del Chicamocha, historia comunera y patrimonio regional',
  },
  {
    id: 'Matemáticas y Lógica',
    titulo: 'Matemáticas y lógica',
    subtitulo: 'Razonamiento cuantitativo, probabilidad, geometría y acertijos',
  },
  {
    id: 'Geografía y Planeta',
    titulo: 'Geografía y planeta',
    subtitulo: 'Relieve andino, océanos, tectónica, climas y continentes',
  },
  {
    id: 'Ciencia y Universo',
    titulo: 'Ciencia y universo',
    subtitulo: 'Física, química, biología, astronomía y grandes inventos',
  },
  {
    id: 'Literatura y Arte',
    titulo: 'Literatura y arte',
    subtitulo: 'Rafael Pombo, García Márquez, pintura y letras universales',
  },
  {
    id: 'Historia y Mundo',
    titulo: 'Historia y mundo',
    subtitulo: 'Civilizaciones antiguas, derechos humanos e hitos modernos',
  },
];

export const PanelLogros: React.FC<PanelLogrosProps> = ({
  estudiante,
  onSelectModo,
  onIniciarDesafioCultural,
}) => {
  const { estado, infoNivel } = useGamificacion(estudiante);

  const estrellasCanjeadasEnTitulos = (estado.titulosDesbloqueados || []).reduce(
    (acc, valorTitulo) => {
      const item = RECOMPENSAS_CANJEABLES.find(
        (r) => r.tipo === 'titulo' && r.valor === valorTitulo
      );
      return acc + (item ? item.costoEstrellas : 0);
    },
    0
  );

  const estrellasTotalesHistoricas = Math.max(
    estado.estrellasAcumuladas || 0,
    estado.estrellas + estrellasCanjeadasEnTitulos
  );

  const desafiosCulturales = estado.estadisticas.desafiosRelampagoGanados;
  let rangoCulturalActual = RANGOS_CULTURALES[0];
  for (const r of RANGOS_CULTURALES) {
    if (desafiosCulturales >= r.min) {
      rangoCulturalActual = r;
    }
  }
  const progresoRangoCultural = Math.min(
    100,
    Math.round((desafiosCulturales / rangoCulturalActual.metaSiguiente) * 100)
  );

  const fechaIngresoFormateada = estado.fechaIngreso || estado.ultimaFechaActivo;
  const entradasModos = Object.entries(AGENTE.modos);
  const modosDesbloqueados = entradasModos.filter(([key]) =>
    estado.modosExplorados.includes(key)
  );
  const modosPorExplorar = entradasModos.filter(
    ([key]) => !estado.modosExplorados.includes(key)
  );

  return (
    <div className="flex flex-col gap-6" aria-label="Resumen de progreso acumulado">
      {/* Actividad acumulada */}
      <section aria-label="Actividad acumulada">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Actividad acumulada
          </h2>
          <span className="text-[13.5px] text-[var(--color-secundario)] tabular-nums">
            Desde {fechaIngresoFormateada}
          </span>
        </div>

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-separador)] overflow-hidden">
          <div className="p-4">
            <p className="text-[13.5px] text-[var(--color-secundario)]">Estrellas ganadas</p>
            <p className="font-literata text-[25px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {estrellasTotalesHistoricas}
            </p>
            <p className="text-[12.5px] text-[var(--color-secundario)] mt-1 tabular-nums">
              {estado.estrellas} disponibles
            </p>
          </div>

          <div className="p-4">
            <p className="text-[13.5px] text-[var(--color-secundario)]">Cultura general</p>
            <p className="font-literata text-[25px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {desafiosCulturales}
            </p>
            <p className="text-[12.5px] text-[var(--color-secundario)] mt-1">
              {rangoCulturalActual.titulo}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[13.5px] text-[var(--color-secundario)]">Experiencia</p>
            <p className="font-literata text-[25px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {estado.xp} <span className="text-[13.5px] font-normal text-[var(--color-secundario)]">XP</span>
            </p>
            <p className="text-[12.5px] text-[var(--color-secundario)] mt-1">
              Nivel {infoNivel.nivelActual.nivel} · {infoNivel.nivelActual.nombre}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[13.5px] text-[var(--color-secundario)]">Constancia</p>
            <p className="font-literata text-[25px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {estado.rachaDias}{' '}
              <span className="text-[13.5px] font-normal text-[var(--color-secundario)]">
                {estado.rachaDias === 1 ? 'día' : 'días'}
              </span>
            </p>
            <p className="text-[12.5px] text-[var(--color-secundario)] mt-1 tabular-nums">
              {modosDesbloqueados.length}/{entradasModos.length} modos ·{' '}
              {estado.insigniasDesbloqueadas.length}/{INSIGNIAS_CATALOGO.length} logros
            </p>
          </div>
        </div>
      </section>

      {/* Desafíos culturales por área */}
      <section aria-label="Desafíos culturales">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Áreas de cultura general
          </h2>
          <span className="text-[13.5px] text-[var(--color-secundario)] tabular-nums">
            {desafiosCulturales} de {rangoCulturalActual.metaSiguiente} para subir de rango
          </span>
        </div>

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
          <div className="px-4 py-3.5">
            <p className="text-[14px] text-[var(--color-secundario)] mb-2 leading-relaxed">
              {rangoCulturalActual.descripcion}
            </p>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progresoRangoCultural}%` }}
                transition={{ duration: 0.45 }}
                className="h-full rounded-full bg-[var(--color-acento)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-separador)]">
            {AREAS_CULTURALES.map((area) => {
              const totalBancoArea = PREGUNTAS_DESAFIO_RELAMPAGO.filter(
                (p) => p.categoria === area.id
              ).length;
              const completadosEnArea =
                estado.estadisticas.categoriasCulturales?.[area.id] ||
                (desafiosCulturales > 0
                  ? Math.min(totalBancoArea, Math.ceil(desafiosCulturales / 2))
                  : 0);

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => onIniciarDesafioCultural?.(area.id)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 border-b border-[var(--color-separador)] last:border-b-0 hover:bg-[var(--color-acento-suave)]/40 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[var(--color-texto)]">
                      {area.titulo}
                    </p>
                    <p className="text-[13.5px] text-[var(--color-secundario)] leading-snug mt-0.5">
                      {area.subtitulo}
                    </p>
                  </div>

                  <span className="shrink-0 text-[13.5px] font-bold text-[var(--color-acento)] tabular-nums">
                    {completadosEnArea} {completadosEnArea === 1 ? 'ronda' : 'rondas'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Estaciones agrupadas en exploradas y por explorar */}
      <section aria-label="Recorrido por las estaciones">
        <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)] mb-3">
          Recorrido por las estaciones ({modosDesbloqueados.length} de {entradasModos.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4">
            <h3 className="font-literata text-[15.5px] font-semibold text-[var(--color-texto)] mb-2.5">
              Estaciones exploradas ({modosDesbloqueados.length})
            </h3>
            {modosDesbloqueados.length === 0 ? (
              <p className="text-[14px] text-[var(--color-secundario)]">
                Aún no has iniciado una sesión en las estaciones de estudio.
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-separador)]">
                {modosDesbloqueados.map(([key, modo]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectModo?.(key)}
                    className="w-full min-h-[42px] py-2 text-left flex items-center justify-between gap-3 hover:text-[var(--color-acento)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[14.5px] font-semibold text-[var(--color-texto)]">
                      <IconoEstrellaPombo className="w-4 h-4 shrink-0" activo={true} />
                      <span>{modo.titulo}</span>
                    </span>
                    <span className="text-[13px] font-bold text-[var(--color-acento)]">Abrir</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4">
            <h3 className="font-literata text-[15.5px] font-semibold text-[var(--color-texto)] mb-2.5">
              Por explorar ({modosPorExplorar.length})
            </h3>
            {modosPorExplorar.length === 0 ? (
              <p className="text-[14px] text-[var(--color-secundario)]">
                Ya exploraste las 8 estaciones del cuaderno de estudio.
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-separador)]">
                {modosPorExplorar.map(([key, modo]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectModo?.(key)}
                    className="w-full min-h-[42px] py-2 text-left flex items-center justify-between gap-3 hover:text-[var(--color-acento)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[14.5px] text-[var(--color-texto)]">
                      <Compass className="w-4 h-4 text-[var(--color-secundario)] opacity-60 shrink-0" />
                      <span>{modo.titulo}</span>
                    </span>
                    <span className="text-[13px] text-[var(--color-acento)] font-bold">Empezar</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PanelLogros;
