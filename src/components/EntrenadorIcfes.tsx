import React, { useState } from 'react';
import { Lightbulb, ArrowRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { VisorPaginas, RecortePdf } from './VisorPagina.tsx';

// Contenido de la pregunta extraído del cuadernillo: lectura, enunciado y opciones en texto.
// Lo que no se puede pasar a texto sin deformarlo (gráficas, tablas, fórmulas, imágenes) llega como
// recorte de esa parte de la página.
export type BloqueIcfes =
  | { tipo: 'texto'; texto: string; nota?: boolean }
  | { tipo: 'recorte'; pagina: number; rect: [number, number, number, number] };

export interface ContenidoPreguntaIcfes {
  contexto: { titulo: string; bloques: BloqueIcfes[] } | null;
  enunciado: BloqueIcfes[];
  opciones: Array<{ letra: string; bloques: BloqueIcfes[] }> | null;
  recorteOpciones: BloqueIcfes[] | null;
}

export interface PreguntaIcfesMeta {
  id: string;
  area: string;
  areaNombre: string;
  cuadernilloId: string;
  cuadernillo: string;
  examen?: string;
  numero: number;
  opciones: string[];
  paginas: number[];
  principal: number;
  y: number;
  totalPaginas: number;
  reinicio?: boolean;
  orden?: number;
  grupoPos?: number; // posición dentro del texto compartido (2 de 5)
  grupoTotal?: number; // número de la pregunta en la práctica del estudiante (1, 2, 3…)
  contenido?: ContenidoPreguntaIcfes | null;
}

export interface EstadoPreguntaIcfes {
  respuesta?: string; // letra elegida (ya enviada)
  clave?: string; // la revela el servidor después de responder
  correcta?: boolean;
  pistas?: number;
}

export const AREAS_ENTRENADOR: Array<{ clave: string; nombre: string; detalle: string }> = [
  { clave: 'lectura', nombre: 'Lectura crítica', detalle: 'Textos continuos y discontinuos' },
  { clave: 'matematicas', nombre: 'Matemáticas', detalle: 'Razonamiento y resolución de problemas' },
  { clave: 'sociales', nombre: 'Sociales y ciudadanas', detalle: 'Perspectivas, Constitución y contexto' },
  { clave: 'ciencias', nombre: 'Ciencias naturales', detalle: 'Biología, química y física' },
  { clave: 'ingles', nombre: 'Inglés', detalle: 'Avisos, vocabulario, gramática y lectura' },
];

export function SelectorArea({
  onElegir,
  deshabilitado,
  marcador,
  areaActual,
}: {
  onElegir: (area: string) => void;
  deshabilitado?: boolean;
  marcador?: Record<string, { aciertos: number; intentos: number }>;
  areaActual?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
      {AREAS_ENTRENADOR.map((a) => {
        const m = marcador?.[a.clave];
        return (
          <button
            key={a.clave}
            type="button"
            disabled={deshabilitado}
            onClick={() => onElegir(a.clave)}
            className={`text-left px-4 py-3 min-h-[56px] rounded-2xl border transition-colors disabled:opacity-50 ${
              areaActual === a.clave
                ? 'border-[var(--color-acento)] bg-[var(--color-acento)]/5'
                : 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-[15px] font-semibold text-[var(--color-texto)]">{a.nombre}</span>
              {m && m.intentos > 0 && (
                <span className="text-[12px] font-medium text-[var(--color-secundario)]">
                  {m.aciertos}/{m.intentos}
                </span>
              )}
            </span>
            <span className="block text-[13px] text-[var(--color-secundario)] mt-0.5">{a.detalle}</span>
          </button>
        );
      })}
    </div>
  );
}

// Bloques de texto y recortes, en el orden del cuadernillo
function Bloques({ bloques, cuadernilloId, etiqueta, enunciado }: { bloques: BloqueIcfes[]; cuadernilloId: string; etiqueta: string; enunciado?: boolean }) {
  return (
    <div className="flex flex-col gap-2.5">
      {bloques.map((b, i) =>
        b.tipo === 'texto' ? (
          <p
            key={i}
            className={`whitespace-pre-line break-words ${
              b.nota
                ? 'text-[13px] leading-snug text-[var(--color-secundario)]'
                : `text-[16px] leading-relaxed text-[var(--color-texto)]${enunciado ? ' font-medium' : ''}`
            }`}
          >
            {b.texto}
          </p>
        ) : (
          <RecortePdf key={i} url={`/api/icfes/pagina/${cuadernilloId}/${b.pagina}`} rect={b.rect} etiqueta={etiqueta} />
        )
      )}
    </div>
  );
}

// «RESPONDA LAS PREGUNTAS 2 Y 3 DE ACUERDO…» → «Lectura para las preguntas 2 y 3»
function rotuloContexto(titulo: string, _numero: number) {
  const m = /PREGUNTAS?\s+(\d{1,2})(?:\s*(A|Y|-)\s*(\d{1,2}))?/i.exec(titulo || '');
  return m && m[3] ? 'Lee primero este texto (sirve para varias preguntas)' : 'Lee primero este texto';
}

export function TarjetaPregunta({
  pregunta,
  estado,
  activa,
  ocupado,
  marcadorArea,
  onResponder,
  onPista,
  onSiguiente,
  onCambiarArea,
}: {
  pregunta: PreguntaIcfesMeta;
  estado: EstadoPreguntaIcfes;
  activa: boolean; // es la pregunta en curso (las anteriores quedan como registro)
  ocupado: boolean; // la IA está respondiendo
  marcadorArea?: { aciertos: number; intentos: number };
  onResponder: (letra: string, justificacion: string) => void;
  onPista: () => void;
  onSiguiente: () => void;
  onCambiarArea: () => void;
}) {
  const [elegida, setElegida] = useState<string>('');
  const [verLectura, setVerLectura] = useState(true);
  const respondida = !!estado.respuesta;
  const urls = pregunta.paginas.map((p) => `/api/icfes/pagina/${pregunta.cuadernilloId}/${p}`);
  const titulo = `Pregunta ${pregunta.numero} · ${pregunta.areaNombre}`;
  const pistasUsadas = estado.pistas || 0;
  const contenido = pregunta.contenido || null;
  const puedeElegir = !respondida && activa && !ocupado;

  // Mientras se verifica la respuesta no se juzga: solo se marca la letra elegida
  const verificando = respondida && estado.correcta === undefined;

  const estiloOpcion = (letra: string) => {
    if (verificando) {
      // Color neutro (ni verde ni rojo) hasta tener la clave oficial
      return estado.respuesta === letra
        ? 'bg-[#5F6368] border-[#5F6368] text-white'
        : 'bg-[var(--color-fondo)] border-[var(--color-separador)] text-[var(--color-secundario)] opacity-60';
    }
    if (respondida) {
      if (estado.clave === letra) return 'bg-[#0E5C36] border-[#0E5C36] text-white';
      if (estado.respuesta === letra) return 'bg-[#B3261E] border-[#B3261E] text-white';
      return 'bg-[var(--color-fondo)] border-[var(--color-separador)] text-[var(--color-secundario)] opacity-60';
    }
    return elegida === letra
      ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-white'
      : 'bg-[var(--color-superficie)] border-[var(--color-separador)] text-[var(--color-texto)] hover:border-[var(--color-acento)]';
  };

  // Tarjeta de opción con su texto completo
  const estiloTarjeta = (letra: string) => {
    if (verificando) {
      return estado.respuesta === letra
        ? 'border-[#5F6368] bg-[#5F6368]/[0.07] ring-1 ring-[#5F6368]'
        : 'border-[var(--color-separador)] bg-[var(--color-superficie)] opacity-60';
    }
    if (respondida) {
      if (estado.clave === letra) return 'border-[#0E5C36] bg-[#0E5C36]/[0.07]';
      if (estado.respuesta === letra) return 'border-[#B3261E] bg-[#B3261E]/[0.07]';
      return 'border-[var(--color-separador)] bg-[var(--color-superficie)] opacity-60';
    }
    return elegida === letra
      ? 'border-[var(--color-acento)] bg-[var(--color-acento)]/[0.06] ring-1 ring-[var(--color-acento)]'
      : 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]';
  };

  const botonesLetra = (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Opciones de respuesta">
      {pregunta.opciones.map((letra) => (
        <button
          key={letra}
          type="button"
          role="radio"
          aria-checked={(respondida ? estado.respuesta : elegida) === letra}
          disabled={respondida || !activa || ocupado}
          onClick={() => setElegida(letra)}
          className={`w-12 h-12 rounded-full border text-[17px] font-semibold transition-colors ${estiloOpcion(letra)}`}
        >
          {letra}
        </button>
      ))}
    </div>
  );

  return (
    <div className="message-appear rounded-[20px] bg-[var(--color-superficie)] border border-[var(--color-separador)]/60 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-acento)]">{pregunta.areaNombre}</p>
            <h3 className="text-[19px] font-semibold tracking-tight text-[var(--color-texto)] leading-snug">
              Pregunta {pregunta.orden ?? pregunta.numero}
              {pregunta.examen && !pregunta.orden ? <span className="font-normal text-[var(--color-secundario)]"> · {pregunta.examen}</span> : null}
            </h3>
            <p className="text-[13px] text-[var(--color-secundario)] leading-snug mt-0.5">{pregunta.cuadernillo}</p>
          </div>
          {marcadorArea && marcadorArea.intentos > 0 && (
            <span className="shrink-0 text-[13px] font-medium px-2.5 py-1 rounded-full bg-[var(--color-fondo)] text-[var(--color-texto)]">
              {marcadorArea.aciertos}/{marcadorArea.intentos} aciertos
            </span>
          )}
        </div>

        {pregunta.reinicio && activa && !respondida && (
          <p className="text-[13px] text-[var(--color-secundario)] -mt-2">Ya viste todas las preguntas de esta área en esta sesión; empezamos de nuevo.</p>
        )}

        {contenido ? (
          <>
            {contenido.contexto && contenido.contexto.bloques.length > 0 && (
              <section className="rounded-2xl bg-[var(--color-fondo)] border border-[var(--color-separador)]/70 p-3.5 sm:p-4 flex flex-col gap-2.5" aria-label="Texto de la pregunta">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-secundario)]">
                    {pregunta.grupoTotal && pregunta.grupoTotal > 1 && pregunta.grupoPos
                      ? `Lee el texto · pregunta ${pregunta.grupoPos} de ${pregunta.grupoTotal} sobre este texto`
                      : rotuloContexto(contenido.contexto.titulo, pregunta.numero)}
                  </p>
                  {respondida && (
                    <button type="button" onClick={() => setVerLectura((v) => !v)} className="shrink-0 text-[13px] font-medium text-[var(--color-acento)] px-2 min-h-[32px]">
                      {verLectura ? 'Ocultar' : 'Mostrar'}
                    </button>
                  )}
                </div>
                {(verLectura || !respondida) && <Bloques bloques={contenido.contexto.bloques} cuadernilloId={pregunta.cuadernilloId} etiqueta={`Texto de la pregunta ${pregunta.numero}`} />}
              </section>
            )}

            {contenido.enunciado.length > 0 && (
              <Bloques bloques={contenido.enunciado} cuadernilloId={pregunta.cuadernilloId} etiqueta={`Enunciado de la pregunta ${pregunta.numero}`} enunciado />
            )}

            {contenido.opciones ? (
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Opciones de respuesta">
                {contenido.opciones.map((o) => {
                  const marcada = (respondida ? estado.respuesta : elegida) === o.letra;
                  return (
                    <div
                      key={o.letra}
                      role="radio"
                      aria-checked={marcada}
                      aria-disabled={!puedeElegir}
                      tabIndex={puedeElegir ? 0 : -1}
                      onClick={() => puedeElegir && setElegida(o.letra)}
                      onKeyDown={(e) => {
                        if (puedeElegir && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          setElegida(o.letra);
                        }
                      }}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-2xl border transition-colors ${puedeElegir ? 'cursor-pointer' : ''} ${estiloTarjeta(o.letra)}`}
                    >
                      <span className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center text-[15px] font-semibold ${estiloOpcion(o.letra)}`}>{o.letra}</span>
                      <div className="flex-1 min-w-0 pt-1">
                        <Bloques bloques={o.bloques} cuadernilloId={pregunta.cuadernilloId} etiqueta={`Opción ${o.letra}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                {contenido.recorteOpciones && contenido.recorteOpciones.length > 0 && (
                  <Bloques bloques={contenido.recorteOpciones} cuadernilloId={pregunta.cuadernilloId} etiqueta={`Opciones de la pregunta ${pregunta.numero}`} />
                )}
                <p className="text-[14px] text-[var(--color-texto)] leading-snug">Elige tu respuesta:</p>
                {botonesLetra}
              </>
            )}
          </>
        ) : (
          <>
            <VisorPaginas urls={urls} marcaY={pregunta.y} titulo={titulo} enfocar={activa && !respondida} />
            <p className="text-[14px] text-[var(--color-texto)] leading-snug">
              Lee con calma la <strong>pregunta {pregunta.numero}</strong> (la flecha naranja te la señala){urls.length > 1 ? ' y el texto que la acompaña' : ''}. Elige tu respuesta:
            </p>
            {botonesLetra}
          </>
        )}

        {!respondida && activa && (
          <>
                        <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={!elegida || ocupado}
                onClick={() => onResponder(elegida, '')}
                className="w-full sm:w-auto sm:flex-1 h-[46px] shrink-0 rounded-full bg-[var(--color-acento)] text-white text-[15px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {elegida ? `Responder ${elegida}` : 'Elige una opción'}
              </button>
              <button
                type="button"
                disabled={ocupado || pistasUsadas >= 2}
                onClick={onPista}
                className="w-full sm:w-auto h-[46px] shrink-0 px-4 rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-medium text-[var(--color-acento)] hover:bg-[var(--color-fondo)] transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
                {pistasUsadas >= 2 ? 'Sin más pistas' : pistasUsadas === 1 ? 'Otra pista' : '¿Cómo la abordo?'}
              </button>
            </div>
          </>
        )}

        {respondida && (
          <div className="flex items-center gap-2 text-[15px] font-medium">
            {estado.correcta === true && (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#0E5C36]" aria-hidden="true" />
                <span className="text-[#0E5C36]">Respondiste {estado.respuesta}: correcta</span>
              </>
            )}
            {estado.correcta === false && (
              <>
                <XCircle className="w-5 h-5 text-[#B3261E]" aria-hidden="true" />
                <span className="text-[#B3261E]">
                  Respondiste {estado.respuesta}; la clave oficial es {estado.clave}
                </span>
              </>
            )}
            {estado.correcta === undefined && (
              <span className="inline-flex items-center gap-2 text-[var(--color-secundario)]">
                <span className="w-4 h-4 rounded-full border-2 border-[var(--color-separador)] border-t-[var(--color-acento)] animate-spin" aria-hidden="true" />
                Elegiste {estado.respuesta}. Estoy verificando con la clave oficial…
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
