import React from 'react';
import { motion } from 'framer-motion';
import { Star, Compass } from 'lucide-react';
import {
  CategoriaCulturaGeneral,
  INSIGNIAS_CATALOGO,
  PREGUNTAS_DESAFIO_RELAMPAGO,
  RECOMPENSAS_CANJEABLES,
} from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { AGENTE } from '../parametros.ts';

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
    subtitulo: 'Cañón del Chicamocha, historia comunera y geografía nacional',
  },
  {
    id: 'Literatura y Arte',
    titulo: 'Literatura y arte',
    subtitulo: 'Rafael Pombo, García Márquez y letras universales',
  },
  {
    id: 'Ciencia y Universo',
    titulo: 'Ciencia y universo',
    subtitulo: 'Física, química, astronomía y grandes descubrimientos',
  },
  {
    id: 'Historia y Mundo',
    titulo: 'Historia y mundo',
    subtitulo: 'Civilizaciones antiguas, hitos modernos y filosofía',
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

  const estrellasEstimadasPorAcciones =
    2 +
    estado.estadisticas.mensajesArgumentados * 1 +
    (estado.estadisticas.preguntasAnaliticas || 0) * 1 +
    (estado.estadisticas.desafiosPensamientoCritico || 0) * 2 +
    estado.estadisticas.verificacionesExternas * 3 +
    estado.estadisticas.aciertosIcfes * 2 +
    Math.max(0, estado.estadisticas.intentosIcfes - estado.estadisticas.aciertosIcfes) * 1 +
    estado.estadisticas.cierresCompletados * 5 +
    estado.estadisticas.archivosClaseSubidos * 2 +
    estado.estadisticas.desafiosRelampagoGanados * 6 +
    estado.insigniasDesbloqueadas.length * 2;

  const estrellasTotalesHistoricas = Math.max(
    estado.estrellasAcumuladas || 0,
    estado.estrellas + estrellasCanjeadasEnTitulos,
    estrellasEstimadasPorAcciones
  );

  const estrellasDialogoCritico =
    estado.estadisticas.mensajesArgumentados +
    (estado.estadisticas.preguntasAnaliticas || 0) +
    (estado.estadisticas.desafiosPensamientoCritico || 0) * 2;
  const estrellasCulturaGeneral =
    (estado.estadisticas.aciertosCulturalesTotales ||
      estado.estadisticas.desafiosRelampagoGanados * 3) * 2;
  const estrellasSaber11 =
    estado.estadisticas.aciertosIcfes * 2 +
    Math.max(0, estado.estadisticas.intentosIcfes - estado.estadisticas.aciertosIcfes);
  const estrellasAutonomiaVerificacion =
    estado.estadisticas.verificacionesExternas * 3 +
    estado.estadisticas.cierresCompletados * 5 +
    estado.estadisticas.archivosClaseSubidos * 2;

  const maxFuenteEstrellas = Math.max(
    10,
    estrellasDialogoCritico,
    estrellasCulturaGeneral,
    estrellasSaber11,
    estrellasAutonomiaVerificacion
  );

  const fuentesEstrellas = [
    {
      id: 'dialogo',
      nombre: 'Diálogo y preguntas analíticas',
      detalle: `${estado.estadisticas.mensajesArgumentados} argumentos y ${
        estado.estadisticas.preguntasAnaliticas || 0
      } preguntas formuladas`,
      estrellas: estrellasDialogoCritico,
    },
    {
      id: 'cultura',
      nombre: 'Desafíos de cultura general',
      detalle: `${estado.estadisticas.desafiosRelampagoGanados} rondas superadas y ${
        estado.estadisticas.aciertosCulturalesTotales ||
        estado.estadisticas.desafiosRelampagoGanados * 3
      } aciertos`,
      estrellas: estrellasCulturaGeneral,
    },
    {
      id: 'icfes',
      nombre: 'Entrenador Saber 11',
      detalle: `${estado.estadisticas.aciertosIcfes} aciertos en ${estado.estadisticas.intentosIcfes} preguntas trabajadas`,
      estrellas: estrellasSaber11,
    },
    {
      id: 'autonomia',
      nombre: 'Verificación de fuentes y reflexiones',
      detalle: `${estado.estadisticas.verificacionesExternas} contrastaciones externas y ${estado.estadisticas.cierresCompletados} cierres`,
      estrellas: estrellasAutonomiaVerificacion,
    },
  ];

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
    <div className="flex flex-col gap-7" aria-label="Resumen de progreso acumulado">
      {/* Actividad acumulada */}
      <section aria-label="Actividad acumulada">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Actividad acumulada
          </h2>
          <span className="text-[14px] text-[var(--color-secundario)] tabular-nums">
            Desde {fechaIngresoFormateada}
          </span>
        </div>

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-separador)] overflow-hidden">
          <div className="p-4">
            <p className="text-[14px] text-[var(--color-secundario)]">Estrellas totales</p>
            <p className="font-literata text-[26px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {estrellasTotalesHistoricas}
            </p>
            <p className="text-[13px] text-[var(--color-secundario)] mt-1 tabular-nums">
              {estado.estrellas} disponibles, {estado.estrellasHoy} hoy
            </p>
          </div>

          <div className="p-4">
            <p className="text-[14px] text-[var(--color-secundario)]">Cultura general</p>
            <p className="font-literata text-[26px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {desafiosCulturales}
            </p>
            <p className="text-[13px] text-[var(--color-secundario)] mt-1">
              {rangoCulturalActual.titulo}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[14px] text-[var(--color-secundario)]">Experiencia</p>
            <p className="font-literata text-[26px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {estado.xp} <span className="text-[14px] font-normal text-[var(--color-secundario)]">XP</span>
            </p>
            <p className="text-[13px] text-[var(--color-secundario)] mt-1">
              Nivel {infoNivel.nivelActual.nivel}, {infoNivel.nivelActual.nombre}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[14px] text-[var(--color-secundario)]">Constancia</p>
            <p className="font-literata text-[26px] font-semibold text-[var(--color-texto)] tabular-nums mt-0.5 leading-tight">
              {estado.rachaDias}{' '}
              <span className="text-[14px] font-normal text-[var(--color-secundario)]">
                {estado.rachaDias === 1 ? 'día' : 'días'}
              </span>
            </p>
            <p className="text-[13px] text-[var(--color-secundario)] mt-1 tabular-nums">
              {modosDesbloqueados.length} de {entradasModos.length} modos,{' '}
              {estado.insigniasDesbloqueadas.length} de {INSIGNIAS_CATALOGO.length} logros
            </p>
          </div>
        </div>
      </section>

      {/* Desglose de Estrellas y Cultura General en 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section aria-label="Origen de las estrellas">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
              Origen de tus estrellas
            </h2>
            <span className="text-[14px] text-[var(--color-secundario)] tabular-nums">
              {estrellasTotalesHistoricas} acumuladas
            </span>
          </div>

          <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
            {fuentesEstrellas.map((fuente) => {
              const porcentaje = Math.min(
                100,
                Math.max(4, Math.round((fuente.estrellas / maxFuenteEstrellas) * 100))
              );
              return (
                <div key={fuente.id} className="px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[15px] font-bold text-[var(--color-texto)]">
                      {fuente.nombre}
                    </span>
                    <span className="text-[14px] font-bold text-[var(--color-oro)] tabular-nums shrink-0">
                      +{fuente.estrellas} estrellas
                    </span>
                  </div>
                  <p className="text-[14px] text-[var(--color-secundario)] mt-0.5 mb-2">
                    {fuente.detalle}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fuente.estrellas > 0 ? porcentaje : 0}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full rounded-full bg-[var(--color-acento)]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-label="Desafíos culturales">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
              Desafíos culturales
            </h2>
            <span className="text-[14px] text-[var(--color-secundario)] tabular-nums">
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
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 hover:bg-[var(--color-acento-suave)]/40 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[var(--color-texto)]">
                      {area.titulo}
                    </p>
                    <p className="text-[14px] text-[var(--color-secundario)] leading-snug mt-0.5">
                      {area.subtitulo}
                    </p>
                  </div>

                  <span className="shrink-0 text-[14px] font-bold text-[var(--color-acento)] tabular-nums">
                    {completadosEnArea} {completadosEnArea === 1 ? 'ronda' : 'rondas'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Estaciones agrupadas en exploradas y por explorar (sin repetir la palabra "Pendiente") */}
      <section aria-label="Recorrido por las estaciones">
        <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)] mb-3">
          Recorrido por las estaciones ({modosDesbloqueados.length} de {entradasModos.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4">
            <h3 className="font-literata text-[16px] font-semibold text-[var(--color-texto)] mb-2.5">
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
                    className="w-full min-h-[44px] py-2.5 text-left flex items-center justify-between gap-3 hover:text-[var(--color-acento)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[15px] font-bold text-[var(--color-texto)]">
                      <Star className="w-4 h-4 text-[var(--color-oro)] fill-[var(--color-oro)] shrink-0" />
                      <span>{modo.titulo}</span>
                    </span>
                    <span className="text-[13px] font-bold text-[var(--color-acento)]">Abrir</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4">
            <h3 className="font-literata text-[16px] font-semibold text-[var(--color-texto)] mb-2.5">
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
                    className="w-full min-h-[44px] py-2.5 text-left flex items-center justify-between gap-3 hover:text-[var(--color-acento)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[15px] text-[var(--color-texto)]">
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
