import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { ModosGrid } from './components/ModosGrid.tsx';
import { ChatView } from './components/ChatView.tsx';

export default function App() {
  const [selectedModeKey, setSelectedModeKey] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-fondo)] text-[var(--color-texto)] selection:bg-[#0E5C36]/20 selection:text-[#0E5C36]">
      {/* Encabezado Apple HIG translúcido con escudo y nombres */}
      <Header
        onBackToModos={selectedModeKey ? () => setSelectedModeKey(null) : undefined}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 flex flex-col overflow-x-hidden">
        {selectedModeKey ? (
          <ChatView
            key={selectedModeKey}
            modeKey={selectedModeKey}
            onBackToModos={() => setSelectedModeKey(null)}
          />
        ) : (
          <ModosGrid onSelectModo={(key) => setSelectedModeKey(key)} />
        )}
      </main>

      {/* Pie de página sobrio de una sola línea */}
      <Footer />
    </div>
  );
}
