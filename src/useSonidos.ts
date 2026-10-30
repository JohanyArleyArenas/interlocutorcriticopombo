import { useCallback, useEffect, useState } from 'react';
import {
  alternarSonidoGamificacion,
  guardarProgreso,
  leerProgreso,
  type NotificacionRecompensa,
} from './gamificacion.ts';

export type TipoSonidoApple =
  | 'clic'
  | 'navegacion'
  | 'estrella'
  | 'reto'
  | 'nivel'
  | 'acierto'
  | 'error';

export type TipoAmbienteSonoro = 'lluvia-suave' | 'bosque-santander' | 'ondas-alfa';

export interface PreferenciasSensorialesUsuario {
  sonidoActivo: boolean;
  sonidosAmbientalesActivos: boolean;
  ambienteSeleccionado: TipoAmbienteSonoro;
  vibracionHapticaActiva: boolean;
  modoLecturaActivo: boolean;
}

const CLAVE_PREFERENCIAS_PREFIX = 'interlocutor-preferencias-v1:';

function clavePreferencias(estudiante: string): string {
  const limpio = (estudiante || 'general').trim().toUpperCase();
  return `${CLAVE_PREFERENCIAS_PREFIX}${limpio}`;
}

export function leerPreferenciasSensoriales(estudiante: string): PreferenciasSensorialesUsuario {
  const prog = leerProgreso(estudiante);
  const base: PreferenciasSensorialesUsuario = {
    sonidoActivo: typeof prog.sonidoActivo === 'boolean' ? prog.sonidoActivo : true,
    sonidosAmbientalesActivos: Boolean(prog.sonidosAmbientalesActivos),
    ambienteSeleccionado: prog.ambienteSeleccionado || 'lluvia-suave',
    vibracionHapticaActiva:
      typeof prog.vibracionHapticaActiva === 'boolean' ? prog.vibracionHapticaActiva : true,
    modoLecturaActivo: Boolean(prog.modoLecturaActivo),
  };

  if (typeof window === 'undefined') return base;
  try {
    const raw = localStorage.getItem(clavePreferencias(estudiante));
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<PreferenciasSensorialesUsuario>;
    return {
      sonidoActivo:
        typeof parsed.sonidoActivo === 'boolean' ? parsed.sonidoActivo : base.sonidoActivo,
      sonidosAmbientalesActivos:
        typeof parsed.sonidosAmbientalesActivos === 'boolean'
          ? parsed.sonidosAmbientalesActivos
          : base.sonidosAmbientalesActivos,
      ambienteSeleccionado: parsed.ambienteSeleccionado || base.ambienteSeleccionado,
      vibracionHapticaActiva:
        typeof parsed.vibracionHapticaActiva === 'boolean'
          ? parsed.vibracionHapticaActiva
          : base.vibracionHapticaActiva,
      modoLecturaActivo:
        typeof parsed.modoLecturaActivo === 'boolean'
          ? parsed.modoLecturaActivo
          : base.modoLecturaActivo,
    };
  } catch {
    return base;
  }
}

export function guardarPreferenciasSensoriales(
  estudiante: string,
  parcial: Partial<PreferenciasSensorialesUsuario>
): PreferenciasSensorialesUsuario {
  const actual = leerPreferenciasSensoriales(estudiante);
  const nuevo: PreferenciasSensorialesUsuario = {
    ...actual,
    ...parcial,
  };

  try {
    localStorage.setItem(clavePreferencias(estudiante), JSON.stringify(nuevo));
  } catch {
    /* continuar en memoria si el navegador restringe localStorage */
  }

  // Sincronizar también dentro del estado general de gamificación del estudiante
  const estado = leerProgreso(estudiante);
  estado.sonidoActivo = nuevo.sonidoActivo;
  estado.sonidosAmbientalesActivos = nuevo.sonidosAmbientalesActivos;
  estado.ambienteSeleccionado = nuevo.ambienteSeleccionado;
  estado.vibracionHapticaActiva = nuevo.vibracionHapticaActiva;
  estado.modoLecturaActivo = nuevo.modoLecturaActivo;
  guardarProgreso(estudiante, estado);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('interlocutor:preferencias-actualizadas', { detail: nuevo })
    );
  }

  return nuevo;
}

let contextoAudio: AudioContext | null = null;
const ultimoDisparoPorTipo: Record<string, number> = {};

// Nodos activos del motor de sonidos ambientales estilo iOS Background Sounds
interface MotorAmbientalActivo {
  gainMaestro: GainNode;
  detener: () => void;
  tipo: TipoAmbienteSonoro;
}

let motorAmbientalActual: MotorAmbientalActivo | null = null;

function obtenerAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    if (!contextoAudio) {
      contextoAudio = new Ctx();
    }
    if (contextoAudio.state === 'suspended') {
      contextoAudio.resume().catch(() => {});
    }
    return contextoAudio;
  } catch {
    return null;
  }
}

/**
 * Ejecuta vibración háptica física en dispositivos móviles compatibles (`navigator.vibrate`)
 * y emite un evento visual sutil para retroalimentación táctil.
 */
export function ejecutarVibracionHaptica(
  patron: 'ligero' | 'navegacion' | 'estrella' | 'reto' | 'error' = 'ligero',
  activo = true
): boolean {
  if (!activo || typeof window === 'undefined') return false;
  try {
    const nav = window.navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    if (typeof nav.vibrate === 'function') {
      if (patron === 'ligero') {
        nav.vibrate(10);
      } else if (patron === 'navegacion') {
        nav.vibrate(14);
      } else if (patron === 'estrella') {
        nav.vibrate([14, 38, 22]);
      } else if (patron === 'reto') {
        nav.vibrate([18, 35, 18, 35, 32]);
      } else if (patron === 'error') {
        nav.vibrate([26, 45, 26]);
      }
      return true;
    }
  } catch {
    /* Ignorar si el navegador bloquea la API de vibración */
  }
  return false;
}

/**
 * Motor generador de sonidos ambientales de concentración estilo iOS Background Sounds.
 */
export function sincronizarSonidoAmbiental(
  activo: boolean,
  tipo: TipoAmbienteSonoro = 'lluvia-suave'
): void {
  if (typeof window === 'undefined') return;

  if (!activo) {
    if (motorAmbientalActual) {
      const refMotor = motorAmbientalActual;
      motorAmbientalActual = null;
      refMotor.detener();
    }
    return;
  }

  // Si ya está sonando el mismo ambiente, no reiniciarlo
  if (motorAmbientalActual && motorAmbientalActual.tipo === tipo) {
    return;
  }

  if (motorAmbientalActual) {
    motorAmbientalActual.detener();
    motorAmbientalActual = null;
  }

  const ctx = obtenerAudioContext();
  if (!ctx) return;

  try {
    const ahora = ctx.currentTime;
    const gainMaestro = ctx.createGain();
    gainMaestro.gain.setValueAtTime(0.0001, ahora);
    const gananciaObjetivo = tipo === 'ondas-alfa' ? 0.014 : 0.018;
    gainMaestro.gain.linearRampToValueAtTime(gananciaObjetivo, ahora + 0.7);
    gainMaestro.connect(ctx.destination);

    const nodosParaDetener: Array<{ stop?: (when?: number) => void; disconnect: () => void }> = [];

    if (tipo === 'lluvia-suave' || tipo === 'bosque-santander') {
      // Crear buffer de ruido rosa/marrón suave de 3 segundos en bucle
      const duracionBuffer = 3;
      const tamano = ctx.sampleRate * duracionBuffer;
      const buffer = ctx.createBuffer(1, tamano, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let ultimoValor = 0;
      for (let i = 0; i < tamano; i++) {
        const blanco = Math.random() * 2 - 1;
        ultimoValor = (ultimoValor + 0.03 * blanco) / 1.03;
        data[i] = ultimoValor * 2.5;
      }

      const fuenteRuido = ctx.createBufferSource();
      fuenteRuido.buffer = buffer;
      fuenteRuido.loop = true;

      const filtroAmbiente = ctx.createBiquadFilter();
      filtroAmbiente.type = tipo === 'lluvia-suave' ? 'lowpass' : 'bandpass';
      filtroAmbiente.frequency.setValueAtTime(tipo === 'lluvia-suave' ? 680 : 460, ahora);
      filtroAmbiente.Q.setValueAtTime(tipo === 'lluvia-suave' ? 0.6 : 1.1, ahora);

      // LFO lento para simular la brisa natural
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(tipo === 'lluvia-suave' ? 0.14 : 0.22, ahora);
      lfoGain.gain.setValueAtTime(tipo === 'lluvia-suave' ? 95 : 160, ahora);
      lfo.connect(lfoGain);
      lfoGain.connect(filtroAmbiente.frequency);

      fuenteRuido.connect(filtroAmbiente);
      filtroAmbiente.connect(gainMaestro);

      fuenteRuido.start(ahora);
      lfo.start(ahora);
      nodosParaDetener.push(fuenteRuido, lfo, lfoGain, filtroAmbiente);
    } else if (tipo === 'ondas-alfa') {
      // Armónico cálido de concentración (quinta justa suave pasada por filtro paso-bajo)
      const filtroPad = ctx.createBiquadFilter();
      filtroPad.type = 'lowpass';
      filtroPad.frequency.setValueAtTime(480, ahora);
      filtroPad.connect(gainMaestro);

      const oscBase = ctx.createOscillator();
      const oscQuinta = ctx.createOscillator();
      oscBase.type = 'sine';
      oscQuinta.type = 'triangle';
      oscBase.frequency.setValueAtTime(216, ahora); // A3 cálido
      oscQuinta.frequency.setValueAtTime(324, ahora); // E4 suave

      const gainQuinta = ctx.createGain();
      gainQuinta.gain.setValueAtTime(0.35, ahora);

      oscBase.connect(filtroPad);
      oscQuinta.connect(gainQuinta);
      gainQuinta.connect(filtroPad);

      oscBase.start(ahora);
      oscQuinta.start(ahora);
      nodosParaDetener.push(oscBase, oscQuinta, gainQuinta, filtroPad);
    }

    motorAmbientalActual = {
      gainMaestro,
      tipo,
      detener: () => {
        try {
          const tFin = ctx.currentTime;
          gainMaestro.gain.cancelScheduledValues(tFin);
          gainMaestro.gain.setValueAtTime(Math.max(0.0001, gainMaestro.gain.value), tFin);
          gainMaestro.gain.exponentialRampToValueAtTime(0.0001, tFin + 0.35);
          window.setTimeout(() => {
            nodosParaDetener.forEach((n) => {
              try {
                n.stop?.();
                n.disconnect();
              } catch {
                /* nodo ya detenido */
              }
            });
            try {
              gainMaestro.disconnect();
            } catch {
              /* ignorar */
            }
          }, 380);
        } catch {
          /* ignorar */
        }
      },
    };
  } catch {
    /* Ignorar si el navegador bloquea el inicio antes de gesto del usuario */
  }
}

/**
 * Sintetizador acústico estilo Apple HIG (Web Audio API).
 * Utiliza ondas senoidales y triangulares pasadas por un filtro paso-bajo cálido
 * con envolventes exponenciales suaves para lograr clics táctiles y armónicos cristalinos.
 */
export function reproducirEfectoApple(tipo: TipoSonidoApple, activo = true): void {
  if (!activo || typeof window === 'undefined') return;

  const ahoraMs = Date.now();
  const ventanaDebounce = tipo === 'clic' || tipo === 'navegacion' ? 45 : 140;
  if (ultimoDisparoPorTipo[tipo] && ahoraMs - ultimoDisparoPorTipo[tipo] < ventanaDebounce) {
    return;
  }
  ultimoDisparoPorTipo[tipo] = ahoraMs;

  const ctx = obtenerAudioContext();
  if (!ctx) return;

  try {
    const t0 = ctx.currentTime;

    // Filtro paso-bajo maestro para dar calidez acústica tipo marimba/cristal de iOS
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(tipo === 'error' ? 950 : 3200, t0);
    filtro.Q.setValueAtTime(0.7, t0);
    filtro.connect(ctx.destination);

    const tocarArmonico = (opts: {
      frecuencia: number;
      frecuenciaFinal?: number;
      inicio: number;
      duracion: number;
      ganancia: number;
      onda?: OscillatorType;
      armonicaSuperior?: boolean;
    }) => {
      const {
        frecuencia,
        frecuenciaFinal,
        inicio,
        duracion,
        ganancia,
        onda = 'sine',
        armonicaSuperior = false,
      } = opts;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = onda;
      osc.frequency.setValueAtTime(frecuencia, t0 + inicio);
      if (frecuenciaFinal) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(40, frecuenciaFinal),
          t0 + inicio + duracion
        );
      }

      const ataque = Math.min(0.014, duracion * 0.25);
      gain.gain.setValueAtTime(0.0001, t0 + inicio);
      gain.gain.linearRampToValueAtTime(ganancia, t0 + inicio + ataque);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + inicio + duracion);

      osc.connect(gain);
      gain.connect(filtro);

      osc.start(t0 + inicio);
      osc.stop(t0 + inicio + duracion + 0.015);

      if (armonicaSuperior) {
        const oscBrillo = ctx.createOscillator();
        const gainBrillo = ctx.createGain();
        oscBrillo.type = 'triangle';
        oscBrillo.frequency.setValueAtTime(frecuencia * 2, t0 + inicio);
        gainBrillo.gain.setValueAtTime(0.0001, t0 + inicio);
        gainBrillo.gain.linearRampToValueAtTime(ganancia * 0.22, t0 + inicio + ataque);
        gainBrillo.gain.exponentialRampToValueAtTime(0.0001, t0 + inicio + duracion * 0.75);
        oscBrillo.connect(gainBrillo);
        gainBrillo.connect(filtro);
        oscBrillo.start(t0 + inicio);
        oscBrillo.stop(t0 + inicio + duracion);
      }
    };

    if (tipo === 'clic') {
      tocarArmonico({
        frecuencia: 310,
        frecuenciaFinal: 135,
        inicio: 0,
        duracion: 0.026,
        ganancia: 0.032,
        onda: 'sine',
      });
    } else if (tipo === 'navegacion') {
      tocarArmonico({
        frecuencia: 440,
        frecuenciaFinal: 587.33,
        inicio: 0,
        duracion: 0.055,
        ganancia: 0.03,
        onda: 'sine',
      });
    } else if (tipo === 'acierto') {
      tocarArmonico({
        frecuencia: 587.33, // D5
        inicio: 0,
        duracion: 0.16,
        ganancia: 0.055,
        onda: 'sine',
        armonicaSuperior: true,
      });
      tocarArmonico({
        frecuencia: 880, // A5
        inicio: 0.075,
        duracion: 0.26,
        ganancia: 0.065,
        onda: 'sine',
        armonicaSuperior: true,
      });
    } else if (tipo === 'estrella') {
      tocarArmonico({
        frecuencia: 659.25, // E5
        inicio: 0,
        duracion: 0.22,
        ganancia: 0.055,
        onda: 'sine',
        armonicaSuperior: true,
      });
      tocarArmonico({
        frecuencia: 987.77, // B5
        inicio: 0.065,
        duracion: 0.26,
        ganancia: 0.06,
        onda: 'sine',
        armonicaSuperior: true,
      });
      tocarArmonico({
        frecuencia: 1318.51, // E6
        inicio: 0.13,
        duracion: 0.38,
        ganancia: 0.068,
        onda: 'sine',
        armonicaSuperior: true,
      });
    } else if (tipo === 'reto') {
      const notas = [523.25, 783.99, 987.77, 1318.51];
      notas.forEach((freq, idx) => {
        tocarArmonico({
          frecuencia: freq,
          inicio: idx * 0.075,
          duracion: idx === notas.length - 1 ? 0.48 : 0.24,
          ganancia: idx === notas.length - 1 ? 0.075 : 0.058,
          onda: 'sine',
          armonicaSuperior: true,
        });
      });
    } else if (tipo === 'nivel') {
      const notasNivel = [587.33, 739.99, 880.0, 1174.66, 1479.98];
      notasNivel.forEach((freq, idx) => {
        tocarArmonico({
          frecuencia: freq,
          inicio: idx * 0.08,
          duracion: idx >= 3 ? 0.55 : 0.28,
          ganancia: idx === notasNivel.length - 1 ? 0.08 : 0.06,
          onda: 'sine',
          armonicaSuperior: true,
        });
      });
    } else if (tipo === 'error') {
      tocarArmonico({
        frecuencia: 220,
        frecuenciaFinal: 185,
        inicio: 0,
        duracion: 0.14,
        ganancia: 0.045,
        onda: 'sine',
      });
      tocarArmonico({
        frecuencia: 174.61,
        frecuenciaFinal: 146.83,
        inicio: 0.11,
        duracion: 0.2,
        ganancia: 0.045,
        onda: 'sine',
      });
    }
  } catch {
    /* Ignorar si el navegador restringe el contexto de audio antes de interacción */
  }
}

export interface UseSonidosOpciones {
  escucharEventosGlobales?: boolean;
}

/**
 * Hook `useSonidos`
 * Gestiona los efectos de audio estilo Apple, los sonidos ambientales de concentración
 * y la vibración háptica, persistiendo todas las preferencias en localStorage.
 */
export function useSonidos(estudiante = '', opciones?: UseSonidosOpciones) {
  const escucharGlobales = opciones?.escucharEventosGlobales ?? false;

  const [preferencias, setPreferencias] = useState<PreferenciasSensorialesUsuario>(() =>
    leerPreferenciasSensoriales(estudiante)
  );

  // Sincronizar cuando cambia el estudiante o se modifican preferencias en localStorage
  useEffect(() => {
    const actualizarEstado = () => {
      const nuevas = leerPreferenciasSensoriales(estudiante);
      setPreferencias(nuevas);
    };
    actualizarEstado();
    window.addEventListener('interlocutor:progreso-actualizado', actualizarEstado);
    window.addEventListener('interlocutor:preferencias-actualizadas', actualizarEstado);
    window.addEventListener('storage', actualizarEstado);
    return () => {
      window.removeEventListener('interlocutor:progreso-actualizado', actualizarEstado);
      window.removeEventListener('interlocutor:preferencias-actualizadas', actualizarEstado);
      window.removeEventListener('storage', actualizarEstado);
    };
  }, [estudiante]);

  // Mantener sincronizado el motor de sonido ambiental cuando está activo
  useEffect(() => {
    sincronizarSonidoAmbiental(
      preferencias.sonidosAmbientalesActivos,
      preferencias.ambienteSeleccionado
    );
  }, [preferencias.sonidosAmbientalesActivos, preferencias.ambienteSeleccionado]);

  // Escuchar eventos globales de recompensas (estrellas, retos, insignias, niveles)
  useEffect(() => {
    if (!escucharGlobales) return;

    const manejarNotificacion = (e: Event) => {
      const prefs = leerPreferenciasSensoriales(estudiante);
      const ev = e as CustomEvent<NotificacionRecompensa>;
      const tipoNotif = ev.detail?.tipo;

      if (prefs.vibracionHapticaActiva) {
        ejecutarVibracionHaptica(
          tipoNotif === 'reto' || tipoNotif === 'nivel' || tipoNotif === 'insignia'
            ? 'reto'
            : 'estrella',
          true
        );
      }

      if (!prefs.sonidoActivo) return;
      if (tipoNotif === 'nivel') {
        reproducirEfectoApple('nivel', true);
      } else if (tipoNotif === 'reto' || tipoNotif === 'insignia') {
        reproducirEfectoApple('reto', true);
      } else {
        reproducirEfectoApple('estrella', true);
      }
    };

    window.addEventListener('interlocutor:recompensa', manejarNotificacion);
    return () => {
      window.removeEventListener('interlocutor:recompensa', manejarNotificacion);
    };
  }, [estudiante, escucharGlobales]);

  const configurarSonido = useCallback(
    (nuevoValor: boolean) => {
      const actualizado = guardarPreferenciasSensoriales(estudiante, {
        sonidoActivo: nuevoValor,
      });
      setPreferencias(actualizado);
      if (nuevoValor) {
        reproducirEfectoApple('estrella', true);
      }
      return nuevoValor;
    },
    [estudiante]
  );

  const alternarSonido = useCallback(() => {
    const nuevoEstado = alternarSonidoGamificacion(estudiante);
    const actualizado = guardarPreferenciasSensoriales(estudiante, {
      sonidoActivo: nuevoEstado.sonidoActivo,
    });
    setPreferencias(actualizado);
    if (actualizado.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('ligero', true);
    }
    return actualizado.sonidoActivo;
  }, [estudiante]);

  const alternarSonidosAmbientales = useCallback(() => {
    const actual = leerPreferenciasSensoriales(estudiante);
    const nuevoValor = !actual.sonidosAmbientalesActivos;
    const actualizado = guardarPreferenciasSensoriales(estudiante, {
      sonidosAmbientalesActivos: nuevoValor,
    });
    setPreferencias(actualizado);
    sincronizarSonidoAmbiental(nuevoValor, actualizado.ambienteSeleccionado);
    if (actualizado.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('ligero', true);
    }
    return nuevoValor;
  }, [estudiante]);

  const seleccionarAmbienteSonoro = useCallback(
    (ambiente: TipoAmbienteSonoro) => {
      const actualizado = guardarPreferenciasSensoriales(estudiante, {
        ambienteSeleccionado: ambiente,
        sonidosAmbientalesActivos: true,
      });
      setPreferencias(actualizado);
      sincronizarSonidoAmbiental(true, ambiente);
      if (actualizado.vibracionHapticaActiva) {
        ejecutarVibracionHaptica('ligero', true);
      }
      return actualizado;
    },
    [estudiante]
  );

  const alternarVibracionHaptica = useCallback(() => {
    const actual = leerPreferenciasSensoriales(estudiante);
    const nuevoValor = !actual.vibracionHapticaActiva;
    const actualizado = guardarPreferenciasSensoriales(estudiante, {
      vibracionHapticaActiva: nuevoValor,
    });
    setPreferencias(actualizado);
    if (nuevoValor) {
      ejecutarVibracionHaptica('estrella', true);
      if (actualizado.sonidoActivo) {
        reproducirEfectoApple('clic', true);
      }
    }
    return nuevoValor;
  }, [estudiante]);

  const alternarModoLectura = useCallback(() => {
    const actual = leerPreferenciasSensoriales(estudiante);
    const nuevoValor = !actual.modoLecturaActivo;
    const actualizado = guardarPreferenciasSensoriales(estudiante, {
      modoLecturaActivo: nuevoValor,
    });
    setPreferencias(actualizado);
    if (actualizado.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('ligero', true);
    }
    if (actualizado.sonidoActivo) {
      reproducirEfectoApple('clic', true);
    }
    return nuevoValor;
  }, [estudiante]);

  const probarVibracionHaptica = useCallback(() => {
    ejecutarVibracionHaptica('estrella', true);
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.sonidoActivo) {
      reproducirEfectoApple('clic', true);
    }
  }, [estudiante]);

  const tocarClic = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('ligero', true);
    }
    reproducirEfectoApple('clic', prefs.sonidoActivo);
  }, [estudiante]);

  const tocarNavegacion = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('navegacion', true);
    }
    reproducirEfectoApple('navegacion', prefs.sonidoActivo);
  }, [estudiante]);

  const tocarEstrella = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('estrella', true);
    }
    reproducirEfectoApple('estrella', prefs.sonidoActivo);
  }, [estudiante]);

  const tocarReto = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('reto', true);
    }
    reproducirEfectoApple('reto', prefs.sonidoActivo);
  }, [estudiante]);

  const tocarNivel = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('reto', true);
    }
    reproducirEfectoApple('nivel', prefs.sonidoActivo);
  }, [estudiante]);

  const tocarAcierto = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('estrella', true);
    }
    reproducirEfectoApple('acierto', prefs.sonidoActivo);
  }, [estudiante]);

  const tocarError = useCallback(() => {
    const prefs = leerPreferenciasSensoriales(estudiante);
    if (prefs.vibracionHapticaActiva) {
      ejecutarVibracionHaptica('error', true);
    }
    reproducirEfectoApple('error', prefs.sonidoActivo);
  }, [estudiante]);

  return {
    sonidoActivo: preferencias.sonidoActivo,
    sonidosAmbientalesActivos: preferencias.sonidosAmbientalesActivos,
    ambienteSeleccionado: preferencias.ambienteSeleccionado,
    vibracionHapticaActiva: preferencias.vibracionHapticaActiva,
    modoLecturaActivo: preferencias.modoLecturaActivo,
    preferencias,
    configurarSonido,
    alternarSonido,
    alternarSonidosAmbientales,
    seleccionarAmbienteSonoro,
    alternarVibracionHaptica,
    alternarModoLectura,
    probarVibracionHaptica,
    tocarClic,
    tocarNavegacion,
    tocarEstrella,
    tocarReto,
    tocarNivel,
    tocarAcierto,
    tocarError,
  };
}

export default useSonidos;
