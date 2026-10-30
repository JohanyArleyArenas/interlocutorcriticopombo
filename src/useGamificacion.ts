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

/**
 * Hook `useGamificacion`
 * Escucha las interacciones del chat (tanto por observación reactiva del hilo de mensajes
 * como mediante eventos y llamadas directas) y otorga estrellas automáticamente cuando
 * el estudiante formula preguntas analíticas, argumenta con criterio, verifica fuentes
 * externas o completa desafíos de pensamiento crítico.
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

  // Reiniciar registro de IDs vistos cuando cambia el modo o el estudiante
  useEffect(() => {
    mensajesProcesadosRef.current.clear();
  }, [estudiante, modoActivo]);

  const ejecutarAccion = useCallback(
    (accion: AccionGamificacion) => {
      const nuevo = registrarAccionGamificacion(estudiante, accion);
      setEstado(nuevo);
      return nuevo;
    },
    [estudiante]
  );

  // Analiza un mensaje enviado en el chat y otorga estrellas automáticamente si cumple criterios
  const evaluarInteraccionChat = useCallback(
    ({ texto, modo, tieneArchivos = false, turnosEnSesion = 1 }: InteraccionChatPayload) => {
      const limpio = (texto || '').trim();
      // Si viene de «Lo verifiqué por fuera», su acción específica ya se procesa como verificación externa
      if (limpio.startsWith('[Verificación externa]')) {
        return leerProgreso(estudiante);
      }

      const analisis = analizarTextoInteraccionChat(limpio, modo, tieneArchivos, turnosEnSesion);
      if (
        analisis.palabras >= 8 ||
        analisis.esPreguntaAnalitica ||
        analisis.esDesafioCritico ||
        tieneArchivos
      ) {
        return ejecutarAccion({
          tipo: 'mensaje_argumentado',
          modo,
          palabras: analisis.palabras,
          tieneArchivos,
          esPreguntaAnalitica: analisis.esPreguntaAnalitica,
          esDesafioCritico: analisis.esDesafioCritico,
          motivoCritico: analisis.motivoCritico,
        });
      }
      return leerProgreso(estudiante);
    },
    [estudiante, ejecutarAccion]
  );

  // Escucha automática de mensajes nuevos del estudiante en el hilo de conversación
  useEffect(() => {
    if (!mensajes || mensajes.length === 0) return;

    const mensajesUsuario = mensajes.filter((m) => m.role === 'user');
    if (mensajesUsuario.length === 0) return;

    // En la primera carga, marcamos los mensajes iniciales transferidos como ya vistos
    if (mensajesProcesadosRef.current.size === 0 && mensajesUsuario.length > 1) {
      mensajesUsuario.slice(0, -1).forEach((m) => mensajesProcesadosRef.current.add(m.id));
    }

    mensajesUsuario.forEach((msg, idx) => {
      if (mensajesProcesadosRef.current.has(msg.id)) return;
      mensajesProcesadosRef.current.add(msg.id);

      // Si es una respuesta de opción múltiple en ICFES, se evalúa cuando llega la clave del servidor
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
    (modo: string, preguntaTexto: string) => {
      const palabras = (preguntaTexto || '').trim().split(/\s+/).filter(Boolean).length;
      return ejecutarAccion({
        tipo: 'pregunta_analitica',
        modo,
        palabras,
        pregunta: preguntaTexto,
      });
    },
    [ejecutarAccion]
  );

  const registrarDesafioPensamientoCritico = useCallback(
    (modo: string, motivo?: string) => {
      return ejecutarAccion({
        tipo: 'desafio_pensamiento_critico',
        modo,
        motivo,
      });
    },
    [ejecutarAccion]
  );

  const registrarVerificacionExterna = useCallback(
    (modo: string) => {
      return ejecutarAccion({
        tipo: 'verificacion_externa',
        modo,
      });
    },
    [ejecutarAccion]
  );

  const registrarRespuestaIcfes = useCallback(
    (correcta: boolean, area: string) => {
      return ejecutarAccion({
        tipo: 'respuesta_icfes',
        correcta,
        area,
      });
    },
    [ejecutarAccion]
  );

  const registrarCierreSesion = useCallback(
    (modo: string) => {
      return ejecutarAccion({
        tipo: 'cierre_sesion',
        modo,
      });
    },
    [ejecutarAccion]
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
