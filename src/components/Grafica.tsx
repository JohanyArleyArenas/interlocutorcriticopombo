import React, { useMemo } from 'react';

/**
 * Gráficas que dibuja el tutor. La IA escribe un bloque de código ```grafica con un JSON
 * y aquí se convierte en un dibujo SVG (sin librerías externas y sin ejecutar código).
 *
 * {
 *   "titulo": "…", "x": [-5, 5], "y": [-3, 10], "etiquetas": { "x": "t (s)", "y": "v (m/s)" },
 *   "funciones": [{ "expr": "x^2 - 4", "nombre": "f(x)" }],
 *   "puntos":    [{ "x": 2, "y": 0, "nombre": "A" }],
 *   "vectores":  [{ "desde": [0, 0], "hasta": [3, 4], "nombre": "F₁" }],
 *   "segmentos": [{ "desde": [0, 0], "hasta": [3, 0], "nombre": "base" }],
 *   "series":    [{ "nombre": "datos", "tipo": "linea" | "puntos", "datos": [[0, 1], [1, 3]] }],
 *   "barras":    { "categorias": ["A", "B"], "valores": [3, 5], "nombre": "…" }
 * }
 */

// ===== Evaluador seguro de expresiones (solo números, x y funciones matemáticas) =====
type Token = { t: 'num'; v: number } | { t: 'var' } | { t: 'op'; v: string } | { t: 'fn'; v: string } | { t: '(' } | { t: ')' } | { t: ',' };

const FUNCIONES: Record<string, (a: number) => number> = {
  sin: Math.sin, sen: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, raiz: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
};

function tokenizar(expr: string): Token[] {
  const s = expr
    .replace(/\s+/g, '')
    .replace(/[−–]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\*\*/g, '^')
    .replace(/,(?=\d)/g, '.')
    .toLowerCase();
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      if (s[j] === 'e' && /[-+0-9]/.test(s[j + 1] || '') && !/[a-z]/.test(s[j + 1] || '')) {
        j++;
        if (/[-+]/.test(s[j])) j++;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
      }
      out.push({ t: 'num', v: parseFloat(s.slice(i, j)) });
      i = j;
    } else if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      const w = s.slice(i, j);
      if (w === 'x') out.push({ t: 'var' });
      else if (w === 'pi') out.push({ t: 'num', v: Math.PI });
      else if (w === 'e') out.push({ t: 'num', v: Math.E });
      else if (FUNCIONES[w]) out.push({ t: 'fn', v: w });
      else if (/^x+$/.test(w)) for (let k = 0; k < w.length; k++) out.push({ t: 'var' });
      else throw new Error('Símbolo desconocido: ' + w);
      i = j;
    } else if ('+-*/^'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else if (c === '(' || c === '[') {
      out.push({ t: '(' });
      i++;
    } else if (c === ')' || c === ']') {
      out.push({ t: ')' });
      i++;
    } else throw new Error('Carácter no válido: ' + c);
  }
  // Multiplicación implícita: 2x, 3(x+1), (x+1)(x-1), x sin(x)
  const conImplicita: Token[] = [];
  out.forEach((tk, k) => {
    const prev = conImplicita[conImplicita.length - 1];
    const terminaValor = prev && (prev.t === 'num' || prev.t === 'var' || prev.t === ')');
    const empiezaValor = tk.t === 'num' || tk.t === 'var' || tk.t === 'fn' || tk.t === '(';
    if (k > 0 && terminaValor && empiezaValor) conImplicita.push({ t: 'op', v: '*' });
    conImplicita.push(tk);
  });
  return conImplicita;
}

type Nodo = (x: number) => number;

export function compilar(expr: string): Nodo {
  const tokens = tokenizar(expr);
  let pos = 0;
  const ver = () => tokens[pos];
  // suma := producto (('+'|'-') producto)*
  const suma = (): Nodo => {
    let izq = producto();
    while (ver()?.t === 'op' && ((ver() as any).v === '+' || (ver() as any).v === '-')) {
      const op = (tokens[pos++] as any).v;
      const a = izq;
      const b = producto();
      izq = op === '+' ? (x) => a(x) + b(x) : (x) => a(x) - b(x);
    }
    return izq;
  };
  const producto = (): Nodo => {
    let izq = unario();
    while (ver()?.t === 'op' && ((ver() as any).v === '*' || (ver() as any).v === '/')) {
      const op = (tokens[pos++] as any).v;
      const a = izq;
      const b = unario();
      izq = op === '*' ? (x) => a(x) * b(x) : (x) => a(x) / b(x);
    }
    return izq;
  };
  const unario = (): Nodo => {
    if (ver()?.t === 'op' && (ver() as any).v === '-') {
      pos++;
      const a = unario();
      return (x) => -a(x);
    }
    if (ver()?.t === 'op' && (ver() as any).v === '+') {
      pos++;
      return unario();
    }
    return potencia();
  };
  const potencia = (): Nodo => {
    const base = atomo();
    if (ver()?.t === 'op' && (ver() as any).v === '^') {
      pos++;
      const exp = unario(); // asociativa a la derecha: 2^-x, x^2^3
      return (x) => {
        const b = base(x);
        const e = exp(x);
        // Raíces impares de negativos: x^(1/3) con x < 0
        if (b < 0 && !Number.isInteger(e)) {
          const inv = 1 / e;
          if (Number.isInteger(Math.round(inv)) && Math.abs(inv - Math.round(inv)) < 1e-9 && Math.round(inv) % 2 !== 0) return -Math.pow(-b, e);
        }
        return Math.pow(b, e);
      };
    }
    return base;
  };
  const atomo = (): Nodo => {
    const tk = tokens[pos++];
    if (!tk) throw new Error('Expresión incompleta');
    if (tk.t === 'num') return () => tk.v;
    if (tk.t === 'var') return (x) => x;
    if (tk.t === 'fn') {
      const f = FUNCIONES[tk.v];
      if (ver()?.t === '(') {
        pos++;
        const a = suma();
        if (ver()?.t !== ')') throw new Error('Falta cerrar paréntesis');
        pos++;
        return (x) => f(a(x));
      }
      const a = potencia();
      return (x) => f(a(x));
    }
    if (tk.t === '(') {
      const a = suma();
      if (ver()?.t !== ')') throw new Error('Falta cerrar paréntesis');
      pos++;
      return a;
    }
    throw new Error('Expresión no válida');
  };
  const f = suma();
  if (pos < tokens.length) throw new Error('Sobran símbolos en la expresión');
  return f;
}

// ===== Dibujo =====
const COLORES = ['#0E5C36', '#C2410C', '#1D4ED8', '#7E22CE', '#B91C1C', '#0F766E'];

interface Spec {
  titulo?: string;
  x?: [number, number];
  y?: [number, number];
  etiquetas?: { x?: string; y?: string };
  funciones?: Array<{ expr: string; nombre?: string; desde?: number; hasta?: number }>;
  puntos?: Array<{ x: number; y: number; nombre?: string }>;
  vectores?: Array<{ desde: [number, number]; hasta: [number, number]; nombre?: string }>;
  segmentos?: Array<{ desde: [number, number]; hasta: [number, number]; nombre?: string; punteado?: boolean }>;
  series?: Array<{ nombre?: string; tipo?: 'linea' | 'puntos'; datos: Array<[number, number]> }>;
  barras?: { categorias: string[]; valores: number[]; nombre?: string };
}

const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : NaN);

function pasoBonito(rango: number, objetivo = 8) {
  const crudo = rango / objetivo;
  const mag = Math.pow(10, Math.floor(Math.log10(crudo)));
  const r = crudo / mag;
  return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
}

const formatear = (v: number) => {
  const r = Math.round(v * 1e6) / 1e6;
  return Math.abs(r) >= 1e5 || (Math.abs(r) < 1e-3 && r !== 0) ? r.toExponential(1) : r.toLocaleString('es-CO', { maximumFractionDigits: 3 });
};

function GraficaBarras({ spec }: { spec: Spec }) {
  const b = spec.barras!;
  const valores = b.valores.map(num).map((v) => (Number.isFinite(v) ? v : 0));
  const W = 560, H = 320, ml = 52, mr = 16, mt = spec.titulo ? 34 : 14, mb = 56;
  const max = Math.max(0, ...valores);
  const min = Math.min(0, ...valores);
  const paso = pasoBonito(max - min || 1, 6);
  const top = Math.ceil(max / paso) * paso || paso;
  const bottom = Math.floor(min / paso) * paso;
  const sy = (v: number) => mt + ((top - v) / (top - bottom)) * (H - mt - mb);
  const ancho = (W - ml - mr) / Math.max(1, valores.length);
  const ticks: number[] = [];
  for (let v = bottom; v <= top + 1e-9; v += paso) ticks.push(v);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={spec.titulo || b.nombre || 'Gráfica de barras'}>
      {spec.titulo && <text x={W / 2} y={20} textAnchor="middle" className="fill-[var(--color-texto)]" fontSize="15" fontWeight="600">{spec.titulo}</text>}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={ml} x2={W - mr} y1={sy(t)} y2={sy(t)} stroke="currentColor" strokeOpacity={t === 0 ? 0.6 : 0.12} />
          <text x={ml - 6} y={sy(t) + 4} textAnchor="end" fontSize="11" className="fill-[var(--color-secundario)]">{formatear(t)}</text>
        </g>
      ))}
      {valores.map((v, i) => {
        const x = ml + i * ancho + ancho * 0.18;
        const y0 = sy(0), y1 = sy(v);
        return (
          <g key={i}>
            <rect x={x} y={Math.min(y0, y1)} width={ancho * 0.64} height={Math.max(1, Math.abs(y1 - y0))} rx={4} fill={COLORES[0]} fillOpacity={0.85} />
            <text x={x + ancho * 0.32} y={Math.min(y0, y1) - 5} textAnchor="middle" fontSize="11" className="fill-[var(--color-texto)]">{formatear(v)}</text>
            <text x={x + ancho * 0.32} y={H - mb + 16} textAnchor="middle" fontSize="12" className="fill-[var(--color-texto)]">{String(b.categorias[i] ?? '').slice(0, 16)}</text>
          </g>
        );
      })}
      {spec.etiquetas?.y && <text x={14} y={(mt + H - mb) / 2} fontSize="12" textAnchor="middle" transform={`rotate(-90 14 ${(mt + H - mb) / 2})`} className="fill-[var(--color-secundario)]">{spec.etiquetas.y}</text>}
      {spec.etiquetas?.x && <text x={(ml + W - mr) / 2} y={H - 10} fontSize="12" textAnchor="middle" className="fill-[var(--color-secundario)]">{spec.etiquetas.x}</text>}
    </svg>
  );
}

function GraficaCartesiana({ spec }: { spec: Spec }) {
  const funciones = (spec.funciones || []).slice(0, 6).map((f) => {
    try {
      return { ...f, fn: compilar(String(f.expr || '')), error: '' };
    } catch (e: any) {
      return { ...f, fn: null as Nodo | null, error: e?.message || 'Expresión no válida' };
    }
  });
  const puntos = (spec.puntos || []).map((p) => ({ ...p, x: num(p.x), y: num(p.y) })).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  const vectores = (spec.vectores || []).filter((v) => Array.isArray(v.desde) && Array.isArray(v.hasta));
  const segmentos = (spec.segmentos || []).filter((v) => Array.isArray(v.desde) && Array.isArray(v.hasta));
  const series = (spec.series || []).map((s) => ({ ...s, datos: (s.datos || []).map((d) => [num(d?.[0]), num(d?.[1])] as [number, number]).filter((d) => Number.isFinite(d[0]) && Number.isFinite(d[1])) }));

  // Rango: el que indica la IA o uno calculado con los datos
  const xsDatos = [...puntos.map((p) => p.x), ...vectores.flatMap((v) => [num(v.desde[0]), num(v.hasta[0])]), ...segmentos.flatMap((v) => [num(v.desde[0]), num(v.hasta[0])]), ...series.flatMap((s) => s.datos.map((d) => d[0]))].filter(Number.isFinite);
  let [x0, x1] = Array.isArray(spec.x) && Number.isFinite(num(spec.x[0])) && Number.isFinite(num(spec.x[1])) && num(spec.x[1]) > num(spec.x[0]) ? [num(spec.x[0]), num(spec.x[1])] : xsDatos.length ? [Math.min(0, ...xsDatos), Math.max(...xsDatos)] : [-10, 10];
  if (x0 === x1) { x0 -= 1; x1 += 1; }

  const muestras: Array<Array<[number, number]>> = funciones.map((f) => {
    if (!f.fn) return [];
    const a = Number.isFinite(num(f.desde)) ? Math.max(x0, num(f.desde)) : x0;
    const b = Number.isFinite(num(f.hasta)) ? Math.min(x1, num(f.hasta)) : x1;
    const n = 400;
    const out: Array<[number, number]> = [];
    for (let i = 0; i <= n; i++) {
      const x = a + ((b - a) * i) / n;
      let y = NaN;
      try { y = f.fn(x); } catch {}
      out.push([x, y]);
    }
    return out;
  });

  const ysDatos = [...puntos.map((p) => p.y), ...vectores.flatMap((v) => [num(v.desde[1]), num(v.hasta[1])]), ...segmentos.flatMap((v) => [num(v.desde[1]), num(v.hasta[1])]), ...series.flatMap((s) => s.datos.map((d) => d[1])), ...muestras.flat().map((m) => m[1])].filter(Number.isFinite);
  let [y0, y1] = Array.isArray(spec.y) && Number.isFinite(num(spec.y[0])) && Number.isFinite(num(spec.y[1])) && num(spec.y[1]) > num(spec.y[0]) ? [num(spec.y[0]), num(spec.y[1])] : (() => {
    if (!ysDatos.length) return [-10, 10];
    const ord = [...ysDatos].sort((a, b) => a - b);
    // Recorta valores extremos (asíntotas) para que la gráfica se vea bien
    const lo = ord[Math.floor(ord.length * 0.02)], hi = ord[Math.ceil(ord.length * 0.98) - 1];
    const pad = (hi - lo || 2) * 0.1;
    return [Math.min(0, lo - pad), Math.max(0, hi + pad)];
  })();
  if (y0 === y1) { y0 -= 1; y1 += 1; }

  const W = 560, H = 380, ml = 44, mr = 16, mt = spec.titulo ? 34 : 14, mb = 40;
  const sx = (x: number) => ml + ((x - x0) / (x1 - x0)) * (W - ml - mr);
  const sy = (y: number) => mt + ((y1 - y) / (y1 - y0)) * (H - mt - mb);
  const pasoX = pasoBonito(x1 - x0), pasoY = pasoBonito(y1 - y0, 7);
  const ticksX: number[] = [], ticksY: number[] = [];
  for (let v = Math.ceil(x0 / pasoX) * pasoX; v <= x1 + 1e-9; v += pasoX) ticksX.push(Math.round(v / pasoX) * pasoX);
  for (let v = Math.ceil(y0 / pasoY) * pasoY; v <= y1 + 1e-9; v += pasoY) ticksY.push(Math.round(v / pasoY) * pasoY);
  const ejeX = y0 <= 0 && y1 >= 0 ? sy(0) : H - mb;
  const ejeY = x0 <= 0 && x1 >= 0 ? sx(0) : ml;
  const dentro = (y: number) => Number.isFinite(y) && y >= y0 - (y1 - y0) * 2 && y <= y1 + (y1 - y0) * 2;

  const trazo = (m: Array<[number, number]>) => {
    let d = '';
    let abierto = false;
    m.forEach(([x, y], i) => {
      const prev = m[i - 1];
      // Corta la curva en asíntotas o saltos (por ejemplo 1/x)
      const salto = prev && Number.isFinite(prev[1]) && Number.isFinite(y) && Math.abs(y - prev[1]) > (y1 - y0) * 1.5;
      if (!dentro(y) || salto) {
        abierto = false;
        if (!dentro(y)) return;
      }
      d += `${abierto ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))).toFixed(1)}`;
      abierto = true;
    });
    return d;
  };

  const flecha = (id: string, color: string) => (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill={color} />
    </marker>
  );
  const leyenda = [
    ...funciones.map((f, i) => ({ nombre: f.nombre || f.expr, color: COLORES[i % COLORES.length], error: f.error })),
    ...series.map((s, i) => ({ nombre: s.nombre || `Serie ${i + 1}`, color: COLORES[(funciones.length + i) % COLORES.length], error: '' })),
  ].filter((l) => l.nombre);
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto text-[var(--color-texto)]" role="img" aria-label={spec.titulo || 'Gráfica'}>
        <defs>
          <clipPath id={`area-${uid}`}><rect x={ml} y={mt} width={W - ml - mr} height={H - mt - mb} /></clipPath>
          {COLORES.map((c, i) => <React.Fragment key={i}>{flecha(`fl-${uid}-${i}`, c)}</React.Fragment>)}
        </defs>
        {spec.titulo && <text x={W / 2} y={20} textAnchor="middle" fontSize="15" fontWeight="600" className="fill-[var(--color-texto)]">{spec.titulo}</text>}
        {/* Cuadrícula */}
        {ticksX.map((t) => <line key={'gx' + t} x1={sx(t)} x2={sx(t)} y1={mt} y2={H - mb} stroke="currentColor" strokeOpacity={0.08} />)}
        {ticksY.map((t) => <line key={'gy' + t} x1={ml} x2={W - mr} y1={sy(t)} y2={sy(t)} stroke="currentColor" strokeOpacity={0.08} />)}
        {/* Ejes */}
        <line x1={ml} x2={W - mr} y1={ejeX} y2={ejeX} stroke="currentColor" strokeOpacity={0.55} />
        <line x1={ejeY} x2={ejeY} y1={mt} y2={H - mb} stroke="currentColor" strokeOpacity={0.55} />
        {ticksX.map((t) => Math.abs(t) > 1e-12 && <text key={'tx' + t} x={sx(t)} y={Math.min(H - mb + 14, ejeX + 14)} textAnchor="middle" fontSize="11" className="fill-[var(--color-secundario)]">{formatear(t)}</text>)}
        {ticksY.map((t) => Math.abs(t) > 1e-12 && <text key={'ty' + t} x={Math.max(ml - 4, ejeY - 5)} y={sy(t) + 4} textAnchor="end" fontSize="11" className="fill-[var(--color-secundario)]">{formatear(t)}</text>)}
        {spec.etiquetas?.x && <text x={W - mr} y={H - 8} textAnchor="end" fontSize="12" className="fill-[var(--color-secundario)]">{spec.etiquetas.x}</text>}
        {spec.etiquetas?.y && <text x={ml + 4} y={mt + 12} fontSize="12" className="fill-[var(--color-secundario)]">{spec.etiquetas.y}</text>}
        <g clipPath={`url(#area-${uid})`}>
          {muestras.map((m, i) => <path key={'f' + i} d={trazo(m)} fill="none" stroke={COLORES[i % COLORES.length]} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />)}
          {series.map((s, i) => {
            const color = COLORES[(funciones.length + i) % COLORES.length];
            return (
              <g key={'s' + i}>
                {s.tipo !== 'puntos' && <polyline points={s.datos.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke={color} strokeWidth={2.2} />}
                {s.datos.map(([x, y], k) => <circle key={k} cx={sx(x)} cy={sy(y)} r={3.5} fill={color} />)}
              </g>
            );
          })}
          {segmentos.map((v, i) => (
            <g key={'g' + i}>
              <line x1={sx(num(v.desde[0]))} y1={sy(num(v.desde[1]))} x2={sx(num(v.hasta[0]))} y2={sy(num(v.hasta[1]))} stroke={COLORES[(i + 2) % COLORES.length]} strokeWidth={2} strokeDasharray={v.punteado ? '5 4' : undefined} />
              {v.nombre && <text x={(sx(num(v.desde[0])) + sx(num(v.hasta[0]))) / 2 + 6} y={(sy(num(v.desde[1])) + sy(num(v.hasta[1]))) / 2 - 6} fontSize="12" className="fill-[var(--color-texto)]">{v.nombre}</text>}
            </g>
          ))}
          {vectores.map((v, i) => {
            const c = i % COLORES.length;
            return (
              <g key={'v' + i}>
                <line x1={sx(num(v.desde[0]))} y1={sy(num(v.desde[1]))} x2={sx(num(v.hasta[0]))} y2={sy(num(v.hasta[1]))} stroke={COLORES[c]} strokeWidth={2.6} markerEnd={`url(#fl-${uid}-${c})`} />
                {v.nombre && <text x={sx(num(v.hasta[0])) + 6} y={sy(num(v.hasta[1])) - 6} fontSize="13" fontWeight="600" fill={COLORES[c]}>{v.nombre}</text>}
              </g>
            );
          })}
          {puntos.map((p, i) => (
            <g key={'p' + i}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill="var(--color-superficie)" stroke={COLORES[0]} strokeWidth={2.2} />
              {p.nombre && <text x={sx(p.x) + 8} y={sy(p.y) - 8} fontSize="12" className="fill-[var(--color-texto)]">{p.nombre}</text>}
            </g>
          ))}
        </g>
      </svg>
      {leyenda.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 pt-1">
          {leyenda.map((l, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-texto)]">
              <span className="w-3 h-[3px] rounded-full" style={{ background: l.color }} />
              {l.nombre}
              {l.error && <span className="text-[12px] text-[#B3261E]">(no se pudo dibujar: {l.error})</span>}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export function Grafica({ fuente }: { fuente: string }) {
  const resultado = useMemo(() => {
    try {
      const limpio = fuente.trim().replace(/^```\w*|```$/g, '');
      return { spec: JSON.parse(limpio) as Spec, error: '' };
    } catch (e: any) {
      return { spec: null, error: 'dibujando' };
    }
  }, [fuente]);

  if (!resultado.spec) {
    return (
      <div className="my-3 rounded-2xl border border-dashed border-[var(--color-separador)] px-4 py-6 text-center text-[14px] text-[var(--color-secundario)]">
        Dibujando la gráfica…
      </div>
    );
  }
  const spec = resultado.spec;
  return (
    <figure className="my-3 w-full max-w-[560px] rounded-2xl border border-[var(--color-separador)] bg-[var(--color-superficie)] p-2 sm:p-3 not-prose">
      {spec.barras && Array.isArray(spec.barras.valores) ? <GraficaBarras spec={spec} /> : <GraficaCartesiana spec={spec} />}
    </figure>
  );
}

export default Grafica;
