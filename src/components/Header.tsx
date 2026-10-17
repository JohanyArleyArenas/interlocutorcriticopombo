import React from 'react';

interface HeaderProps {
  onBackToModos?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onBackToModos }) => {
  return (
    <header className="anim-encabezado bg-[var(--color-superficie)]/85 backdrop-blur-md border-b border-[var(--color-separador)] sticky top-0 z-30 transition-colors">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
        {/* Left: Escudo + Nombres */}
        <div
          onClick={onBackToModos}
          className={`flex items-center gap-3.5 select-none ${
            onBackToModos ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
          }`}
          role={onBackToModos ? 'button' : undefined}
          tabIndex={onBackToModos ? 0 : undefined}
          onKeyDown={(e) => {
            if (onBackToModos && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onBackToModos();
            }
          }}
        >
          {/* Escudo oficial importado directamente sin recortar ni filtros */}
          <img
            src="/escudo-liceo.png"
            alt="Escudo Liceo Superior Rafael Pombo"
            className="anim-escudo h-[44px] w-auto object-contain shrink-0"
          />

          <div className="flex flex-col justify-center">
            <span
              className="anim-titulo text-[20px] leading-tight text-[#538135] dark:text-[#7FB069]"
              style={{ fontFamily: 'var(--font-gotica)', animationDelay: '450ms' }}
            >
              Liceo Superior Rafael Pombo
            </span>
            <span className="anim-titulo text-[13px] text-[var(--color-secundario)] font-normal leading-tight tracking-tight mt-0.5" style={{ animationDelay: '700ms' }}>
              Interlocutor Crítico
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
