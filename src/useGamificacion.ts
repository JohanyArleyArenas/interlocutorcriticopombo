import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccionGamificacion,
  analizarTextoInteraccionChat,
  alternarSonidoGamificacion,
  calcularNivel,
  canjearRecompensaTienda,
  EstadoGamificacion,
  leerProgreso,
  registrarAccionGamificacion,
  ResumenSesionModo,
  usarComodinPista,
} from './gamificacion.ts';

export interface InteraccionChatPayload {
  texto: string;
  modo: string;
  tieneArchivos?: boolean;
  turnosEnSesion?: number;
}

export interface UseGamificacionOpciones {
  estudiante?: string;
  modo?: string;
  mensajes?: Array<{
    id: string;
    role: 'user' | 'model';
    text: string;
    archivo?: unknown;
    archivos?: unknown[];
    icfes?: { id: string; accion: string; respuesta?: string };
  }>;
}

const crearResumenVacio = (): ResumenSesionModo => ({
  turnosTotales: 0,
  mensajesArgumentados: 0,
  preguntasAnaliticas: 0,
  desafiosPensamientoCritico: 0,
  archivosClaseSubidos: 0,
  verificacionesExternas: 0,
  intentosIcfes: 0,
  aciertosIcfes: 0,
  conReflexion: false,
});

/**
 * Hook `useGamificacion`
 * Registra en silencio la participación del estudiante durante el uso de cada modo
 * y entrega las estrellas acumuladas únicamente al terminar de usar el modo.
 */
export function useGamificacion(opciones?: string | UseGamificacionOpciones) {
  const estudiante =
    typeof opciones === 'string' ? opciones : opciones?.estudiante || '';
  const modoActivo =
    typeof opciones === 'object' && opciones?.modo ? opciones.modo : '';
  const mensajes =
    typeof opciones === 'object' && Array.isArray(opciones?.mensajes)
      ? opciones.mensajes
      : undefined;

  const [estado, setEstado] = useState<EstadoGamificacion>(() => leerProgreso(estudiante));
  const mensajesProcesadosRef = useRef<Set<string>>(new Set());
  const inicializadoMensajesRef = useRef<boolean>(false);
  const resumenSesionRef = useRef<ResumenSesionModo>(crearResumenVacio());
  const sesionPremiadaRef = useRef<boolean>(false);

  // Sincronizar con cambios en localStorage y eventos globales de gamificación
  useEffect(() => {
    setEstado(leerProgreso(estudiante));
    const sincronizar = () => setEstado(leerProgreso(estudiante));
    window.addEventListener('interlocutor:progreso-actualizado', sincronizar);
    window.addEventListener('storage', sincronizar);
    return () => {
      window.removeEventListener('interlocutor:progreso-actualizado', sincronizar);
      window.removeEventListener('storage', sincronizar);
    };
  }, [estudiante]);

  const ejecutarAccion = useCallback(
    (accion: AccionGamificacion) => {
      const nuevo = registrarAccionGamificacion(estudiante, accion);
      setEstado(nuevo);
      return nuevo;
    },
    [estudiante]
  );

  // Al cambiar de modo o desmontar la vista del modo, si hubo actividad y aún no se ha premiado el cierre,
  // entrega las estrellas acumuladas al finalizar de usar el modo.
  useEffect(() => {
    mensajesProcesadosRef.current.clear();
    inicializadoMensajesRef.current = false;
    resumenSesionRef.current = crearResumenVacio();
    sesionPremiadaRef.current = false;

    const modoDeEstaSesion = modoActivo;
    const estudianteDeEstaSesion = estudiante;

    return () => {
      if (!modoDeEstaSesion || sesionPremiadaRef.current) return;
      const r = resumenSesionRef.current;
      const huboActividad =
        r.turnosTotales > 0 || r.intentosIcfes > 0 || r.verificacionesExternas > 0;
      if (huboActividad) {
        sesionPremiadaRef.current = true;
        registrarAccionGamificacion(estudianteDeEstaSesion, {
          tipo: 'cierre_sesion',
          modo: modoDeEstaSesion,
          resumen: { ...r, conReflexion: false },
        });
      }
    };
  }, [estudiante, modoActivo]);

  // Analiza un mensaje enviado en el chat y acumula su progreso para otorgar estrellas al terminar el modo
  const evaluarInteraccionChat = useCallback(
    ({ texto, modo, tieneArchivos = false, turnosEnSesion = 1 }: InteraccionChatPayload) => {
      const limpio = (texto || '').trim();
      if (!limpio && !tieneArchivos) return leerProgreso(estudiante);

      // Si viene de «Lo verifiqué por fuera», se contabiliza en registrarVerificacionExterna
      if (limpio.startsWith('[Verificación externa]')) {
        return leerProgreso(estudiante);
      }

      const analisis = analizarTextoInteraccionChat(limpio, modo, tieneArchivos, turnosEnSesion);
      const r = resumenSesionRef.current;
      r.turnosTotales += 1;
      if (tieneArchivos) {
        r.archivosClaseSubidos += 1;
      }
      if (analisis.esDesafioCritico) {
        r.desafiosPensamientoCritico += 1;
      } else if (analisis.esPreguntaAnalitica) {
        r.preguntasAnaliticas += 1;
      }
      if (analisis.palabras >= 8 || analisis.esPreguntaAnalitica) {
        r.mensajesArgumentados += 1;
      }
      return leerProgreso(estudiante);
    },
    [estudiante]
  );

  // Observa los mensajes nuevos del estudiante en el hilo de conversación (sin lanzar avisos en cada turno)
  useEffect(() => {
    if (!mensajes) return;

    const mensajesUsuario = mensajes.filter((m) => m.role === 'user');

    // En el primer render del modo, marcamos los mensajes previos (p. ej. conversación reanudada o transferida)
    if (!inicializadoMensajesRef.current) {
      inicializadoMensajesRef.current = true;
      mensajesUsuario.forEach((m) => mensajesProcesadosRef.current.add(m.id));
      return;
    }

    mensajesUsuario.forEach((msg, idx) => {
      if (mensajesProcesadosRef.current.has(msg.id)) return;
      mensajesProcesadosRef.current.add(msg.id);

      // Si es una respuesta de opción múltiple en ICFES, se registra cuando llega la clave del servidor
      if (msg.icfes?.accion === 'responder' || msg.icfes?.accion === 'pista') return;

      const tieneArchivos =
        (Array.isArray(msg.archivos) && msg.archivos.length > 0) || Boolean(msg.archivo);
      evaluarInteraccionChat({
        texto: msg.text,
        modo: modoActivo || 'socratico',
        tieneArchivos,
        turnosEnSesion: idx + 1,
      });
    });
  }, [mensajes, modoActivo, evaluarInteraccionChat]);

  // Escucha de eventos personalizados disparados desde cualquier parte de la aplicación
  useEffect(() => {
    const manejarEventoInteraccion = (e: Event) => {
      const ev = e as CustomEvent<AccionGamificacion>;
      if (ev.detail) {
        ejecutarAccion(ev.detail);
      }
    };
    window.addEventListener('interlocutor:accion-gamificacion', manejarEventoInteraccion);
    return () =>
      window.removeEventListener('interlocutor:accion-gamificacion', manejarEventoInteraccion);
  }, [ejecutarAccion]);

  const registrarPreguntaAnalitica = useCallback(
    (_modo: string, _preguntaTexto: string) => {
      resumenSesionRef.current.preguntasAnaliticas += 1;
      resumenSesionRef.current.mensajesArgumentados += 1;
      return leerProgreso(estudiante);
    },
    [estudiante]
  );

  const registrarDesafioPensamientoCritico = useCallback(
    (_modo: string, _motivo?: string) => {
      resumenSesionRef.current.desafiosPensamientoCritico += 1;
      return leerProgreso(estudiante);
    },
    [estudiante]
  );

  const registrarVerificacionExterna = useCallback(
    (_modo: string) => {
      resumenSesionRef.current.verificacionesExternas += 1;
      return leerProgreso(estudiante);
    },
    [estudiante]
  );

  const registrarRespuestaIcfes = useCallback(
    (correcta: boolean, _area: string) => {
      resumenSesionRef.current.intentosIcfes += 1;
      if (correcta) {
        resumenSesionRef.current.aciertosIcfes += 1;
      }
      return leerProgreso(estudiante);
    },
    [estudiante]
  );

  const registrarCierreSesion = useCallback(
    (modo: string, conReflexion = true) => {
      if (sesionPremiadaRef.current) {
        return leerProgreso(estudiante);
      }
      sesionPremiadaRef.current = true;
      const r = resumenSesionRef.current;
      const nuevo = ejecutarAccion({
        tipo: 'cierre_sesion',
        modo,
        resumen: {
          ...r,
          conReflexion,
        },
      });
      resumenSesionRef.current = crearResumenVacio();
      return nuevo;
    },
    [estudiante, ejecutarAccion]
  );

  const registrarDesafioRelampago = useCallback(
    (aciertos: number, total: number, categoria?: string) => {
      return ejecutarAccion({
        tipo: 'desafio_relampago',
        aciertos,
        total,
        categoria,
      });
    },
    [ejecutarAccion]
  );

  const canjearRecompensa = useCallback(
    (itemId: string) => {
      const res = canjearRecompensaTienda(estudiante, itemId);
      setEstado(res.estado);
      return res;
    },
    [estudiante]
  );

  const alternarSonido = useCallback(() => {
    const nuevo = alternarSonidoGamificacion(estudiante);
    setEstado(nuevo);
    return nuevo;
  }, [estudiante]);

  const usarPista = useCallback(() => {
    const ok = usarComodinPista(estudiante);
    if (ok) {
      setEstado(leerProgreso(estudiante));
    }
    return ok;
  }, [estudiante]);

  const infoNivel = calcularNivel(estado.xp);

  return {
    estado,
    infoNivel,
    ejecutarAccion,
    evaluarInteraccionChat,
    registrarPreguntaAnalitica,
    registrarDesafioPensamientoCritico,
    registrarVerificacionExterna,
    registrarRespuestaIcfes,
    registrarCierreSesion,
    registrarDesafioRelampago,
    canjearRecompensa,
    alternarSonido,
    usarPista,
  };
}

export default useGamificacion;
