import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  Headphones,
  Smartphone,
  BookOpen,
  Check,
  Trash2,
} from 'lucide-react';
import {
  CategoriaCulturaGeneral,
  RECOMPENSAS_CANJEABLES,
} from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { useSonidos, type TipoAmbienteSonoro } from '../useSonidos.ts';
import type { SeccionApp } from './BarraNavegacionApp.tsx';
import {
  cargarHistorialConversaciones,
  eliminarSesionConversacion,
  formatearFechaRelativa,
  EVENTO_HISTORIAL_ACTUALIZADO,
  type SesionConversacion,
} from '../historialConversaciones.ts';
import { IconoEstrellaPombo } from './IconosInsignia.tsx';

interface PantallaPerfilProps {
  estudiante: string;
  onSelectModo: (key: string) => void;
  onRetomarConversacion?: (sesion: SesionConversacion) => void;
  onCambiarSeccion: (seccion: SeccionApp) => void;
  onAbrirDesafioCultural: (categoria: 'Todas' | CategoriaCulturaGeneral) => void;
  onSalirEstudiante: () => void;
}

const OPCIONES_AMBIENTE: Array<{
  id: TipoAmbienteSonoro;
  etiqueta: string;
}> = [
  { id: 'lluvia-suave', etiqueta: 'Lluvia suave' },
  { id: 'bosque-santander', etiqueta: 'Brisa' },
  { id: 'ondas-alfa', etiqueta: 'Tono cálido' },
];

export const PantallaPerfil: React.FC<PantallaPerfilProps> = ({
  estudiante,
  onSelectModo,
  onRetomarConversacion,
  onCambiarSeccion,
  onSalirEstudiante,
}) => {
  const { estado, infoNivel, canjearRecompensa } = useGamificacion(estudiante);
  const {
    sonidoActivo,
    sonidosAmbientalesActivos,
    ambienteSeleccionado,
    vibracionHapticaActiva,
    modoLecturaActivo,
    alternarSonido,
    alternarSonidosAmbientales,
    seleccionarAmbienteSonoro,
    alternarVibracionHaptica,
    alternarModoLectura,
    tocarClic,
  } = useSonidos(estudiante);
  const [avisoTitulo, setAvisoTitulo] = useState('');
  const [historial, setHistorial] = useState<SesionConversacion[]>(() =>
    cargarHistorialConversaciones(estudiante)
  );
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);

  const sincronizarHistorial = useCallback(() => {
    setHistorial(cargarHistorialConversaciones(estudiante));
  }, [estudiante]);

  useEffect(() => {
    sincronizarHistorial();
    window.addEventListener(EVENTO_HISTORIAL_ACTUALIZADO, sincronizarHistorial);
    window.addEventListener('storage', sincronizarHistorial);
    return () => {
      window.removeEventListener(EVENTO_HISTORIAL_ACTUALIZADO, sincronizarHistorial);
      window.removeEventListener('storage', sincronizarHistorial);
    };
  }, [sincronizarHistorial]);

  const titulosCatalogo = RECOMPENSAS_CANJEABLES.filter((r) => r.tipo === 'titulo');

  const manejarSeleccionTitulo = (itemId: string) => {
    tocarClic();
    const res = canjearRecompensa(itemId);
    setAvisoTitulo(res.mensaje);
    window.setTimeout(() => setAvisoTitulo(''), 3200);
  };

  const manejarRetomarSesion = (sesion: SesionConversacion) => {
    tocarClic();
    if (onRetomarConversacion) {
      onRetomarConversacion(sesion);
    } else {
      onSelectModo(sesion.modoKey);
    }
  };

  const manejarEliminarSesion = (e: React.MouseEvent, sesionId: string) => {
    e.stopPropagation();
    tocarClic();
    const actualizado = eliminarSesionConversacion(estudiante, sesionId);
    setHistorial(actualizado);
  };

  const sesionesVisibles = mostrarTodoHistorial ? historial : historial.slice(0, 5);

  return (
    <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 pt-5 pb-[76px] sm:py-7 flex flex-col gap-5">
      {/* Encabezado de pantalla */}
      <div
        style={{ animationDelay: '40ms' }}
        className="anim-entrada flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-literata text-[28px] sm:text-[30px] font-semibold text-[var(--color-texto)] leading-tight">
            Perfil de estudio
          </h1>
          <p className="text-[14.5px] text-[var(--color-secundario)] mt-1">
            Código {estudiante} · Nivel {infoNivel.nivelActual.nivel} ({infoNivel.nivelActual.nombre})
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            tocarClic();
            onSalirEstudiante();
          }}
          className="min-h-[40px] px-3 inline-flex items-center text-[14px] font-semibold text-[var(--color-rojo)] hover:underline cursor-pointer shrink-0"
        >
          Cambiar código
        </button>
      </div>

      {/* Historial de conversaciones en primer plano */}
      <section
        aria-label="Historial de conversaciones"
        style={{ animationDelay: '90ms' }}
        className="anim-tarjeta"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Historial de conversaciones
          </h2>
          {historial.length > 0 && (
            <span className="text-[13.5px] text-[var(--color-secundario)] tabular-nums">
              {historial.length} {historial.length === 1 ? 'sesión guardada' : 'sesiones guardadas'}
            </span>
          )}
        </div>

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
          {historial.length === 0 ? (
            <div className="px-4 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[15.5px] font-bold text-[var(--color-texto)]">
                  Aún no hay conversaciones guardadas
                </p>
                <p className="text-[14px] text-[var(--color-secundario)] mt-0.5 leading-relaxed">
                  Tus sesiones en cualquiera de los modos se guardarán aquí automáticamente para que puedas retomarlas cuando quieras.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  tocarClic();
                  onCambiarSeccion('modos');
                }}
                className="min-h-[40px] px-4 rounded-full bg-[var(--color-acento-suave)] text-[var(--color-acento)] text-[14px] font-bold hover:opacity-90 shrink-0 self-start sm:self-center cursor-pointer"
              >
                Explorar modos
              </button>
            </div>
          ) : (
            <>
              {sesionesVisibles.map((sesion) => (
                <div
                  key={sesion.id}
                  onClick={() => manejarRetomarSesion(sesion)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      manejarRetomarSesion(sesion);
                    }
                  }}
                  className="w-full px-4 py-4 text-left flex items-center justify-between gap-4 hover:bg-[var(--color-acento-suave)]/35 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-[var(--color-secundario)] mb-1">
                      <span className="font-bold text-[var(--color-acento)]">
                        {sesion.modoTitulo}
                      </span>
                      <span className="tabular-nums">
                        {sesion.turnosEstudiante}{' '}
                        {sesion.turnosEstudiante === 1 ? 'intervención' : 'intervenciones'}
                      </span>
                      <span>{formatearFechaRelativa(sesion.actualizadoEn)}</span>
                    </div>

                    <p className="font-literata text-[16px] font-semibold text-[var(--color-texto)] leading-snug">
                      {sesion.tituloResumen}
                    </p>

                    {sesion.ultimoMensaje && sesion.ultimoMensaje !== sesion.tituloResumen && (
                      <p className="text-[14px] text-[var(--color-secundario)] line-clamp-2 mt-1 leading-relaxed">
                        {sesion.ultimoMensaje}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => manejarEliminarSesion(e, sesion.id)}
                      aria-label="Eliminar conversación del historial"
                      title="Eliminar del historial"
                      className="min-w-[40px] min-h-[40px] rounded-[10px] flex items-center justify-center text-[var(--color-secundario)] hover:text-[var(--color-rojo)] hover:bg-[var(--color-fondo)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <span className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-[var(--color-acento-suave)] text-[13.5px] font-bold text-[var(--color-acento)] inline-flex items-center">
                      Retomar
                    </span>
                  </div>
                </div>
              ))}

              {historial.length > 5 && (
                <button
                  type="button"
                  onClick={() => {
                    tocarClic();
                    setMostrarTodoHistorial((v) => !v);
                  }}
                  className="w-full min-h-[42px] px-4 py-2 text-center text-[14px] font-bold text-[var(--color-acento)] hover:bg-[var(--color-acento-suave)]/35 transition-colors cursor-pointer"
                >
                  {mostrarTodoHistorial
                    ? 'Mostrar menos sesiones'
                    : `Ver todas las conversaciones (${historial.length})`}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Preferencias como lista con interruptores */}
      <section
        aria-label="Preferencias de estudio"
        style={{ animationDelay: '160ms' }}
        className="anim-tarjeta"
      >
        <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)] mb-3">
          Preferencias de estudio
        </h2>

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
          {/* Modo Lectura en el chat */}
          <div className="px-4 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <BookOpen className="w-[18px] h-[18px] text-[var(--color-acento)] shrink-0 mt-1" />
              <div className="min-w-0">
                <p className="text-[15.5px] font-bold text-[var(--color-texto)] leading-snug">
                  Modo lectura en el chat
                </p>
                <p className="text-[13.5px] text-[var(--color-secundario)] leading-relaxed">
                  Amplía el tamaño de fuente y el interlineado para reducir la fatiga visual en sesiones largas
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={modoLecturaActivo}
              aria-label="Modo lectura en el chat"
              onClick={() => alternarModoLectura()}
              className={`relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                modoLecturaActivo ? 'bg-[var(--color-acento)]' : 'bg-[var(--color-separador)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-[var(--color-superficie)] transition duration-200 ease-in-out ${
                  modoLecturaActivo ? 'translate-x-[22px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sonidos de la aplicación */}
          <div className="px-4 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Volume2 className="w-[18px] h-[18px] text-[var(--color-acento)] shrink-0 mt-1" />
              <div className="min-w-0">
                <p className="text-[15.5px] font-bold text-[var(--color-texto)] leading-snug">
                  Sonidos de la aplicación
                </p>
                <p className="text-[13.5px] text-[var(--color-secundario)] leading-relaxed">
                  Avisos acústicos suaves al avanzar en tus sesiones de estudio
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={sonidoActivo}
              aria-label="Sonidos de la aplicación"
              onClick={() => alternarSonido()}
              className={`relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                sonidoActivo ? 'bg-[var(--color-acento)]' : 'bg-[var(--color-separador)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-[var(--color-superficie)] transition duration-200 ease-in-out ${
                  sonidoActivo ? 'translate-x-[22px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sonidos ambientales */}
          <div className="px-4 py-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Headphones className="w-[18px] h-[18px] text-[var(--color-acento)] shrink-0 mt-1" />
                <div className="min-w-0">
                  <p className="text-[15.5px] font-bold text-[var(--color-texto)] leading-snug">
                    Sonidos ambientales
                  </p>
                  <p className="text-[13.5px] text-[var(--color-secundario)] leading-relaxed">
                    Fondo acústico continuo para acompañar la concentración
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={sonidosAmbientalesActivos}
                aria-label="Sonidos ambientales"
                onClick={() => alternarSonidosAmbientales()}
                className={`relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  sonidosAmbientalesActivos ? 'bg-[var(--color-acento)]' : 'bg-[var(--color-separador)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-[var(--color-superficie)] transition duration-200 ease-in-out ${
                    sonidosAmbientalesActivos ? 'translate-x-[22px]' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {sonidosAmbientalesActivos && (
              <div
                role="group"
                aria-label="Tipo de sonido ambiental"
                className="flex flex-wrap gap-2 pl-7"
              >
                {OPCIONES_AMBIENTE.map((amb) => {
                  const activo = ambienteSeleccionado === amb.id;
                  return (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => seleccionarAmbienteSonoro(amb.id)}
                      className={`min-h-[36px] px-3.5 py-1 rounded-full text-[13.5px] transition-colors cursor-pointer ${
                        activo
                          ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold'
                          : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
                      }`}
                    >
                      {amb.etiqueta}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Vibración háptica */}
          <div className="px-4 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <Smartphone className="w-[18px] h-[18px] text-[var(--color-acento)] shrink-0 mt-1" />
              <div className="min-w-0">
                <p className="text-[15.5px] font-bold text-[var(--color-texto)] leading-snug">
                  Vibración háptica
                </p>
                <p className="text-[13.5px] text-[var(--color-secundario)] leading-relaxed">
                  Respuesta táctil breve en dispositivos móviles compatibles
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={vibracionHapticaActiva}
              aria-label="Vibración háptica"
              onClick={() => alternarVibracionHaptica()}
              className={`relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                vibracionHapticaActiva ? 'bg-[var(--color-acento)]' : 'bg-[var(--color-separador)]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-[var(--color-superficie)] transition duration-200 ease-in-out ${
                  vibracionHapticaActiva ? 'translate-x-[22px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Distinción académica */}
      <section
        aria-label="Distinción académica"
        style={{ animationDelay: '220ms' }}
        className="anim-tarjeta"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
            Distinción académica
          </h2>
          <button
            type="button"
            onClick={() => onCambiarSeccion('retos')}
            className="min-h-[40px] px-2 inline-flex items-center text-[14px] font-semibold text-[var(--color-acento)] hover:underline cursor-pointer"
          >
            Ver retos y reconocimientos
          </button>
        </div>

        {avisoTitulo && (
          <p className="text-[14px] font-bold text-[var(--color-acento)] mb-2">
            {avisoTitulo}
          </p>
        )}

        <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
          {titulosCatalogo.map((t) => {
            const desbloqueado = estado.titulosDesbloqueados.includes(t.valor);
            const equipado = estado.tituloEquipado === t.valor;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => manejarSeleccionTitulo(t.id)}
                className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-[var(--color-acento-suave)]/35 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-literata text-[15.5px] font-semibold text-[var(--color-texto)]">
                    {t.valor}
                  </p>
                  <p className="text-[13.5px] text-[var(--color-secundario)] leading-relaxed mt-0.5">
                    {t.descripcion}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 text-[13.5px]">
                  {equipado ? (
                    <span className="inline-flex items-center gap-1 font-bold text-[var(--color-acento)]">
                      <Check className="w-4 h-4" />
                      <span>En uso</span>
                    </span>
                  ) : desbloqueado ? (
                    <span className="font-bold text-[var(--color-acento)]">Usar</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-[var(--color-secundario)] tabular-nums">
                      <IconoEstrellaPombo className="w-3.5 h-3.5" activo={true} />
                      <span>{t.costoEstrellas}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PantallaPerfil;
