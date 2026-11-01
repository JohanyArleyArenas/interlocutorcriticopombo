# Plan de Implementación: Reparación de Respuestas de IA y Limpieza de Tarjetas de Modos

## 1. Diagnóstico y Solución para la Llave y Respuestas de la IA
Actualmente, el servidor no entrega respuestas de forma confiable por tres motivos combinados:
- **Versión antigua del SDK (`@google/genai` `^2.4.0`)**: Requiere actualizarse a `>= 2.25.0` para soportar los modelos y configuraciones actuales.
- **Nombre de modelo de respaldo no válido (`gemini-flash-lite-latest`) y bloqueo en cascada**: Cuando el primer modelo tarda más de 8,5 segundos o falla con `thinkingConfig`, el servidor activa una pausa de 2 minutos y salta a `gemini-flash-lite-latest` (que devuelve error `404 Not Found`), dejando al chat sin respuesta.
- **Lectura estática de la llave**: El cliente `GoogleGenAI` se instancia una sola vez al arrancar el proceso; si la variable de entorno `GEMINI_API_KEY` se inyecta o actualiza después, no se toma el valor vigente.

### Cambios en Backend (`package.json` y `server.ts`)
1. **Actualizar `@google/genai`**: Instalar la versión más reciente (`>= 2.25.0`).
2. **Lectura dinámica de la llave de API**: Crear un helper `obtenerClienteIA()` en `server.ts` que lea `process.env.GEMINI_API_KEY || process.env.API_KEY` en cada solicitud junto con `httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }`.
3. **Modelos oficiales y cascada resiliente**:
   - Actualizar `CANDIDATE_MODELS` y la lista de intentos a `['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite']`.
   - Ampliar el tiempo de espera del primer fragmento a `25s` (y `60s` total) para evitar abortar respuestas válidas en preguntas largas o con archivos/PDFs del ICFES.
   - Si una llamada falla por configuración de `thinkingConfig` o `temperature`, reintentar automáticamente con la configuración limpia estándar antes de cambiar de modelo.

---

## 2. Limpieza de Sugerencias en las Tarjetas de Modos (`src/components/ModosGrid.tsx`)
1. **Eliminar los sub-botones de las tarjetas externas**:
   - Retirar el bloque de accesos rápidos (`SUB_BOTONES_POR_MODO` y la función `entrarConRutaPreseleccionada`) de cada tarjeta en `ModosGrid.tsx`, de modo que cada tarjeta muestre únicamente su ícono, etiqueta de capacidades, título, descripción y pie de progreso/recompensa.
   - Actualizar el subtítulo de la sección de `"Elige una estación para trabajar o entra directamente a un subtema."` a `"Elige una estación de trabajo para iniciar tu sesión."`.
2. **Conservar las opciones dentro de cada modo**:
   - Mantener intactos `RutaGuiadaModo.tsx` y `SelectorArea` (en Entrenador Saber 11) dentro de `ChatView.tsx`, para que los estudiantes elijan los subtemas y enfoques una vez ingresen al modo.
