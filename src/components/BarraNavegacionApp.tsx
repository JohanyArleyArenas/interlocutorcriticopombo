import React from 'react';
import { Home, Compass, Trophy, User } from 'lucide-react';
import { CATALOGO_RETOS_DIARIOS } from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';

export type SeccionApp = 'inicio' | 'modos' | 'retos' | 'perfil';

export const ORDEN_SECCIONES: Record<SeccionApp, number> = {
  inicio: 0,
  modos: 1,
  retos: 2,
  perfil: 3,
};

export const ITEMS_NAVEGACION: Array<{
  id: SeccionApp;
  etiqueta: string;
  etiquetaCorta: string;
  icono: React.ElementType;
}> = [
  { id: 'inicio', etiqueta: 'Inicio', etiquetaCorta: 'Inicio', icono: Home },
  { id: 'modos', etiqueta: 'Modos', etiquetaCorta: 'Modos', icono: Compass },
  { id: 'retos', etiqueta: 'Retos y cultura', etiquetaCorta: 'Retos', icono: Trophy },
  { id: 'perfil', etiqueta: 'Perfil', etiquetaCorta: 'Perfil', icono: User },
];

interface BarraInferiorMovilProps {
  seccionActiva: SeccionApp;
  onCambiarSeccion: (nueva: SeccionApp) => void;
  estudiante: string;
  enChat?: boolean;
}

export const BarraInferiorMovil: React.FC<BarraInferiorMovilProps> = ({
  seccionActiva,
  onCambiarSeccion,
  estudiante,
  enChat = false,
}) => {
  const { estado } = useGamificacion(estudiante);
  const retosPendientes = CATALOGO_RETOS_DIARIOS.filter((r) => !estado.retos[r.id]?.completado).length;

  return (
    <nav
      aria-label="Navegación principal"
      className={`${
        enChat ? 'hidden sm:block' : 'block'
      } fixed bottom-0 inset-x-0 z-40 bg-[var(--color-superficie)] border-t border-[var(--color-separador)] sombra-barra-inferior pb-[env(safe-area-inset-bottom,0px)] select-none sm:sticky sm:top-0 sm:bottom-auto sm:inset-x-auto sm:z-30 sm:bg-[var(--color-superficie)] sm:border-t-0 sm:shadow-none sm:pb-0`}
    >
      <div className="max-w-[520px] mx-auto px-2 h-[60px] grid grid-cols-4 items-stretch sm:max-w-none sm:mx-0 sm:px-0 sm:h-[64px] sm:flex sm:items-center sm:gap-1">
        {ITEMS_NAVEGACION.map((item) => {
          const Icono = item.icono;
          const activa = !enChat && seccionActiva === item.id;
          const mostrarPuntoRetos = item.id === 'retos' && retosPendientes > 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onCambiarSeccion(item.id)}
              aria-current={activa ? 'page' : undefined}
              className={`group nav-tab-item relative min-h-[44px] h-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 sm:px-3.5 cursor-pointer focus:outline-none focus-visible:outline-none transition-colors ${
                activa
                  ? 'text-[var(--color-acento)]'
                  : 'text-[var(--color-secundario)] hover:text-[var(--color-texto)] focus-visible:text-[var(--color-texto)]'
              }`}
            >
              {/* Línea superior de 3px en acento cuando está activa, sin fondo de píldora */}
              {activa && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 inset-x-4 sm:inset-x-2.5 h-[3px] rounded-b-full bg-[var(--color-acento)] z-10"
                />
              )}

              {/* Anillo de foco visible desplazado bajo la línea de 3px para evitar superposición */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-[6px] bottom-[4px] inset-x-1.5 sm:top-[7px] sm:bottom-[5px] sm:inset-x-1 rounded-[10px] ring-0 group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-acento)] group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-[var(--color-superficie)] group-focus-visible:bg-[var(--color-acento-suave)]/35 transition-all"
              />

              <div className="relative z-10 flex items-center justify-center">
                <Icono
                  className={`w-[20px] h-[20px] sm:w-[18px] sm:h-[18px] transition-colors ${
                    activa ? 'text-[var(--color-acento)]' : 'text-current'
                  }`}
                  strokeWidth={activa ? 2.3 : 1.8}
                  fill={activa ? 'currentColor' : 'none'}
                  fillOpacity={activa ? 0.22 : 0}
                />

                {mostrarPuntoRetos && (
                  <span
                    className="sm:hidden absolute -top-1 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--color-acento)] text-[var(--color-superficie)] text-[10px] font-bold flex items-center justify-center tabular-nums"
                    aria-label={`${retosPendientes} misiones disponibles`}
                  >
                    {retosPendientes}
                  </span>
                )}
              </div>

              <span
                className={`relative z-10 text-[12px] sm:text-[14px] leading-none whitespace-nowrap transition-colors ${
                  activa
                    ? 'font-bold text-[var(--color-acento)]'
                    : 'font-normal text-current'
                }`}
              >
                {item.etiquetaCorta}
              </span>

              {mostrarPuntoRetos && (
                <span
                  className="relative z-10 hidden sm:inline-flex min-w-[18px] h-[18px] px-1.5 rounded-full bg-[var(--color-acento)] text-[var(--color-superficie)] text-[11px] font-bold items-center justify-center tabular-nums"
                  aria-label={`${retosPendientes} misiones disponibles`}
                >
                  {retosPendientes}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
