import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Upload,
  BookOpen,
  Search,
  ShieldAlert,
  Scale,
  FileText,
  Sigma,
  Atom,
  FlaskConical,
  Compass,
  Layers,
  Target,
  Lightbulb,
  RotateCcw,
  Send,
  PenTool,
  Eye,
  MessageSquareQuote,
} from 'lucide-react';

export interface OpcionPasoRuta {
  id: string;
  titulo: string;
  subtitulo: string;
  etiqueta?: string;
  icono?: string;
  promptFragmento: string;
  temasSugeridos?: {
    id: string;
    label: string;
    promptCompleto: string;
  }[];
}

interface ConfigRutaModo {
  tipo: 'aprendizaje' | 'revision' | 'dialogo';
  insignia: string;
  tituloRuta: string;
  subtituloRuta: string;
  recompensaTexto: string;
  tituloPaso1: string;
  opcionesPaso1: OpcionPasoRuta[];
  tituloPaso2: string;
  opcionesPaso2: {
    id: string;
    titulo: string;
    descripcion: string;
    instruccionExtra: string;
    recompensa?: string;
  }[];
  placeholderFinal: string;
}

export const CATALOGO_RUTAS_MODO: Record<string, ConfigRutaModo> = {
  tutor: {
    tipo: 'aprendizaje',
    insignia: 'Laboratorio de Aprendizaje Paso a Paso',
    tituloRuta: 'Configura tu sesión de tutoría con botones',
    subtituloRuta: 'Elige la materia, el método de aprendizaje y el tema para que el tutor te guíe paso a paso sin hacerte la tarea.',
    recompensaTexto: '+2 ⭐ al practicar con ejemplos de clase o resolver paso a paso',
    tituloPaso1: '1. ¿Qué materia vas a entrenar hoy?',
    opcionesPaso1: [
      {
        id: 'matematicas',
        titulo: 'Matemáticas',
        subtitulo: 'Álgebra, funciones, trigonometría, geometría, cálculo y estadística',
        icono: 'sigma',
        promptFragmento: 'Materia: Matemáticas.',
        temasSugeridos: [
          {
            id: 'mat-ecuaciones',
            label: 'Despeje de ecuaciones y sistemas lineales/cuadráticos',
            promptCompleto:
              'Necesito entrenamiento en Matemáticas sobre despeje de ecuaciones y sistemas. Primero pregúntame qué ejercicio tengo o ponme uno de diagnóstico sencillo para ver cómo planteo cada paso.',
          },
          {
            id: 'mat-funciones',
            label: 'Funciones, gráficas, dominio y rango',
            promptCompleto:
              'Quiero comprender a fondo Funciones (dominio, rango y lectura de gráficas) en Matemáticas. Explícame la idea clave con un ejemplo visual sencillo y hazme una pregunta para comprobar si la entendí.',
          },
          {
            id: 'mat-trigo',
            label: 'Razones e identidades trigonométricas',
            promptCompleto:
              'Vamos a practicar Trigonometría (razones trigonométricas, teorema del seno/coseno o identidades). Guíame paso a paso para identificar qué datos tengo y qué relación usar.',
          },
          {
            id: 'mat-calculo',
            label: 'Límites, derivadas y razón de cambio',
            promptCompleto:
              'Quiero entrenar Cálculo (límites o derivadas). Antes de usar fórmulas de memoria, ayúdame a entender qué significa geométricamente y luego resolvamos un ejercicio paso a paso.',
          },
        ],
      },
      {
        id: 'fisica',
        titulo: 'Física',
        subtitulo: 'Cinemática, leyes de Newton, energía, ondas y electricidad',
        icono: 'atom',
        promptFragmento: 'Materia: Física.',
        temasSugeridos: [
          {
            id: 'fis-cinematica',
            label: 'Movimiento (MRU, MRUA, caída libre y parabólico)',
            promptCompleto:
              'Quiero practicar Cinemática en Física. Ayúdame primero a identificar las variables conocidas, las unidades en el SI y el sistema de referencia antes de elegir la ecuación.',
          },
          {
            id: 'fis-newton',
            label: 'Leyes de Newton y diagramas de cuerpo libre',
            promptCompleto:
              'Necesito entender cómo armar un diagrama de cuerpo libre y aplicar las Leyes de Newton (fuerza neta, tensión, normal y rozamiento) paso a paso.',
          },
          {
            id: 'fis-energia',
            label: 'Trabajo, potencia y conservación de la energía',
            promptCompleto:
              'Vamos a entrenar Trabajo y Conservación de la Energía Mecánica. Guíame con preguntas para identificar qué energías hay al inicio y al final del movimiento.',
          },
          {
            id: 'fis-circuitos',
            label: 'Circuitos eléctricos y Ley de Ohm',
            promptCompleto:
              'Quiero aprender a analizar circuitos eléctricos (serie, paralelo y Ley de Ohm) paso a paso sin confundir voltaje, corriente y resistencia.',
          },
        ],
      },
      {
        id: 'quimica',
        titulo: 'Química',
        subtitulo: 'Enlaces, reacciones, estequiometría, gases, soluciones y orgánica',
        icono: 'flask',
        promptFragmento: 'Materia: Química.',
        temasSugeridos: [
          {
            id: 'qui-estequiometria',
            label: 'Balanceo de ecuaciones y estequiometría (moles y gramos)',
            promptCompleto:
              'Quiero entrenar Balanceo de ecuaciones y Estequiometría (conversión gramos-moles y reactivo límite). Guíame paso a paso verificando primero si la ecuación está balanceada.',
          },
          {
            id: 'qui-enlaces',
            label: 'Tabla periódica, configuración electrónica y enlaces',
            promptCompleto:
              'Ayúdame a comprender cómo usar la tabla periódica y la electronegatividad para deducir si un enlace es iónico, covalente polar o apolar.',
          },
          {
            id: 'qui-soluciones',
            label: 'Soluciones, concentración (Molaridad, % m/v) y pH',
            promptCompleto:
              'Vamos a practicar problemas de Soluciones químicas y pH. Pregúntame primero cuál es el soluto y cuál es el solvente para plantear bien la proporción.',
          },
          {
            id: 'qui-organica',
            label: 'Química orgánica: grupos funcionales y nomenclatura IUPAC',
            promptCompleto:
              'Quiero entrenar Química Orgánica (identificar la cadena principal, enlaces dobles/triples y grupos funcionales según IUPAC) con ejercicios graduales.',
          },
        ],
      },
    ],
    tituloPaso2: '2. ¿Cómo quieres que trabajemos este tema?',
    opcionesPaso2: [
      {
        id: 'desde-cero',
        titulo: 'Aprender desde cero',
        descripcion: 'Explicación gradual con ejemplos sencillos.',
        instruccionExtra:
          'Modalidad elegida: Aprender desde cero. Explícame el concepto fundamental de forma sencilla, dame un ejemplo corto y hazme una pregunta breve antes de avanzar.',
      },
      {
        id: 'resolver-ejercicio',
        titulo: 'Resolver paso a paso',
        descripcion: 'Guía con pistas sin entregarte el resultado.',
        instruccionExtra:
          'Modalidad elegida: Resolver un ejercicio paso a paso. No me des la solución completa de una vez; pregúntame qué datos tengo y cuál creo que es el primer paso.',
      },
      {
        id: 'cazar-error',
        titulo: 'Revisar mi procedimiento',
        descripcion: 'Encuentra en qué línea está el fallo.',
        instruccionExtra:
          'Modalidad elegida: Revisión de mi procedimiento. Voy a mostrarte lo que hice para que me des pistas sobre en qué paso exacto está el error de signo, despeje o concepto.',
      },
      {
        id: 'metodo-profe',
        titulo: 'Seguir el método de clase',
        descripcion: 'Usa la misma notación de tu cuaderno.',
        instruccionExtra:
          'Modalidad elegida: Seguir el método de clase de mi profesor(a). Respetemos los mismos pasos, símbolos y estructura de mis apuntes.',
      },
    ],
    placeholderFinal: 'Escribe o pega aquí tu ejercicio, o usa uno de los botones de abajo...',
  },

  explorar: {
    tipo: 'aprendizaje',
    insignia: 'Mapa Interactivo de Exploración',
    tituloRuta: 'Arma tu ruta de investigación por botones',
    subtituloRuta: 'Selecciona el área y el lente crítico para descubrir causas, posturas opuestas y conexiones con nuestro contexto.',
    recompensaTexto: '+1 ⭐ por conectar causas y contrastar perspectivas',
    tituloPaso1: '1. ¿Qué campo quieres explorar hoy?',
    opcionesPaso1: [
      {
        id: 'sociales-colombia',
        titulo: 'Sociedad, Historia y Territorio',
        subtitulo: 'Colombia, Santander, economía, ciudadanía y conflictos contemporáneos',
        icono: 'compass',
        promptFragmento: 'Área de exploración: Ciencias Sociales, Historia y contexto colombiano.',
        temasSugeridos: [
          {
            id: 'exp-agua-santander',
            label: 'Agua, páramos y desarrollo económico en Santander',
            promptCompleto:
              'Quiero explorar las tensiones entre la protección de los páramos y fuentes hídricas en Santander frente a las actividades económicas. Muéstrame los actores, sus argumentos más fuertes y qué preguntas siguen abiertas.',
          },
          {
            id: 'exp-turismo-sangil',
            label: 'Impacto del turismo y sostenibilidad en San Gil y la provincia Guanentá',
            promptCompleto:
              'Analicemos desde múltiples ángulos el crecimiento del turismo en San Gil y la provincia de Guanentá: beneficios económicos, retos ambientales, servicios públicos y calidad de vida.',
          },
          {
            id: 'exp-paz-memoria',
            label: 'Memoria histórica y retos de convivencia ciudadana',
            promptCompleto:
              'Exploremos por qué existen distintas miradas sobre cómo construir memoria histórica en Colombia y qué aporta cada perspectiva.',
          },
        ],
      },
      {
        id: 'ciencias-ambiente',
        titulo: 'Ciencia, Salud y Medio Ambiente',
        subtitulo: 'Biodiversidad, cambio climático, biotecnología y energía',
        icono: 'flask',
        promptFragmento: 'Área de exploración: Ciencias Naturales, Salud y Medio Ambiente.',
        temasSugeridos: [
          {
            id: 'exp-transicion',
            label: 'Transición energética: alcances reales y dilemas en América Latina',
            promptCompleto:
              'Quiero explorar el debate sobre la transición hacia energías renovables en América Latina: ventajas científicas, costos económicos y retos sociales.',
          },
          {
            id: 'exp-crispr',
            label: 'Edición genética (CRISPR) y límites bioéticos',
            promptCompleto:
              'Exploremos cómo funciona la edición genética CRISPR, qué enfermedades podría curar y cuáles son los dilemas éticos más debatidos por los científicos.',
          },
        ],
      },
      {
        id: 'tecnologia-futuro',
        titulo: 'Tecnología, IA y Futuro del Trabajo',
        subtitulo: 'Algoritmos, redes sociales, privacidad y transformaciones laborales',
        icono: 'layers',
        promptFragmento: 'Área de exploración: Tecnología, Inteligencia Artificial y Sociedad.',
        temasSugeridos: [
          {
            id: 'exp-algoritmos',
            label: 'Cómo los algoritmos de recomendación moldean nuestras opiniones',
            promptCompleto:
              'Exploremos cómo funcionan las cámaras de eco y los algoritmos de atención en redes sociales, y qué estrategias existen para mantener la autonomía mental.',
          },
          {
            id: 'exp-ia-trabajo',
            label: 'Inteligencia artificial generativa y el futuro de las profesiones',
            promptCompleto:
              'Analicemos con datos y posturas contrastadas cómo está cambiando la IA el mundo laboral y qué habilidades humanas se vuelven más valiosas.',
          },
        ],
      },
      {
        id: 'literatura-filosofia',
        titulo: 'Literatura, Arte y Filosofía',
        subtitulo: 'Obras literarias, corrientes de pensamiento, estética y ética',
        icono: 'book',
        promptFragmento: 'Área de exploración: Literatura, Filosofía y Cultura.',
        temasSugeridos: [
          {
            id: 'exp-gabo-boom',
            label: 'Realismo mágico y crítica social en la literatura colombiana',
            promptCompleto:
              'Exploremos cómo la literatura colombiana transforma hechos históricos complejos en obras universales y qué debates críticos despierta.',
          },
          {
            id: 'exp-libertad',
            label: '¿Somos realmente libres al decidir? Filosofía vs. Neurociencia',
            promptCompleto:
              'Comparemos qué dicen la filosofía clásica y la neurociencia moderna sobre el libre albedrío y la responsabilidad de nuestras decisiones.',
          },
        ],
      },
    ],
    tituloPaso2: '2. Elige el lente con el que quieres explorar',
    opcionesPaso2: [
      {
        id: 'mapa-360',
        titulo: 'Panorama general',
        descripcion: 'Causas, actores principales y consecuencias.',
        instruccionExtra:
          'Lente elegido: Mapa 360°. Organiza el panorama mostrando causas principales, actores involucrados y consecuencias a corto y largo plazo.',
      },
      {
        id: 'choque-posturas',
        titulo: 'Contrastar posturas',
        descripcion: 'Argumentos y evidencias de cada posición.',
        instruccionExtra:
          'Lente elegido: Contraste de posturas. Muéstrame las dos o tres visiones más sólidas que chocan en este tema y en qué evidencia se apoya cada una.',
      },
      {
        id: 'aterrizaje-local',
        titulo: 'Contexto regional',
        descripcion: 'Relación del tema con Colombia y Santander.',
        instruccionExtra:
          'Lente elegido: Conexión con el entorno. Ayúdame a pensar cómo se relaciona este tema con nuestra realidad en Colombia y Santander sin inventar datos locales no verificados.',
      },
      {
        id: 'preguntas-investigacion',
        titulo: 'Delimitar pregunta',
        descripcion: 'Enfoques posibles para exposición o ensayo.',
        instruccionExtra:
          'Lente elegido: Laboratorio de preguntas. Propónme 3 ángulos de investigación exigentes y ayúdame a elegir el más potente.',
      },
    ],
    placeholderFinal: 'Escribe el tema que quieres explorar con este lente...',
  },

  escrito: {
    tipo: 'revision',
    insignia: 'Estación de Revisión y Edición por Capas',
    tituloRuta: 'Revisa tu texto paso a paso por estaciones',
    subtituloRuta: 'En lugar de una corrección plana, elige qué tipo de texto tienes y qué capa quieres diagnosticar primero.',
    recompensaTexto: '+2 ⭐ al subir tu borrador y mejorarlo con criterio propio',
    tituloPaso1: '1. ¿Qué tipo de escrito vamos a revisar?',
    opcionesPaso1: [
      {
        id: 'ensayo-argumentativo',
        titulo: 'Ensayo o texto argumentativo',
        subtitulo: 'Tesis central, argumentos de respaldo, contraargumentos y conclusión',
        icono: 'pen',
        promptFragmento: 'Tipo de texto: Ensayo o texto argumentativo académico.',
        temasSugeridos: [
          {
            id: 'esc-diagnostico-ensayo',
            label: 'Ya tengo un borrador: quiero diagnóstico de tesis y argumentos',
            promptCompleto:
              'Voy a compartirte el borrador de mi ensayo argumentativo. Primero identifica cuál entiendes que es mi tesis central, señala qué argumento tiene más fuerza y cuál necesita más evidencia, sin reescribirme el texto.',
          },
          {
            id: 'esc-intro-ensayo',
            label: 'Solo tengo el tema: ayúdame a destrabar el primer párrafo y la tesis',
            promptCompleto:
              'Necesito escribir un ensayo argumentativo pero me cuesta arrancar el primer párrafo. Hazme 3 preguntas puntuales sobre mi postura para ayudarme a redactar mi propia tesis.',
          },
        ],
      },
      {
        id: 'informe-laboratorio',
        titulo: 'Informe de laboratorio o investigación',
        subtitulo: 'Pregunta problema, hipótesis, metodología, análisis de resultados y conclusiones',
        icono: 'flask',
        promptFragmento: 'Tipo de texto: Informe de laboratorio o proyecto de investigación.',
        temasSugeridos: [
          {
            id: 'esc-resultados-lab',
            label: 'Revisar si mis conclusiones responden a los datos y a la hipótesis',
            promptCompleto:
              'Quiero revisar mi informe de laboratorio. Ayúdame a verificar si el análisis de resultados y las conclusiones están realmente conectados con la hipótesis inicial y los datos obtenidos.',
          },
        ],
      },
      {
        id: 'cronica-resena',
        titulo: 'Crónica, reseña crítica o texto narrativo',
        subtitulo: 'Voz propia, ritmo de lectura, imágenes sensoriales y estructura narrativa',
        icono: 'book',
        promptFragmento: 'Tipo de texto: Crónica, reseña crítica o texto narrativo.',
        temasSugeridos: [
          {
            id: 'esc-ritmo-cronica',
            label: 'Evaluar la fuerza del inicio, las descripciones y el cierre',
            promptCompleto:
              'Voy a mostrarte mi crónica o reseña. Revisa si el inicio atrapa al lector, dónde se siente repetitivo el ritmo y qué preguntas me harías para enriquecer los detalles.',
          },
        ],
      },
      {
        id: 'guion-exposicion',
        titulo: 'Guion para exposición oral o ponencia',
        subtitulo: 'Claridad de ideas, gancho inicial, manejo del tiempo y cierre memorable',
        icono: 'message',
        promptFragmento: 'Tipo de texto: Guion de exposición oral o discurso.',
        temasSugeridos: [
          {
            id: 'esc-exposicion',
            label: 'Revisar que mis ideas suenen claras y contundentes al hablar',
            promptCompleto:
              'Este es el borrador para mi exposición oral. Señálame qué frases son demasiado largas para decirlas en voz alta y cómo puedo ordenar mejor mis 3 ideas clave.',
          },
        ],
      },
    ],
    tituloPaso2: '2. ¿Qué estación de revisión quieres activar?',
    opcionesPaso2: [
      {
        id: 'capa-tesis',
        titulo: 'Tesis y pruebas',
        descripcion: 'Claridad de la postura y respaldo argumentativo.',
        instruccionExtra:
          'Estación de revisión activa: Fuerza de la Tesis y Argumentos. Evalúa si mi postura es clara desde el inicio y dónde hay afirmaciones sin pruebas.',
      },
      {
        id: 'capa-arquitectura',
        titulo: 'Orden y conectores',
        descripcion: 'Hilo conductor y transiciones entre párrafos.',
        instruccionExtra:
          'Estación de revisión activa: Coherencia y Conectores. Analiza cómo fluye un párrafo hacia el siguiente y señala dónde se pierde el hilo conductor.',
      },
      {
        id: 'capa-estilo',
        titulo: 'Claridad y ortografía',
        descripcion: 'Precisión léxica, puntuación y gramática.',
        instruccionExtra:
          'Estación de revisión activa: Precisión y Estilo. Señálame oraciones ambiguas, redundancias o errores de puntuación explicándome la regla para que yo mismo las corrija.',
      },
      {
        id: 'capa-integral',
        titulo: 'Revisión completa',
        descripcion: 'Balance general de estructura, fondo y forma.',
        instruccionExtra:
          'Estación de revisión activa: Diagnóstico Integral en 3 Capas (Fortalezas, Argumentación/Estructura y Claridad/Precisión), sin reescribir el texto por mí.',
      },
    ],
    placeholderFinal: 'Pega aquí tu borrador o sube el archivo con el botón de abajo...',
  },

  verificar: {
    tipo: 'revision',
    insignia: 'Central de Verificación y Contraste de Fuentes',
    tituloRuta: 'Activa el protocolo de verificación por botones',
    subtituloRuta: 'Elige qué clase de información quieres poner bajo la lupa y qué método de rastreo aplicaremos.',
    recompensaTexto: '+3 ⭐ al comprobar con fuentes externas reales',
    tituloPaso1: '1. ¿Qué necesitas verificar o contrastar hoy?',
    opcionesPaso1: [
      {
        id: 'viral-redes',
        titulo: 'Noticia o cadena viral',
        subtitulo: 'Titulares de redes, capturas o afirmaciones virales',
        icono: 'search',
        promptFragmento: 'Objeto de verificación: Afirmación viral o noticia de redes sociales.',
      },
      {
        id: 'cita-ia',
        titulo: 'Dato o fuente de una IA',
        subtitulo: 'Detectar libros, fechas o referencias inventadas',
        icono: 'shield',
        promptFragmento: 'Objeto de verificación: Respuesta, cita o referencia generada por una IA.',
      },
      {
        id: 'cifra-ciencia',
        titulo: 'Cifra o dato científico',
        subtitulo: 'Estadísticas, porcentajes o estudios de salud',
        icono: 'atom',
        promptFragmento: 'Objeto de verificación: Estadística o afirmación científica.',
      },
      {
        id: 'historia-norma',
        titulo: 'Dato histórico o legal',
        subtitulo: 'Fechas, normas constitucionales o historia regional',
        icono: 'scale',
        promptFragmento: 'Objeto de verificación: Hecho histórico, dato geográfico o norma de Colombia.',
      },
    ],
    tituloPaso2: '2. ¿Qué prueba de contraste quieres aplicar?',
    opcionesPaso2: [
      {
        id: 'rastreo-fuentes',
        titulo: 'Rastrear fuente original',
        descripcion: 'Identifica de dónde proviene el dato.',
        instruccionExtra:
          'Protocolo activo: Rastreo de fuente primaria. Usa la búsqueda web para identificar la fuente original, su fecha y su nivel de confiabilidad.',
      },
      {
        id: 'hechos-vs-opinion',
        titulo: 'Separar hechos y opiniones',
        descripcion: 'Distingue lo probado de los juicios de valor.',
        instruccionExtra:
          'Protocolo activo: Separar hechos verificables de opiniones o lenguaje emocional. Clasifica cada parte con rigor.',
      },
      {
        id: 'contexto-omitido',
        titulo: 'Revisar contexto omitido',
        descripcion: 'Analiza si falta información clave de comparación.',
        instruccionExtra:
          'Protocolo activo: Análisis de contexto omitido. Revisa qué datos de comparación faltan para entender la cifra o noticia de forma completa.',
      },
    ],
    placeholderFinal: 'Pega aquí el dato, titular, enlace o respuesta que quieres verificar...',
  },

  auditar: {
    tipo: 'revision',
    insignia: 'Laboratorio de Auditoría de Inteligencia Artificial',
    tituloRuta: 'Elige tu misión para auditar a la IA',
    subtituloRuta: 'Entrénate para no creerle a ciegas a ningún modelo: ponle trampas lógicas, caza alucinaciones y descubre sesgos.',
    recompensaTexto: '+3 ⭐ por detectar errores, contradicciones o sesgos de la IA',
    tituloPaso1: '1. ¿Qué misión de auditoría quieres lanzar?',
    opcionesPaso1: [
      {
        id: 'mision-alucinacion',
        titulo: 'Datos y referencias',
        subtitulo: 'Detectar fechas, citas o hechos inventados',
        icono: 'shield',
        promptFragmento: 'Misión de auditoría: Detección de alucinaciones y precisión factual.',
      },
      {
        id: 'mision-sesgos',
        titulo: 'Sesgos y omisiones',
        subtitulo: 'Identificar perspectivas o actores ausentes',
        icono: 'eye',
        promptFragmento: 'Misión de auditoría: Análisis de sesgos de representación y encuadre.',
      },
      {
        id: 'mision-trampa-logica',
        titulo: 'Saltos lógicos',
        subtitulo: 'Encontrar falacias o conclusiones apresuradas',
        icono: 'scale',
        promptFragmento: 'Misión de auditoría: Caza de falacias y saltos lógicos.',
      },
      {
        id: 'mision-externa',
        titulo: 'Texto de otra IA',
        subtitulo: 'Revisar una respuesta copiada de otro modelo',
        icono: 'file',
        promptFragmento: 'Misión de auditoría: Inspección crítica de un texto generado por otra IA.',
      },
    ],
    tituloPaso2: '2. ¿Cómo quieres realizar la auditoría?',
    opcionesPaso2: [
      {
        id: 'modo-cazador',
        titulo: 'Texto de prueba',
        descripcion: 'Encuentra el error oculto en un ejemplo.',
        instruccionExtra:
          'Dinámica elegida: Modo Cazador. Preséntame el texto de prueba sin revelar dónde está el fallo para que yo lo audite.',
      },
      {
        id: 'modo-forense',
        titulo: 'Analizar mi texto',
        descripcion: 'Pega una respuesta para revisarla paso a paso.',
        instruccionExtra:
          'Dinámica elegida: Modo Forense. Analicemos el texto buscando imprecisiones, generalizaciones sin pruebas y sesgos.',
      },
    ],
    placeholderFinal: 'Pega aquí la respuesta de IA a auditar o lanza uno de los retos con un clic...',
  },

  socratico: {
    tipo: 'dialogo',
    insignia: 'Ágora de Diálogo Socrático',
    tituloRuta: 'Inicia tu diálogo filosófico por botones',
    subtituloRuta: 'Elige qué clase de idea quieres examinar y el nivel de exigencia de las preguntas.',
    recompensaTexto: '+1 ⭐ por cada argumento y pregunta analítica',
    tituloPaso1: '1. ¿Qué quieres poner en cuestión hoy?',
    opcionesPaso1: [
      {
        id: 'creencia-comun',
        titulo: 'Idea cotidiana',
        subtitulo: 'Examinar frases comunes sobre tecnología, mérito o justicia',
        icono: 'message',
        promptFragmento: 'Enfoque socrático: Cuestionar una creencia común.',
      },
      {
        id: 'dilema-etico',
        titulo: 'Dilema ético',
        subtitulo: 'Analizar casos donde dos valores entran en tensión',
        icono: 'scale',
        promptFragmento: 'Enfoque socrático: Dilema ético o ciudadano.',
      },
      {
        id: 'definir-concepto',
        titulo: 'Concepto clave',
        subtitulo: 'Definir con precisión qué es verdad, justicia o pensamiento',
        icono: 'lightbulb',
        promptFragmento: 'Enfoque socrático: Definición rigurosa de un concepto.',
      },
    ],
    tituloPaso2: '2. Elige la intensidad del cuestionamiento',
    opcionesPaso2: [
      {
        id: 'socratico-gradual',
        titulo: 'Gradual',
        descripcion: 'Preguntas breves con ejemplos cercanos.',
        instruccionExtra: 'Intensidad: Gradual y cercana, usando ejemplos cotidianos.',
      },
      {
        id: 'socratico-retador',
        titulo: 'Exigente',
        descripcion: 'Contraejemplos y casos límite.',
        instruccionExtra: 'Intensidad: Retadora, usando contraejemplos exigentes y casos límite.',
      },
    ],
    placeholderFinal: 'Escribe la idea o pregunta con la que quieres abrir el diálogo...',
  },

  argumento: {
    tipo: 'dialogo',
    insignia: 'Ring de Entrenamiento Argumentativo',
    tituloRuta: 'Prepara tu defensa argumentativa por botones',
    subtituloRuta: 'Elige el terreno de tu tesis y el tipo de sparring que quieres enfrentar.',
    recompensaTexto: '+2 ⭐ por defender tu tesis con pruebas frente a objeciones',
    tituloPaso1: '1. ¿Sobre qué terreno vas a defender tu postura?',
    opcionesPaso1: [
      {
        id: 'arg-escolar',
        titulo: 'Ámbito escolar',
        subtitulo: 'Educación, tecnología en el aula y convivencia',
        icono: 'book',
        promptFragmento: 'Terreno del debate: Educación y vida escolar.',
      },
      {
        id: 'arg-sociedad',
        titulo: 'Sociedad y ciudadanía',
        subtitulo: 'Debates públicos, ambiente y contexto colombiano',
        icono: 'compass',
        promptFragmento: 'Terreno del debate: Sociedad y contexto ciudadano.',
      },
      {
        id: 'arg-ensayo',
        titulo: 'Tesis de ensayo o debate',
        subtitulo: 'Preparar una postura antes de redactar o exponer',
        icono: 'target',
        promptFragmento: 'Terreno del debate: Preparación para mesa redonda o ensayo.',
      },
    ],
    tituloPaso2: '2. ¿Qué rol quieres que asuma el Interlocutor?',
    opcionesPaso2: [
      {
        id: 'rol-entrenador',
        titulo: 'Reforzar pruebas',
        descripcion: 'Señala puntos débiles y cómo sustentarlos mejor.',
        instruccionExtra: 'Rol elegido: Entrenador de blindaje argumentativo.',
      },
      {
        id: 'rol-abogado-diablo',
        titulo: 'Postura contraria',
        descripcion: 'Plantea objeciones sólidas para probar tu tesis.',
        instruccionExtra: 'Rol elegido: Abogado del diablo con contraejemplos exigentes.',
      },
      {
        id: 'rol-caza-falacias',
        titulo: 'Revisión lógica',
        descripcion: 'Detecta generalizaciones o saltos sin evidencia.',
        instruccionExtra: 'Rol elegido: Juez detector de falacias y rigor probatorio.',
      },
    ],
    placeholderFinal: 'Escribe aquí tu postura y la razón principal con la que la defiendes...',
  },
};

const ICONO_MAPA: Record<string, React.ElementType> = {
  sigma: Sigma,
  atom: Atom,
  flask: FlaskConical,
  compass: Compass,
  layers: Layers,
  book: BookOpen,
  pen: PenTool,
  message: MessageSquareQuote,
  search: Search,
  shield: ShieldAlert,
  scale: Scale,
  eye: Eye,
  file: FileText,
  lightbulb: Lightbulb,
  target: Target,
};

interface RutaGuiadaModoProps {
  modeKey: string;
  permiteAdjuntos?: boolean;
  ejemplosClaseCount?: number;
  onPrepararPrompt: (prompt: string) => void;
  onEnviarDirecto: (prompt: string) => void;
  onSubirArchivo?: () => void;
  onSubirEjemploClase?: () => void;
  onAbrirVerificacionExterna?: () => void;
}

export const RutaGuiadaModo: React.FC<RutaGuiadaModoProps> = ({
  modeKey,
  permiteAdjuntos,
  ejemplosClaseCount = 0,
  onPrepararPrompt,
  onEnviarDirecto,
  onSubirArchivo,
  onSubirEjemploClase,
  onAbrirVerificacionExterna,
}) => {
  const config = CATALOGO_RUTAS_MODO[modeKey];
  const [paso1Id, setPaso1Id] = useState<string>('');
  const [paso2Id, setPaso2Id] = useState<string>('');
  const [temaElegidoId, setTemaElegidoId] = useState<string>('');

  // Si el estudiante entró haciendo clic en un sub-botón desde la tarjeta de inicio, precargamos ese paso
  useEffect(() => {
    if (!config) return;
    try {
      const guardado = sessionStorage.getItem('interlocutor-ruta-inicial');
      if (guardado) {
        const parsed = JSON.parse(guardado) as { modo?: string; paso1Id?: string; paso2Id?: string };
        if (parsed.modo === modeKey) {
          if (parsed.paso1Id && config.opcionesPaso1.some((o) => o.id === parsed.paso1Id)) {
            setPaso1Id(parsed.paso1Id);
          } else {
            setPaso1Id(config.opcionesPaso1[0]?.id || '');
          }
          if (parsed.paso2Id && config.opcionesPaso2.some((o) => o.id === parsed.paso2Id)) {
            setPaso2Id(parsed.paso2Id);
          } else {
            setPaso2Id(config.opcionesPaso2[0]?.id || '');
          }
          sessionStorage.removeItem('interlocutor-ruta-inicial');
          return;
        }
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
    setPaso1Id(config.opcionesPaso1[0]?.id || '');
    setPaso2Id(config.opcionesPaso2[0]?.id || '');
    setTemaElegidoId('');
  }, [modeKey, config]);

  if (!config) return null;

  const opcion1Actual = config.opcionesPaso1.find((o) => o.id === paso1Id) || config.opcionesPaso1[0];
  const opcion2Actual = config.opcionesPaso2.find((o) => o.id === paso2Id) || config.opcionesPaso2[0];
  const temasDisponibles = opcion1Actual?.temasSugeridos || [];
  const temaActual = temasDisponibles.find((t) => t.id === temaElegidoId);

  const construirPromptCombinado = (temaPersonalizado?: { label: string; promptCompleto: string }) => {
    const base = temaPersonalizado
      ? temaPersonalizado.promptCompleto
      : `Quiero trabajar en ${opcion1Actual.titulo.toLowerCase()}.`;
    return `${base}\n\n[${opcion1Actual.promptFragmento} ${opcion2Actual.instruccionExtra}]`;
  };

  return (
    <div
      style={{ animationDelay: '380ms' }}
      className="anim-tarjeta mt-4 rounded-[14px] border border-[var(--color-separador)] bg-[var(--color-fondo)] p-4 flex flex-col gap-3.5"
    >
      {/* PASO 1: Área / Materia / Tipo de Texto / Misión */}
      <div>
        <span className="block text-[13.5px] font-semibold text-[var(--color-texto)] mb-2">
          {config.tituloPaso1}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {config.opcionesPaso1.map((op) => {
            const activo = op.id === opcion1Actual?.id;
            const IconoOp = ICONO_MAPA[op.icono || 'sparkles'] || Sparkles;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  setPaso1Id(op.id);
                  setTemaElegidoId('');
                }}
                className={`text-left p-2.5 rounded-[12px] border transition-colors flex flex-col justify-between gap-1 ${
                  activo
                    ? 'border-[var(--color-acento)] bg-[var(--color-acento-suave)]'
                    : 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 ${
                        activo
                          ? 'bg-[var(--color-acento)] text-[#FBFCFA]'
                          : 'bg-[var(--color-fondo)] text-[var(--color-acento)]'
                      }`}
                    >
                      <IconoOp className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-literata text-[14px] font-semibold text-[var(--color-texto)] leading-tight">
                      {op.titulo}
                    </span>
                  </div>
                  {activo && <CheckCircle2 className="w-4 h-4 text-[var(--color-acento)] shrink-0" />}
                </div>
                <p className="text-[12.5px] text-[var(--color-secundario)] leading-snug line-clamp-2">
                  {op.subtitulo}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 2: Enfoque / Estación de Revisión / Método */}
      <div>
        <span className="block text-[13.5px] font-semibold text-[var(--color-texto)] mb-2">
          {config.tituloPaso2}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.opcionesPaso2.map((op2) => {
            const activo = op2.id === opcion2Actual?.id;
            return (
              <button
                key={op2.id}
                type="button"
                onClick={() => setPaso2Id(op2.id)}
                className={`text-left px-3 py-2 rounded-[12px] border transition-colors flex items-start justify-between gap-2 ${
                  activo
                    ? 'border-[var(--color-acento)] bg-[var(--color-acento-suave)]'
                    : 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]'
                }`}
              >
                <div className="min-w-0">
                  <span className="text-[13.5px] font-semibold text-[var(--color-texto)] leading-snug block">
                    {op2.titulo}
                  </span>
                  <p className="text-[12.5px] text-[var(--color-secundario)] leading-snug mt-0.5">
                    {op2.descripcion}
                  </p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    activo
                      ? 'border-[var(--color-acento)] bg-[var(--color-acento)] text-[#FBFCFA]'
                      : 'border-[var(--color-separador)]'
                  }`}
                >
                  {activo && <div className="w-1.5 h-1.5 rounded-full bg-[#FBFCFA]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra compacta de acción */}
      <div className="pt-2 border-t border-[var(--color-separador)] flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPrepararPrompt(construirPromptCombinado(temaActual))}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 min-h-[38px] rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[13.5px] font-semibold hover:opacity-90 transition-opacity cursor-pointer sombra-boton-acento"
        >
          <span>Usar en mi mensaje</span>
        </button>

        {permiteAdjuntos && onSubirArchivo && (
          <button
            type="button"
            onClick={() => {
              onPrepararPrompt(construirPromptCombinado(temaActual));
              onSubirArchivo();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[var(--color-texto)] text-[13.5px] font-medium hover:border-[var(--color-acento)] transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--color-acento)] shrink-0" />
            <span>
              {modeKey === 'tutor'
                ? 'Subir ejercicio'
                : modeKey === 'escrito'
                ? 'Subir borrador'
                : 'Adjuntar archivo'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
