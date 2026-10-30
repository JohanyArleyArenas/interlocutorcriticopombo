import React, { useEffect, useState } from 'react';
import {
  Star,
  Flame,
  Shield,
  Trophy,
  Zap,
  Sparkles,
  Check,
  Heart,
  Lightbulb,
  Volume2,
  VolumeX,
  Award,
  Search,
  BookOpen,
  Compass,
  Layers,
  Crown,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  NotificacionRecompensa,
  CATALOGO_RETOS_DIARIOS,
  INSIGNIAS_CATALOGO,
  RECOMPENSAS_CANJEABLES,
  PREGUNTAS_DESAFIO_RELAMPAGO,
  PreguntaDesafioRelampago,
  CategoriaCulturaGeneral,
  reproducirSonidoRecompensa,
} from '../gamificacion.ts';
import { useGamificacion } from '../useGamificacion.ts';
import { PanelLogros } from './PanelLogros.tsx';

const ICONOS_INSIGNIA: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  'search-check': Search,
  'book-open': BookOpen,
  award: Award,
  zap: Zap,
  compass: Compass,
  layers: Layers,
  crown: Crown,
};

interface PanelGamificacionProps {
  estudiante: string;
  onSelectModo: (key: string) => void;
  modalAbiertoExterno?: boolean;
  onCerrarModalExterno?: () => void;
  pestanaInicial?: 'retos' | 'desafio' | 'recompensas' | 'logros' | null;
  categoriaDesafioInicial?: 'Todas' | CategoriaCulturaGeneral;
}

export const PanelGamificacion: React.FC<PanelGamificacionProps> = ({
  estudiante,
  onSelectModo,
  modalAbiertoExterno,
  onCerrarModalExterno,
  pestanaInicial = null,
  categoriaDesafioInicial,
}) => {
  const {
    estado,
    infoNivel,
    registrarDesafioRelampago,
    canjearRecompensa,
    alternarSonido,
    usarPista,
  } = useGamificacion(estudiante);
  const [pestana, setPestana] = useState<'retos' | 'desafio' | 'recompensas' | 'logros' | null>(
    modalAbiertoExterno ? 'logros' : pestanaInicial
  );
  const [mensajeCanje, setMensajeCanje] = useState<string>('');

  const [jugandoDesafio, setJugandoDesafio] = useState(false);
  const [categoriaCultura, setCategoriaCultura] = useState<'Todas' | CategoriaCulturaGeneral>(
    categoriaDesafioInicial || 'Todas'
  );
  const [preguntasRonda, setPreguntasRonda] = useState<PreguntaDesafioRelampago[]>([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [verificada, setVerificada] = useState(false);
  const [aciertosRonda, setAciertosRonda] = useState(0);
  const [comboActual, setComboActual] = useState(0);
  const [mostrarPista, setMostrarPista] = useState(false);
  const [rondaTerminada, setRondaTerminada] = useState(false);

  useEffect(() => {
    if (modalAbiertoExterno) {
      setPestana('logros');
    } else if (pestanaInicial) {
      setPestana(pestanaInicial);
    }
  }, [modalAbiertoExterno, pestanaInicial]);

  const porcentajeMetaHoy = Math.min(100, Math.round((estado.estrellasHoy / estado.metaEstrellasDiaria) * 100));
  const retosCompletadosHoy = CATALOGO_RETOS_DIARIOS.filter((r) => estado.retos[r.id]?.completado).length;

  const mezclarOpcionesPregunta = (p: PreguntaDesafioRelampago): PreguntaDesafioRelampago => {
    const pares = p.opciones.map((texto, idx) => ({ texto, esCorrecta: idx === p.correcta }));
    for (let i = pares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pares[i], pares[j]] = [pares[j], pares[i]];
    }
    return {
      ...p,
      opciones: pares.map((item) => item.texto),
      correcta: pares.findIndex((item) => item.esCorrecta),
    };
  };

  const iniciarDesafioRelampago = (catSeleccionada: 'Todas' | CategoriaCulturaGeneral = categoriaCultura) => {
    setCategoriaCultura(catSeleccionada);
    const bancoFiltrado =
      catSeleccionada === 'Todas'
        ? PREGUNTAS_DESAFIO_RELAMPAGO
        : PREGUNTAS_DESAFIO_RELAMPAGO.filter((p) => p.categoria === catSeleccionada);
    const barajadas = [...bancoFiltrado]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map(mezclarOpcionesPregunta);
    setPreguntasRonda(barajadas);
    setIndicePregunta(0);
    setVidas(3);
    setOpcionSeleccionada(null);
    setVerificada(false);
    setAciertosRonda(0);
    setComboActual(0);
    setMostrarPista(false);
    setRondaTerminada(false);
    setJugandoDesafio(true);
    setPestana('desafio');
  };

  useEffect(() => {
    if (pestanaInicial === 'desafio') {
      iniciarDesafioRelampago(categoriaDesafioInicial || 'Todas');
    }
  }, [pestanaInicial, categoriaDesafioInicial]);

  const comprobarRespuestaDesafio = () => {
    if (opcionSeleccionada === null || verificada) return;
    const actual = preguntasRonda[indicePregunta];
    const esCorrecta = opcionSeleccionada === actual.correcta;
    setVerificada(true);

    if (esCorrecta) {
      reproducirSonidoRecompensa('acierto', estado.sonidoActivo);
      setAciertosRonda((a) => a + 1);
      setComboActual((c) => c + 1);
    } else {
      reproducirSonidoRecompensa('error', estado.sonidoActivo);
      setVidas((v) => Math.max(0, v - 1));
      setComboActual(0);
    }
  };

  const siguientePreguntaDesafio = () => {
    if (vidas <= 0 || indicePregunta + 1 >= preguntasRonda.length) {
      setRondaTerminada(true);
      if (aciertosRonda > 0) {
        const catRegistro =
          categoriaCultura !== 'Todas' ? categoriaCultura : preguntasRonda[0]?.categoria;
        registrarDesafioRelampago(aciertosRonda, preguntasRonda.length, catRegistro);
      }
      return;
    }
    setIndicePregunta((i) => i + 1);
    setOpcionSeleccionada(null);
    setVerificada(false);
    setMostrarPista(false);
  };

  const activarPistaDesafio = () => {
    if (mostrarPista) return;
    const usado = usarPista();
    if (usado) {
      setMostrarPista(true);
    } else {
      setMensajeCanje('No te quedan lupas críticas. Puedes canjear más en la sección de recompensas.');
    }
  };

  const manejarCanje = (itemId: string) => {
    const res = canjearRecompensa(itemId);
    setMensajeCanje(res.mensaje);
    window.setTimeout(() => setMensajeCanje(''), 4200);
  };

  const preguntaActual = preguntasRonda[indicePregunta];
  const insigniasDesbloqueadas = INSIGNIAS_CATALOGO.filter((ins) =>
    estado.insigniasDesbloqueadas.includes(ins.id)
  );
  const insigniasPorDesbloquear = INSIGNIAS_CATALOGO.filter(
    (ins) => !estado.insigniasDesbloqueadas.includes(ins.id)
  );

  return (
    <section
      aria-label="Retos y progreso del estudiante"
      className="w-full mb-8 flex flex-col gap-6"
    >
      {/* Cabecera compacta de progreso */}
      <div
        style={{ animationDelay: '70ms' }}
        className="anim-tarjeta rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-5 flex flex-col gap-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-[14px] bg-[var(--color-acento)] text-[#FBFCFA] flex flex-col items-center justify-center shrink-0">
              <span className="text-[11px] opacity-90 leading-none">Nivel</span>
              <span className="font-literata text-[20px] font-semibold leading-tight tabular-nums">
                {infoNivel.nivelActual.nivel}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)] leading-snug">
                  {infoNivel.nivelActual.nombre}
                </h2>
                {estado.tituloEquipado && (
                  <span className="text-[13px] font-bold text-[var(--color-oro)] bg-[var(--color-oro)]/12 px-2.5 py-0.5 rounded-full">
                    {estado.tituloEquipado}
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[var(--color-secundario)] leading-snug mt-0.5">
                {infoNivel.nivelActual.lema}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            <div
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-fondo)] border border-[var(--color-separador)]"
              title="Estrellas acumuladas para canjear recompensas"
            >
              <Star className="w-4 h-4 text-[var(--color-oro)] fill-[var(--color-oro)]" />
              <span className="text-[15px] font-bold text-[var(--color-texto)] tabular-nums">{estado.estrellas}</span>
              <span className="text-[13px] text-[var(--color-secundario)]">estrellas</span>
            </div>

            <div
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-fondo)] border border-[var(--color-separador)]"
              title="Días seguidos de estudio"
            >
              <Flame className="w-4 h-4 text-[var(--color-rojo)] fill-[var(--color-rojo)]" />
              <span className="text-[15px] font-bold text-[var(--color-texto)] tabular-nums">{estado.rachaDias}</span>
              <span className="text-[13px] text-[var(--color-secundario)]">
                {estado.rachaDias === 1 ? 'día' : 'días'}
              </span>
            </div>

            <div
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-fondo)] border border-[var(--color-separador)]"
              title="Escudos protectores de racha"
            >
              <Shield className="w-4 h-4 text-[var(--color-acento)]" />
              <span className="text-[14px] font-bold text-[var(--color-texto)] tabular-nums">{estado.escudosRacha}</span>
            </div>

            <button
              type="button"
              onClick={() => alternarSonido()}
              className="min-w-[44px] min-h-[44px] rounded-full bg-[var(--color-fondo)] border border-[var(--color-separador)] flex items-center justify-center text-[var(--color-secundario)] hover:text-[var(--color-texto)] transition-colors"
              title={estado.sonidoActivo ? 'Sonidos activados' : 'Sonidos silenciados'}
              aria-label={estado.sonidoActivo ? 'Silenciar efectos de sonido' : 'Activar efectos de sonido'}
            >
              {estado.sonidoActivo ? (
                <Volume2 className="w-4 h-4 text-[var(--color-acento)]" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {modalAbiertoExterno && onCerrarModalExterno && (
              <button
                type="button"
                onClick={onCerrarModalExterno}
                className="min-w-[44px] min-h-[44px] rounded-full bg-[var(--color-fondo)] border border-[var(--color-separador)] flex items-center justify-center text-[var(--color-secundario)] hover:text-[var(--color-texto)]"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Barras finas sin caja */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="flex items-center justify-between text-[14px] mb-1.5">
              <span className="text-[var(--color-secundario)]">
                Experiencia crítica: <strong className="font-bold text-[var(--color-texto)] tabular-nums">{estado.xp} XP</strong>
              </span>
              <span className="text-[var(--color-acento)] font-bold tabular-nums">
                {infoNivel.siguienteNivel
                  ? `Faltan ${infoNivel.xpParaSiguiente} XP para el nivel ${infoNivel.siguienteNivel.nivel}`
                  : 'Nivel máximo alcanzado'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-acento)] transition-all duration-500"
                style={{ width: `${infoNivel.progresoPorcentaje}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[14px] mb-1.5">
              <span className="text-[var(--color-secundario)]">
                Meta de hoy:{' '}
                <strong className="font-bold text-[var(--color-texto)] tabular-nums">
                  {estado.estrellasHoy} de {estado.metaEstrellasDiaria} estrellas
                </strong>
              </span>
              <span className="text-[var(--color-oro)] font-bold tabular-nums">
                {porcentajeMetaHoy >= 100 ? 'Meta diaria lograda' : `${porcentajeMetaHoy}%`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-oro)] transition-all duration-500"
                style={{ width: `${porcentajeMetaHoy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pestañas en pastillas */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setPestana('desafio')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-[14px] transition-colors cursor-pointer ${
              pestana === 'desafio'
                ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold sombra-boton-acento'
                : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
            }`}
          >
            Desafío del día
          </button>

          <button
            type="button"
            onClick={() => setPestana('retos')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-[14px] transition-colors cursor-pointer ${
              pestana === 'retos'
                ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold sombra-boton-acento'
                : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
            }`}
          >
            Misiones del día ({retosCompletadosHoy} de {CATALOGO_RETOS_DIARIOS.length})
          </button>

          <button
            type="button"
            onClick={() => setPestana('recompensas')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-[14px] transition-colors cursor-pointer ${
              pestana === 'recompensas'
                ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold sombra-boton-acento'
                : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
            }`}
          >
            Canje y reconocimientos
          </button>

          <button
            type="button"
            onClick={() => setPestana('logros')}
            className={`min-h-[44px] px-4 py-2 rounded-full text-[14px] transition-colors cursor-pointer ${
              pestana === 'logros'
                ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold sombra-boton-acento'
                : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-secundario)] hover:text-[var(--color-texto)]'
            }`}
          >
            Resumen acumulado
          </button>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      {pestana !== null && (
        <div key={pestana} style={{ animationDelay: '150ms' }} className="anim-entrada">
          {pestana === 'retos' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
                  Misiones del día ({retosCompletadosHoy} de {CATALOGO_RETOS_DIARIOS.length})
                </h2>
                <button
                  type="button"
                  onClick={() => iniciarDesafioRelampago('Todas')}
                  className="self-start sm:self-auto min-h-[44px] px-4 rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[14px] font-bold hover:opacity-90 transition-opacity shrink-0 cursor-pointer sombra-boton-acento"
                >
                  Comenzar desafío cultural
                </button>
              </div>

              {/* Lista tipo cuaderno con casilla circular, descripción completa y recompensa a la derecha; sin chevrons */}
              <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] divide-y divide-[var(--color-separador)] overflow-hidden">
                {CATALOGO_RETOS_DIARIOS.map((reto, idxReto) => {
                  const prog = estado.retos[reto.id] || { actual: 0, completado: false, reclamado: false };
                  return (
                    <button
                      key={reto.id}
                      type="button"
                      style={{ animationDelay: `${190 + idxReto * 60}ms` }}
                      onClick={() => onSelectModo(reto.modoSugerido)}
                      className="anim-entrada w-full px-4 py-4 text-left flex items-start justify-between gap-4 hover:bg-[var(--color-acento-suave)]/35 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            prog.completado
                              ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-[var(--color-superficie)]'
                              : 'border-[var(--color-secundario)]/60 bg-transparent'
                          }`}
                        >
                          {prog.completado && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </span>

                        <div className="min-w-0">
                          <h3
                            className={`font-literata text-[17px] font-semibold leading-snug ${
                              prog.completado
                                ? 'text-[var(--color-secundario)] line-through'
                                : 'text-[var(--color-texto)]'
                            }`}
                          >
                            {reto.titulo}
                          </h3>
                          <p className="text-[15px] text-[var(--color-secundario)] leading-relaxed mt-0.5">
                            {reto.descripcion} ({prog.actual} de {reto.meta})
                          </p>
                        </div>
                      </div>

                      <span className="text-[14px] font-bold text-[var(--color-oro)] whitespace-nowrap shrink-0 tabular-nums pt-0.5">
                        +{reto.estrellas} {reto.estrellas === 1 ? 'estrella' : 'estrellas'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {pestana === 'desafio' && (
            <div className="anim-tarjeta rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-5 flex flex-col gap-4">
              {/* Selector de categoría en chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-separador)]">
                <span className="text-[14px] text-[var(--color-secundario)]">
                  Área temática:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {(
                    [
                      { id: 'Todas', label: 'Mixto' },
                      { id: 'Colombia y Santander', label: 'Colombia y Santander' },
                      { id: 'Literatura y Arte', label: 'Literatura y arte' },
                      { id: 'Ciencia y Universo', label: 'Ciencia y universo' },
                      { id: 'Historia y Mundo', label: 'Historia y mundo' },
                    ] as const
                  ).map((cat) => {
                    const activa = categoriaCultura === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => iniciarDesafioRelampago(cat.id)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-[14px] transition-colors cursor-pointer ${
                          activa
                            ? 'bg-[var(--color-acento)] text-[#FBFCFA] font-bold'
                            : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-texto)] hover:bg-[var(--color-acento-suave)]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!jugandoDesafio ? (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-literata text-[20px] font-semibold text-[var(--color-texto)]">
                    Desafío del día: cultura general
                  </h3>
                  <p className="text-[16px] text-[var(--color-secundario)] max-w-[540px]">
                    Pon a prueba tu bagaje cultural en cuatro preguntas sobre Colombia y Santander, literatura, ciencia e historia universal.
                  </p>
                  <button
                    type="button"
                    onClick={() => iniciarDesafioRelampago(categoriaCultura)}
                    className="mt-1 min-h-[44px] px-6 rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[15px] font-bold hover:opacity-90 transition-opacity sombra-boton-acento"
                  >
                    Comenzar ronda
                  </button>
                </div>
              ) : rondaTerminada ? (
                <div className="rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] p-6 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="font-literata text-[21px] font-semibold text-[var(--color-texto)]">
                    {vidas > 0 ? 'Ronda de cultura general completada' : 'Buen intento cultural'}
                  </h3>
                  <p className="text-[16px] text-[var(--color-secundario)]">
                    Lograste <strong className="font-bold text-[var(--color-texto)]">{aciertosRonda} de {preguntasRonda.length}</strong> aciertos
                    {aciertosRonda > 0
                      ? ` y sumaste +${Math.max(2, aciertosRonda * 2)} estrellas y +${Math.max(30, aciertosRonda * 20)} XP.`
                      : '.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => iniciarDesafioRelampago(categoriaCultura)}
                      className="min-h-[44px] px-5 rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[15px] font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity sombra-boton-acento"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Jugar otra ronda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPestana('retos')}
                      className="min-h-[44px] px-5 rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[15px] font-bold text-[var(--color-texto)] hover:bg-[var(--color-acento-suave)] transition-colors"
                    >
                      Ver misiones del día
                    </button>
                  </div>
                </div>
              ) : preguntaActual ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-[var(--color-acento)]">
                        {preguntaActual.categoria}
                      </span>
                      <span className="text-[14px] text-[var(--color-secundario)] tabular-nums">
                        Pregunta {indicePregunta + 1} de {preguntasRonda.length}
                      </span>
                      {comboActual >= 2 && (
                        <span className="text-[13px] font-bold text-[var(--color-oro)] tabular-nums">
                          Racha de {comboActual} aciertos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={activarPistaDesafio}
                        disabled={mostrarPista || verificada}
                        className="min-h-[38px] px-3 py-1 rounded-full border border-[var(--color-separador)] bg-[var(--color-fondo)] text-[13px] font-bold text-[var(--color-texto)] inline-flex items-center gap-1.5 hover:border-[var(--color-acento)] disabled:opacity-50"
                        title="Usar una lupa crítica para ver una pista"
                      >
                        <Lightbulb className="w-4 h-4 text-[var(--color-oro)]" />
                        <span>Pista ({estado.comodinesPista})</span>
                      </button>

                      <div className="flex items-center gap-1" aria-label={`${vidas} vidas restantes`}>
                        {[1, 2, 3].map((n) => (
                          <Heart
                            key={n}
                            className={`w-4 h-4 ${
                              n <= vidas ? 'text-[var(--color-rojo)] fill-[var(--color-rojo)]' : 'text-[var(--color-separador)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[var(--color-separador)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--color-acento)] transition-all duration-300"
                      style={{ width: `${Math.round(((indicePregunta + (verificada ? 1 : 0)) / preguntasRonda.length) * 100)}%` }}
                    />
                  </div>

                  <div className="rounded-[14px] bg-[var(--color-fondo)] border border-[var(--color-separador)] p-4">
                    <p className="text-[16px] text-[var(--color-texto)] leading-relaxed">
                      {preguntaActual.contexto}
                    </p>
                    <p className="font-literata text-[18px] font-semibold text-[var(--color-texto)] mt-2.5 leading-snug">
                      {preguntaActual.pregunta}
                    </p>
                  </div>

                  {mostrarPista && (
                    <div className="rounded-[10px] bg-[var(--color-acento-suave)] border border-[var(--color-acento)] px-4 py-3 text-[15px] text-[var(--color-texto)] flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-[var(--color-oro)] shrink-0 mt-1" />
                      <span>
                        <strong>Pista analítica:</strong> {preguntaActual.pista}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Opciones del desafío">
                    {preguntaActual.opciones.map((op, idx) => {
                      const elegida = opcionSeleccionada === idx;
                      const esCorrecta = idx === preguntaActual.correcta;
                      let claseBorde = 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]';
                      if (verificada) {
                        if (esCorrecta) {
                          claseBorde = 'border-[var(--color-acento)] bg-[var(--color-acento-suave)]';
                        } else if (elegida) {
                          claseBorde = 'border-[var(--color-rojo)] bg-[var(--color-rojo)]/10';
                        } else {
                          claseBorde = 'border-[var(--color-separador)] bg-[var(--color-superficie)] opacity-60';
                        }
                      } else if (elegida) {
                        claseBorde = 'border-[var(--color-acento)] bg-[var(--color-acento-suave)]';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={verificada}
                          onClick={() => setOpcionSeleccionada(idx)}
                          className={`text-left p-3.5 rounded-[14px] border transition-colors flex items-start gap-3 ${claseBorde}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full border text-[13px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              verificada && esCorrecta
                                ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-[#FBFCFA]'
                                : verificada && elegida
                                ? 'bg-[var(--color-rojo)] border-[var(--color-rojo)] text-[#FBFCFA]'
                                : elegida
                                ? 'bg-[var(--color-acento)] border-[var(--color-acento)] text-[#FBFCFA]'
                                : 'border-[var(--color-separador)] text-[var(--color-secundario)]'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-[16px] text-[var(--color-texto)] leading-snug">{op}</span>
                        </button>
                      );
                    })}
                  </div>

                  {verificada && (
                    <div
                      className={`rounded-[14px] p-4 border text-[15px] leading-relaxed ${
                        opcionSeleccionada === preguntaActual.correcta
                          ? 'bg-[var(--color-acento-suave)] border-[var(--color-acento)] text-[var(--color-texto)]'
                          : 'bg-[var(--color-rojo)]/10 border-[var(--color-rojo)] text-[var(--color-texto)]'
                      }`}
                    >
                      <p className="font-literata font-semibold mb-1">
                        {opcionSeleccionada === preguntaActual.correcta
                          ? 'Respuesta correcta'
                          : 'Explicación de la respuesta'}
                      </p>
                      <p>{preguntaActual.explicacion}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    {!verificada ? (
                      <button
                        type="button"
                        disabled={opcionSeleccionada === null}
                        onClick={comprobarRespuestaDesafio}
                        className="min-h-[44px] px-6 rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[15px] font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed sombra-boton-acento"
                      >
                        Comprobar respuesta
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={siguientePreguntaDesafio}
                        className="min-h-[44px] px-6 rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[15px] font-bold inline-flex items-center gap-2 hover:opacity-90 transition-opacity sombra-boton-acento"
                      >
                        <span>
                          {vidas <= 0 || indicePregunta + 1 >= preguntasRonda.length
                            ? 'Ver resultado final'
                            : 'Siguiente pregunta'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {pestana === 'recompensas' && (
            <div className="flex flex-col gap-7">
              {mensajeCanje && (
                <div className="rounded-[14px] bg-[var(--color-acento-suave)] border border-[var(--color-acento)] px-4 py-3 text-[15px] font-bold text-[var(--color-texto)]">
                  {mensajeCanje}
                </div>
              )}

              {/* Canje con Estrellas */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-3">
                  <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)]">
                    Canje de estrellas ({estado.estrellas} disponibles)
                  </h2>
                  <span className="text-[14px] text-[var(--color-secundario)]">
                    Gana estrellas argumentando, verificando fuentes y cerrando tus sesiones
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {RECOMPENSAS_CANJEABLES.map((item) => {
                    const yaDesbloqueado = item.tipo === 'titulo' && estado.titulosDesbloqueados.includes(item.valor);
                    const equipado = item.tipo === 'titulo' && estado.tituloEquipado === item.valor;
                    const alcanza = estado.estrellas >= item.costoEstrellas;

                    return (
                      <div
                        key={item.id}
                        className="rounded-[14px] border border-[var(--color-separador)] bg-[var(--color-superficie)] p-4 flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-literata text-[17px] font-semibold text-[var(--color-texto)] leading-snug">
                              {item.nombre}
                            </h3>
                            {!yaDesbloqueado && (
                              <span className="text-[14px] font-bold text-[var(--color-oro)] shrink-0 tabular-nums">
                                {item.costoEstrellas} estrellas
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] text-[var(--color-secundario)] mt-1 leading-relaxed">
                            {item.descripcion}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => manejarCanje(item.id)}
                          disabled={!yaDesbloqueado && !alcanza}
                          className={`w-full min-h-[44px] px-4 py-2 rounded-full text-[14px] font-bold transition-colors ${
                            equipado
                              ? 'bg-[var(--color-acento)] text-[#FBFCFA] sombra-boton-acento'
                              : yaDesbloqueado
                              ? 'border border-[var(--color-acento)] text-[var(--color-acento)] hover:bg-[var(--color-acento-suave)]'
                              : alcanza
                              ? 'bg-[var(--color-acento-suave)] text-[var(--color-acento)] hover:bg-[var(--color-acento)] hover:text-[#FBFCFA]'
                              : 'bg-[var(--color-fondo)] border border-[var(--color-separador)] text-[var(--color-secundario)] opacity-60 cursor-not-allowed'
                          }`}
                        >
                          {equipado
                            ? 'Título en uso (quitar)'
                            : yaDesbloqueado
                            ? 'Usar este título'
                            : `Canjear por ${item.costoEstrellas} estrellas`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reconocimientos agrupados en desbloqueados y por desbloquear, sin repetir "Pendiente" */}
              <div>
                <h2 className="font-literata text-[19px] font-semibold text-[var(--color-texto)] mb-3">
                  Reconocimientos ({insigniasDesbloqueadas.length} de {INSIGNIAS_CATALOGO.length})
                </h2>

                <div className="flex flex-col gap-4">
                  {insigniasDesbloqueadas.length > 0 && (
                    <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4">
                      <h3 className="font-literata text-[16px] font-semibold text-[var(--color-texto)] mb-3">
                        Desbloqueados ({insigniasDesbloqueadas.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {insigniasDesbloqueadas.map((ins) => {
                          const Icono = ICONOS_INSIGNIA[ins.icono] || Sparkles;
                          return (
                            <div
                              key={ins.id}
                              className="rounded-[14px] border border-[var(--color-separador)] bg-[var(--color-fondo)] p-3.5 flex items-start gap-3"
                            >
                              <div className="w-9 h-9 rounded-[10px] bg-[var(--color-oro)]/15 text-[var(--color-oro)] flex items-center justify-center shrink-0 mt-0.5">
                                <Icono className="w-5 h-5 fill-current" />
                              </div>
                              <div>
                                <h4 className="font-literata text-[16px] font-semibold text-[var(--color-texto)] leading-snug">
                                  {ins.nombre}
                                </h4>
                                <p className="text-[14px] text-[var(--color-secundario)] leading-relaxed mt-0.5">
                                  {ins.descripcion}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {insigniasPorDesbloquear.length > 0 && (
                    <div className="rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4">
                      <h3 className="font-literata text-[16px] font-semibold text-[var(--color-secundario)] mb-3">
                        Por desbloquear ({insigniasPorDesbloquear.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {insigniasPorDesbloquear.map((ins) => {
                          const Icono = ICONOS_INSIGNIA[ins.icono] || Sparkles;
                          return (
                            <div
                              key={ins.id}
                              className="rounded-[14px] border border-[var(--color-separador)] bg-[var(--color-fondo)]/60 p-3.5 flex items-start gap-3"
                            >
                              <div className="w-9 h-9 rounded-[10px] bg-[var(--color-superficie)] text-[var(--color-secundario)] opacity-60 flex items-center justify-center shrink-0 mt-0.5">
                                <Icono className="w-5 h-5" strokeWidth={1.75} />
                              </div>
                              <div>
                                <h4 className="font-literata text-[16px] font-semibold text-[var(--color-texto)] leading-snug">
                                  {ins.nombre}
                                </h4>
                                <p className="text-[14px] text-[var(--color-secundario)] leading-relaxed mt-0.5">
                                  {ins.condicionTexto}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {pestana === 'logros' && (
            <PanelLogros
              estudiante={estudiante}
              onSelectModo={(modoKey) => {
                onSelectModo(modoKey);
                onCerrarModalExterno?.();
              }}
              onIniciarDesafioCultural={(cat) => {
                iniciarDesafioRelampago(cat);
              }}
            />
          )}
        </div>
      )}
    </section>
  );
};

export const ToastRecompensaFlotante: React.FC = () => {
  const [notificacion, setNotificacion] = useState<NotificacionRecompensa | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const escuchar = (e: Event) => {
      const ev = e as CustomEvent<NotificacionRecompensa>;
      if (!ev.detail) return;
      setNotificacion(ev.detail);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setNotificacion(null), 4000);
    };
    window.addEventListener('interlocutor:recompensa', escuchar);
    return () => {
      window.removeEventListener('interlocutor:recompensa', escuchar);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!notificacion) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="message-appear fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-[340px] rounded-[14px] bg-[var(--color-superficie)] border border-[var(--color-separador)] p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-[10px] bg-[var(--color-acento-suave)] text-[var(--color-acento)] flex items-center justify-center shrink-0">
        {notificacion.tipo === 'nivel' ? (
          <Crown className="w-4 h-4" />
        ) : notificacion.tipo === 'reto' ? (
          <Trophy className="w-4 h-4" />
        ) : (
          <Star className="w-4 h-4 text-[var(--color-oro)] fill-[var(--color-oro)]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-[var(--color-oro)] tabular-nums">
            +{notificacion.estrellas} estrellas y +{notificacion.xp} XP
          </span>
          <button
            type="button"
            onClick={() => setNotificacion(null)}
            className="text-[var(--color-secundario)] hover:text-[var(--color-texto)] p-1"
            aria-label="Cerrar aviso de recompensa"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="font-literata text-[15px] font-semibold text-[var(--color-texto)] leading-snug mt-0.5">
          {notificacion.titulo}
        </p>
        {notificacion.subtitulo && (
          <p className="text-[13px] text-[var(--color-secundario)] leading-snug mt-0.5">
            {notificacion.subtitulo}
          </p>
        )}
      </div>
    </div>
  );
};
