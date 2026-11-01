import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Search,
  Scale,
  CheckCircle2,
  Cpu,
  FileText,
  Sigma,
  GraduationCap,
} from 'lucide-react';
import { AGENTE, ModoConfig } from '../parametros.ts';
import { PanelGamificacion } from './PanelGamificacion.tsx';
import { useGamificacion } from '../useGamificacion.ts';

interface ModosGridProps {
  onSelectModo: (key: string) => void;
  estudiante?: string;
  mostrarGamificacion?: boolean;
}

type CategoriaModo = 'todos' | 'aprender' | 'revisar' | 'dialogar';

const CATEGORIAS_MODOS: {
  id: CategoriaModo;
  titulo: string;
  modos: string[];
}[] = [
  {
    id: 'todos',
    titulo: 'Todos los modos',
    modos: ['tutor', 'icfes', 'explorar', 'escrito', 'verificar', 'auditar', 'socratico', 'argumento'],
  },
  {
    id: 'aprender',
    titulo: 'Aprender y entrenar',
    modos: ['tutor', 'icfes', 'explorar'],
  },
  {
    id: 'revisar',
    titulo: 'Revisar y verificar',
    modos: ['escrito', 'verificar', 'auditar'],
  },
  {
    id: 'dialogar',
    titulo: 'Dialogar y debatir',
    modos: ['socratico', 'argumento'],
  },
];

export const ModosGrid: React.FC<ModosGridProps> = ({
  onSelectModo,
  estudiante = '',
  mostrarGamificacion = false,
}) => {
  const { estado: progreso } = useGamificacion(estudiante);
  const [categoriaActiva, setCategoriaActiva] = useState<CategoriaModo>('todos');

  const modeIcons: Record<string, React.ElementType> = {
    socratico: MessageSquareQuote,
    explorar: Search,
    argumento: Scale,
    verificar: CheckCircle2,
    auditar: Cpu,
    escrito: FileText,
    tutor: Sigma,
    icfes: GraduationCap,
  };

  const configCategoria = CATEGORIAS_MODOS.find((c) => c.id === categoriaActiva) || CATEGORIAS_MODOS[0];
  const modeKeysVisibles = configCategoria.modos;

  return (
    <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 pt-5 pb-[76px] sm:py-7 flex flex-col">
      {/* Encabezado */}
      <div
        style={{ animationDelay: '40ms' }}
        className="anim-entrada w-full mb-5"
      >
        <h1 className="font-literata text-[28px] sm:text-[30px] font-semibold text-[var(--color-texto)] leading-tight">
          Modos de estudio
        </h1>
        <p className="text-[15.5px] text-[var(--color-secundario)] mt-1">
          Elige una estación de trabajo para iniciar tu sesión.
        </p>
      </div>

      {mostrarGamificacion && (
        <PanelGamificacion estudiante={estudiante} onSelectModo={onSelectModo} />
      )}

      {/* Filtros por categoría */}
      <div
        role="tablist"
        aria-label="Filtrar modos por categoría"
        style={{ animationDelay: '90ms' }}
        className="anim-entrada flex flex-wrap gap-2 mb-6"
      >
        {CATEGORIAS_MODOS.map((cat) => {
          const activa = categoriaActiva === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`min-h-[40px] px-4 py-1.5 rounded-full text-[14px] transition-colors cursor-pointer ${
                activa
                  ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold sombra-boton-acento'
                  : 'bg-[var(--color-superficie)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
              }`}
            >
              {cat.titulo}
            </button>
          );
        })}
      </div>

      {/* Cuadrícula de 2 columnas (1 en < 360px) de mosaicos limpios sin avisos estáticos de estrellas */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-4 w-full items-stretch">
        {modeKeysVisibles.map((key, idxModo) => {
          const modo = AGENTE.modos[key] as ModoConfig;
          if (!modo) return null;
          const Icon = modeIcons[key] || MessageSquareQuote;
          const explorado = progreso.modosExplorados.includes(key);

          return (
            <button
              key={`${categoriaActiva}-${key}`}
              type="button"
              style={{ animationDelay: `${130 + idxModo * 55}ms` }}
              onClick={() => onSelectModo(key)}
              className="anim-tarjeta group mosaico-estudio hover:border-[var(--color-acento)] text-left cursor-pointer h-full justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  {explorado && (
                    <span className="text-[12.5px] font-semibold text-[var(--color-acento)]">
                      Explorado
                    </span>
                  )}
                </div>

                {/* Nombre en Literata */}
                <h2 className="font-literata text-[18.5px] font-semibold text-[var(--color-texto)] group-hover:text-[var(--color-acento)] transition-colors leading-snug">
                  {modo.titulo}
                </h2>

                {/* Descripción con line-clamp-2 */}
                <p className="text-[14.5px] text-[var(--color-secundario)] mt-1.5 leading-relaxed line-clamp-2">
                  {modo.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
