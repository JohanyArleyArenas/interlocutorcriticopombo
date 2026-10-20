import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as pdfjs from 'pdfjs-dist';
// El «worker» de pdf.js se sirve como archivo aparte (Vite lo copia con ?url)
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Muestra una página de un cuadernillo del ICFES (PDF de una sola página que entrega el servidor).
 * Si `marcaY` está definido, señala con una flecha la altura donde está el número de la pregunta.
 */
function PaginaPdf({ url, marcaY, escala = 1, etiqueta, alListo }: { url: string; marcaY?: number; escala?: number; etiqueta?: string; alListo?: (marca: HTMLElement | null) => void }) {
  const marcaRef = useRef<HTMLDivElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [ancho, setAncho] = useState(0);

  // Ancho disponible (se vuelve a dibujar si cambia: girar el celular, abrir el panel)
  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const medir = () => setAncho(Math.round(el.clientWidth));
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    let temporizador = 0;
    const obs = new ResizeObserver(() => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(medir, 120);
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      window.clearTimeout(temporizador);
    };
  }, []);

  useEffect(() => {
    if (!ancho) return;
    let cancelado = false;
    let tareaRender: any = null;
    let documento: any = null;
    (async () => {
      try {
        setEstado((e) => (e === 'listo' ? e : 'cargando'));
        documento = await pdfjs.getDocument({ url, isEvalSupported: false }).promise;
        if (cancelado) return;
        const pagina = await documento.getPage(1);
        const base = pagina.getViewport({ scale: 1 });
        const anchoCss = ancho * escala;
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const vista = pagina.getViewport({ scale: (anchoCss / base.width) * dpr });
        const canvas = canvasRef.current;
        if (!canvas || cancelado) return;
        canvas.width = Math.floor(vista.width);
        canvas.height = Math.floor(vista.height);
        canvas.style.width = `${anchoCss}px`;
        canvas.style.height = `${(anchoCss * base.height) / base.width}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Sin canvas');
        tareaRender = pagina.render({ canvasContext: ctx, viewport: vista, canvas } as any);
        await tareaRender.promise;
        if (!cancelado) setEstado('listo');
      } catch (e: any) {
        if (!cancelado && e?.name !== 'RenderingCancelledException') {
          console.error('[Visor] No se pudo mostrar la página:', e);
          setEstado('error');
        }
      }
    })();
    return () => {
      cancelado = true;
      try {
        tareaRender?.cancel();
      } catch {}
      try {
        documento?.destroy();
      } catch {}
    };
  }, [url, ancho, escala]);

  // Cuando la página ya se dibujó, avisa (para llevar la vista hasta la flecha de la pregunta)
  useEffect(() => {
    if (estado === 'listo') requestAnimationFrame(() => alListo?.(marcaRef.current));
  }, [estado]);

  return (
    <div ref={contenedorRef} className="relative w-full">
      <div className="relative" style={{ width: ancho ? ancho * escala : '100%' }}>
        <canvas ref={canvasRef} className="block bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.12)]" aria-label={etiqueta || 'Página del cuadernillo'} />
        {estado === 'listo' && typeof marcaY === 'number' && marcaY > 0 && (
          <div
            ref={marcaRef}
            className="absolute left-0 -translate-x-1 -translate-y-1/2 pointer-events-none flex items-center"
            style={{ top: `${marcaY * 100}%` }}
            aria-hidden="true"
          >
            <span className="w-0 h-0 border-y-[9px] border-y-transparent border-l-[13px] border-l-[#E8590C] drop-shadow" />
          </div>
        )}
        {estado !== 'listo' && (
          <div className="absolute inset-0 min-h-[220px] flex items-center justify-center rounded-xl bg-[var(--color-fondo)] text-[14px] text-[var(--color-secundario)]">
            {estado === 'error' ? 'No se pudo mostrar la página. Toca «Otra pregunta» o intenta de nuevo.' : 'Abriendo el cuadernillo…'}
          </div>
        )}
        {estado !== 'listo' && <div style={{ paddingTop: '129%' }} />}
      </div>
    </div>
  );
}

export function VisorPaginas({
  urls,
  marcaY,
  titulo,
  enfocar,
}: {
  urls: string[]; // páginas en orden: la última es la de la pregunta
  marcaY?: number;
  titulo: string;
  enfocar?: boolean; // al abrir, lleva la vista hasta la flecha de la pregunta
}) {
  const enfocadoRef = useRef(false);
  const irALaMarca = (el: HTMLElement | null) => {
    if (!enfocar || enfocadoRef.current || !el) return;
    enfocadoRef.current = true;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  const [ampliado, setAmpliado] = useState(false);
  const [zoom, setZoom] = useState(1.6);

  useEffect(() => {
    if (!ampliado) return;
    const cerrar = (e: KeyboardEvent) => e.key === 'Escape' && setAmpliado(false);
    window.addEventListener('keydown', cerrar);
    return () => window.removeEventListener('keydown', cerrar);
  }, [ampliado]);

  const paginas = (escala: number, alListo?: (el: HTMLElement | null) => void) =>
    urls.map((u, i) => (
      <div key={u} className="flex flex-col gap-1.5">
        {urls.length > 1 && (
          <p className="text-[12px] font-medium text-[var(--color-secundario)]">
            {i < urls.length - 1 ? 'Texto o situación que comparten varias preguntas' : 'Aquí está la pregunta'}
          </p>
        )}
        <PaginaPdf url={u} escala={escala} marcaY={i === urls.length - 1 ? marcaY : undefined} alListo={i === urls.length - 1 ? alListo : undefined} etiqueta={`${titulo} — página ${i + 1} de ${urls.length}`} />
      </div>
    ));

  return (
    <div className="flex flex-col gap-3">
      {paginas(1, irALaMarca)}
      <button
        type="button"
        onClick={() => setAmpliado(true)}
        className="self-start inline-flex items-center gap-1.5 text-[14px] font-medium px-3.5 min-h-[40px] rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[var(--color-acento)] hover:bg-[var(--color-fondo)] transition-colors"
      >
        <Maximize2 className="w-4 h-4" aria-hidden="true" /> Ver en grande
      </button>

      {ampliado && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col" role="dialog" aria-modal="true" aria-label={titulo}>
          <div className="flex items-center justify-between gap-2 px-3 py-2 text-white shrink-0">
            <span className="text-[14px] font-medium truncate">{titulo}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.4).toFixed(2)))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15" aria-label="Alejar">
                <ZoomOut className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => setZoom((z) => Math.min(3.2, z + 0.4))} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15" aria-label="Acercar">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => setAmpliado(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/15" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto overscroll-contain px-3 pb-6">
            <div className="flex flex-col gap-4 mx-auto" style={{ width: 'min(100%, 900px)' }}>
              {paginas(zoom)}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default VisorPaginas;

// ===== Recorte de una parte de la página (una figura, una tabla, una fórmula; nunca la página entera) =====
const documentosPdf = new Map<string, Promise<any>>();
const abrirPdf = (url: string) => {
  let p = documentosPdf.get(url);
  if (!p) {
    p = pdfjs.getDocument({ url, isEvalSupported: false }).promise;
    p.catch(() => documentosPdf.delete(url));
    documentosPdf.set(url, p);
  }
  return p;
};

function LienzoRecorte({ url, rect, ancho, etiqueta }: { url: string; rect: [number, number, number, number]; ancho: number; etiqueta: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const [proporcion, setProporcion] = useState(0);
  useEffect(() => {
    if (!ancho) return;
    let cancelado = false;
    let tarea: any = null;
    (async () => {
      try {
        const doc = await abrirPdf(url);
        const pagina = await doc.getPage(1);
        const base = pagina.getViewport({ scale: 1 });
        const anchoPt = rect[2] * base.width;
        const altoPt = rect[3] * base.height;
        if (!cancelado) setProporcion(altoPt / anchoPt);
        // Nitidez según la pantalla, sin pasar de ~12 megapíxeles (los celulares no dibujan lienzos más grandes)
        const dprBase = Math.min(window.devicePixelRatio || 1, 2.5);
        const pxCss = ancho * ((ancho * altoPt) / anchoPt);
        const dpr = Math.max(0.75, Math.min(dprBase, Math.sqrt(12e6 / Math.max(1, pxCss))));
        const escala = (ancho / anchoPt) * dpr;
        const vista = pagina.getViewport({ scale: escala });
        const canvas = canvasRef.current;
        if (!canvas || cancelado) return;
        canvas.width = Math.max(1, Math.floor(anchoPt * escala));
        canvas.height = Math.max(1, Math.floor(altoPt * escala));
        canvas.style.width = `${ancho}px`;
        canvas.style.height = `${(ancho * altoPt) / anchoPt}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Sin canvas');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Se dibuja la página desplazada para que solo quede a la vista la parte recortada
        const desplazada = vista.clone({ offsetX: -rect[0] * vista.width, offsetY: -rect[1] * vista.height });
        tarea = pagina.render({ canvasContext: ctx, viewport: desplazada, canvas } as any);
        await tarea.promise;
        if (!cancelado) setEstado('listo');
      } catch (e: any) {
        if (!cancelado && e?.name !== 'RenderingCancelledException') {
          console.error('[Recorte] No se pudo dibujar:', e);
          setEstado('error');
        }
      }
    })();
    return () => {
      cancelado = true;
      try {
        tarea?.cancel();
      } catch {}
    };
  }, [url, rect[0], rect[1], rect[2], rect[3], ancho]);
  return (
    <div className="relative" style={{ width: ancho }}>
      <canvas ref={canvasRef} className="block" aria-label={etiqueta} role="img" />
      {estado !== 'listo' && (
        <div
          className="flex items-center justify-center rounded-lg bg-[var(--color-fondo)] text-[13px] text-[var(--color-secundario)]"
          style={{ width: ancho, height: proporcion ? ancho * proporcion : 120, position: 'absolute', inset: 0 }}
        >
          {estado === 'error' ? 'No se pudo mostrar esta figura.' : 'Cargando figura…'}
        </div>
      )}
      {estado !== 'listo' && <div style={{ height: proporcion ? ancho * proporcion : 120 }} />}
    </div>
  );
}

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

export function RecortePdf({ url, rect, etiqueta = 'Figura de la pregunta' }: { url: string; rect: [number, number, number, number]; etiqueta?: string }) {
  const contRef = useRef<HTMLDivElement | null>(null);
  const [disponible, setDisponible] = useState(0);
  const [ampliado, setAmpliado] = useState(false);
  const [zoom, setZoom] = useState(1); // 1 = ajustado al ancho de la pantalla
  const [pantalla, setPantalla] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 800));
  useEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const medir = () => setDisponible(Math.round(el.clientWidth));
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    let t = 0;
    const obs = new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(medir, 120);
    });
    obs.observe(el);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);
  useEffect(() => {
    if (!ampliado) return;
    const alCambiar = () => setPantalla(window.innerWidth);
    const teclas = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAmpliado(false);
      else if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(ZOOM_MAX, +(z + 0.25).toFixed(2)));
      else if (e.key === '-') setZoom((z) => Math.max(ZOOM_MIN, +(z - 0.25).toFixed(2)));
      else if (e.key === '0') setZoom(1);
    };
    alCambiar();
    window.addEventListener('resize', alCambiar);
    window.addEventListener('keydown', teclas);
    // Evita que la página de atrás se desplace mientras la figura está ampliada
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', alCambiar);
      window.removeEventListener('keydown', teclas);
      document.body.style.overflow = antes;
    };
  }, [ampliado]);
  // Tamaño natural: el del cuadernillo un poco ampliado, sin pasar del ancho disponible
  const natural = Math.round(rect[2] * 612 * 1.45);
  const ancho = disponible ? Math.min(disponible, natural) : 0;
  // En grande: al 100 % ocupa el ancho de la pantalla (máximo 1100 px); desde ahí se acerca o se aleja
  const ajuste = Math.max(200, Math.min(pantalla - 24, 1100));
  const anchoGrande = Math.round(ajuste * zoom);
  const abrir = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setAmpliado(true);
  };
  const cambiar = (d: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + d).toFixed(2))));
  };
  const boton = 'w-11 h-11 rounded-full flex items-center justify-center text-white hover:bg-white/15 active:bg-white/25 disabled:opacity-35 disabled:hover:bg-transparent';
  return (
    <div ref={contRef} className="w-full">
      {ancho > 0 && (
        <button type="button" onClick={abrir} className="block max-w-full rounded-lg overflow-hidden bg-white cursor-zoom-in" aria-label={`${etiqueta}: toca para ampliar`}>
          <LienzoRecorte url={url} rect={rect} ancho={ancho} etiqueta={etiqueta} />
        </button>
      )}
      {ampliado && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={etiqueta}
          onClick={(e) => {
            e.stopPropagation();
            setAmpliado(false);
          }}
        >
          <div className="flex items-center justify-between gap-1 px-2 py-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={cambiar(-0.25)} disabled={zoom <= ZOOM_MIN} className={boton} aria-label="Alejar">
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom(1);
                }}
                className="min-w-[64px] h-11 px-2 rounded-full text-white text-[14px] font-medium hover:bg-white/15"
                aria-label="Ajustar a la pantalla"
              >
                {Math.round(zoom * 100)} %
              </button>
              <button type="button" onClick={cambiar(0.25)} disabled={zoom >= ZOOM_MAX} className={boton} aria-label="Acercar">
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAmpliado(false);
              }}
              className={boton}
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto overscroll-contain px-3 pb-6" style={{ touchAction: 'pan-x pan-y' }}>
            <div className="mx-auto bg-white rounded-lg overflow-hidden" style={{ width: anchoGrande }} onClick={(e) => e.stopPropagation()}>
              <LienzoRecorte url={url} rect={rect} ancho={anchoGrande} etiqueta={etiqueta} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
