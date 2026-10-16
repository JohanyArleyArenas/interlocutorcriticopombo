import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { AGENTE } from './src/parametros.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Up limit to 20MB for file uploads
app.use(express.json({ limit: '20mb' }));

// Shared Gemini AI instance on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ChatArchivo {
  nombre: string;
  mimeType: string;
  data?: string;   // base64
  texto?: string;  // extracted text for docx, txt, md
}

export interface ChatMessagePayload {
  role: 'user' | 'model';
  text: string;
  archivo?: ChatArchivo;
}

// Model cascade strictly per user instructions
const CANDIDATE_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const SEARCH_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];

app.post('/api/chat', async (req, res) => {
  try {
    const { modeKey, messages } = req.body as {
      modeKey?: string;
      messages?: ChatMessagePayload[];
    };

    if (!modeKey || !AGENTE.modos[modeKey]) {
      return res.status(400).json({ error: 'Modo no válido o no especificado.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'El historial de mensajes está vacío.' });
    }

    const modo = AGENTE.modos[modeKey];

    // Truncate history: keep only last 12 messages, but preserve student's first message if it has an attachment
    let slicedMessages = [...messages];
    if (slicedMessages.length > 12) {
      const firstMsg = slicedMessages[0];
      const firstHasAttachment = Boolean(firstMsg && firstMsg.archivo);
      if (firstHasAttachment) {
        slicedMessages = [firstMsg, ...slicedMessages.slice(-11)];
      } else {
        slicedMessages = slicedMessages.slice(-12);
      }
    }

    // Format current date in America/Bogota in Spanish
    const fechaHoy = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeZone: 'America/Bogota',
    }).format(new Date());

    const fechaLinea = modo.busqueda
      ? `FECHA DE HOY: ${fechaHoy}. Usa la búsqueda de Google para obtener información actualizada.`
      : `FECHA DE HOY: ${fechaHoy}.`;

    const systemInstruction = `${AGENTE.parametros}

${fechaLinea}

MODO ACTUAL: ${modo.titulo}
${modo.instrucciones}

El estudiante ya vio este mensaje inicial tuyo: ${modo.saludo}`;

    // Convert messages to Gemini API format
    const contents = slicedMessages.map((msg) => {
      const parts: any[] = [];

      if (msg.archivo) {
        const { mimeType, data, texto, nombre } = msg.archivo;
        const cleanBase64 = data ? data.replace(/^data:[^;]+;base64,/, '') : '';

        // If it is an image or PDF, send as inlineData
        if (cleanBase64 && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
          parts.push({
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          });
        }

        // If it is text or docx extracted text
        if (texto) {
          parts.push({
            text: `[Archivo adjunto: ${nombre}]\n${texto}`,
          });
        }
      }

      if (msg.text && msg.text.trim()) {
        parts.push({ text: msg.text });
      }

      // If parts is empty (e.g. file with no text and no data yet), fallback
      if (parts.length === 0) {
        parts.push({ text: '(Adjunto de archivo)' });
      }

      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts,
      };
    });

    const config: any = {
      systemInstruction,
      temperature: typeof modo.temperatura === 'number' ? modo.temperatura : 0.7,
      maxOutputTokens: typeof modo.maxTokens === 'number' ? modo.maxTokens : 1000,
    };

    if (modo.busqueda) {
      config.tools = [{ googleSearch: {} }];
    }

    const modelsToTry = modo.busqueda ? SEARCH_MODELS : CANDIDATE_MODELS;

    let lastError: any = null;
    let replyText: string | null = null;
    let fuentes: Array<{ titulo: string; url: string }> = [];
    let had429 = false;

    // Attempt models with 429/503 fallback, 1.5s backoff, and 404 immediate skip
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        if (response.text) {
          replyText = response.text;

          // Extract grounding sources if available
          const candidate = response.candidates?.[0];
          const chunks = (candidate as any)?.groundingMetadata?.groundingChunks;
          if (Array.isArray(chunks)) {
            const fuentesMap = new Map<string, string>();
            for (const chunk of chunks) {
              const url = chunk.web?.uri;
              const titulo = chunk.web?.title || url;
              if (url && !fuentesMap.has(url)) {
                fuentesMap.set(url, titulo);
              }
            }
            fuentes = Array.from(fuentesMap.entries())
              .slice(0, 8)
              .map(([url, titulo]) => ({ titulo, url }));
          }

          break; // Stop immediately once first model responds
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.statusCode || (typeof err?.message === 'string' && err.message.includes('429') ? 429 : (typeof err?.message === 'string' && err.message.includes('404') ? 404 : 500));

        // Diagnóstico de errores: console.log del mensaje completo del error (err.message y err.status)
        console.log(`[Error en modelo ${model}] err.status: ${status}, err.message: ${err?.message}`);

        if (status === 429 || (typeof err?.message === 'string' && err.message.includes('429'))) {
          had429 = true;
        }

        // Si un modelo responde 404 (no existe), pasa al siguiente sin esperar
        if (status === 404 || (typeof err?.message === 'string' && err.message.includes('404'))) {
          console.log(`Modelo ${model} no existe (404). Pasando al siguiente modelo sin esperar...`);
          continue;
        }

        const isOverload = status === 429 || status === 503 || (typeof err?.message === 'string' && (err.message.includes('429') || err.message.includes('503')));

        // If error is NOT 429 or 503, do NOT retry
        if (!isOverload) {
          console.error(`Error no recuperable con modelo ${model}:`, err?.message || err);
          throw err;
        }

        // If there is another model to try, wait 1.5s backoff
        if (i < modelsToTry.length - 1) {
          console.log('Esperando 1,5 s antes de cambiar de modelo tras error 429/503...');
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    // Si todos fallan por 429 en un modo con búsqueda, haz un último intento SIN la herramienta googleSearch con 'gemini-flash-latest'
    if (!replyText && modo.busqueda && (had429 || lastError?.status === 429 || (typeof lastError?.message === 'string' && lastError.message.includes('429')))) {
      console.log('Todos los modelos con búsqueda fallaron por 429. Intentando fallback SIN googleSearch...');
      const fallbackModels = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
      for (const fbModel of fallbackModels) {
        try {
          const fallbackConfig: any = {
            systemInstruction: systemInstruction + "\n\nIMPORTANTE: en esta respuesta NO tienes acceso a la búsqueda en Google. No digas que buscaste ni que consultaste fuentes en línea. Responde solo con lo que sabes, aclara que puede estar desactualizado y, si es una verificación, da un veredicto provisional o 'Sin evidencia suficiente'.",
            temperature: typeof modo.temperatura === 'number' ? modo.temperatura : 0.7,
            maxOutputTokens: typeof modo.maxTokens === 'number' ? modo.maxTokens : 1000,
          };

          const fallbackResponse = await ai.models.generateContent({
            model: fbModel,
            contents,
            config: fallbackConfig,
          });

          if (fallbackResponse.text) {
            replyText = `_Aviso: la búsqueda en Google no estuvo disponible en este momento; verifica las fechas de lo que sigue._\n\n${fallbackResponse.text}`;
            fuentes = [];
            break;
          }
        } catch (fallbackErr: any) {
          lastError = fallbackErr;
          const fallbackStatus = fallbackErr?.status || fallbackErr?.statusCode || (typeof fallbackErr?.message === 'string' && fallbackErr.message.includes('429') ? 429 : 500);
          console.log(`[Error en fallback ${fbModel}] err.status: ${fallbackStatus}, err.message: ${fallbackErr?.message}`);
        }
      }
    }

    if (replyText) {
      return res.json({ reply: replyText, fuentes });
    }

    const is429 = lastError?.status === 429 || (typeof lastError?.message === 'string' && lastError.message.includes('429'));
    if (is429) {
      const cupoDiario = typeof lastError?.message === 'string' && /free_tier|retry in/i.test(lastError.message);
      return res.status(429).json({
        error: cupoDiario
          ? 'Se agotó el cupo gratuito de consultas de hoy. El docente debe activar la facturación en Google AI Studio o esperar a que se renueve el cupo.'
          : 'Hay muchas consultas en este momento. Espera unos segundos y vuelve a intentarlo.',
      });
    }

    return res.status(503).json({
      error: 'El servicio está experimentando alta demanda. Por favor reintenta en unos instantes.',
      details: lastError?.message || 'Servicio no disponible',
    });
  } catch (error: any) {
    console.error('Error al procesar solicitud de chat:', error);
    return res.status(500).json({
      error: 'Hubo un inconveniente al conectar con el interlocutor. Por favor intenta de nuevo.',
      details: error?.message || 'Error interno',
    });
  }
});

// Endpoint to fetch public parameters and modes configuration
app.get('/api/parametros', (_req, res) => {
  res.json({
    nombre: AGENTE.nombre,
    subtitulo: AGENTE.subtitulo,
    version: AGENTE.version,
    modos: Object.entries(AGENTE.modos).map(([key, modo]) => ({
      key,
      titulo: modo.titulo,
      descripcion: modo.descripcion,
      saludo: modo.saludo,
      busqueda: Boolean(modo.busqueda),
      adjuntos: Boolean(modo.adjuntos),
    })),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Interlocutor Crítico escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer();
