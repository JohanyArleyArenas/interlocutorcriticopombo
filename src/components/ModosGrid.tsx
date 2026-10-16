import React from 'react';
import { 
  MessageSquareQuote, 
  Search, 
  Scale, 
  CheckCircle2, 
  Cpu, 
  FileText, 
  Globe, 
  Paperclip 
} from 'lucide-react';
import { AGENTE, ModoConfig } from '../parametros.ts';

interface ModosGridProps {
  onSelectModo: (key: string) => void;
}

export const ModosGrid: React.FC<ModosGridProps> = ({ onSelectModo }) => {
  const modeIcons: Record<string, React.ElementType> = {
    socratico: MessageSquareQuote,
    explorar: Search,
    argumento: Scale,
    verificar: CheckCircle2,
    auditar: Cpu,
    escrito: FileText,
  };

  const modeKeys = ['socratico', 'explorar', 'argumento', 'verificar', 'auditar', 'escrito'];

  return (
    <div className="w-full max-w-[820px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
      {/* Hero: Título y una sola línea */}
      <div className="flex flex-col items-center text-center mb-9 sm:mb-11 select-none">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-texto)]">
          Interlocutor Crítico
        </h1>
        <p className="text-[17px] sm:text-[18px] text-[var(--color-secundario)] font-normal mt-1.5">
          ¿Qué quieres hacer hoy?
        </p>
      </div>

      {/* Cuadrícula de 6 tarjetas: 2 columnas en escritorio, 1 en móvil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full items-stretch">
        {modeKeys.map((key) => {
          const modo = AGENTE.modos[key] as ModoConfig;
          if (!modo) return null;
          const Icon = modeIcons[key] || MessageSquareQuote;

          return (
            <div
              key={key}
              onClick={() => onSelectModo(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectModo(key);
                }
              }}
              className="apple-card group text-left cursor-pointer h-full flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 h-[44px]">
                {/* Icono en cuadro redondeado */}
                <div className="w-[44px] h-[44px] rounded-[14px] bg-[rgba(14,92,54,0.08)] dark:bg-[rgba(46,158,100,0.15)] text-[var(--color-acento)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Etiquetas de capacidades técnicas: Google / Archivos */}
                <div className="flex items-center gap-1.5">
                  {modo.busqueda && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[var(--color-fondo)] text-[var(--color-secundario)] border border-[var(--color-separador)]"
                      title="Este modo consulta Google en tiempo real"
                    >
                      <Globe className="w-3 h-3 text-[var(--color-acento)]" />
                      Google
                    </span>
                  )}
                  {modo.adjuntos && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[var(--color-fondo)] text-[var(--color-secundario)] border border-[var(--color-separador)]"
                      title="Permite adjuntar documentos e imágenes"
                    >
                      <Paperclip className="w-3 h-3 text-[var(--color-acento)]" />
                      Archivos
                    </span>
                  )}
                </div>
              </div>

              {/* Título del modo */}
              <h2 className="text-[19px] font-semibold text-[var(--color-texto)] mt-4 leading-snug">
                {modo.titulo}
              </h2>

              {/* Descripción corta de parametros.ts */}
              <p className="text-[15px] text-[var(--color-secundario)] mt-1.5 leading-relaxed font-normal min-h-[3.25em]">
                {modo.descripcion}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
