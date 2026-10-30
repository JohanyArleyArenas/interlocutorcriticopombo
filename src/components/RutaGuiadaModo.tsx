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
        titulo: 'Aprender el tema desde cero',
        descripcion: 'Explicación clara con ejemplos cotidianos y micro-preguntas para comprobar cada idea.',
        instruccionExtra:
          'Modalidad elegida: Aprender desde cero. Explícame el concepto fundamental de forma sencilla, dame un ejemplo corto y hazme una pregunta breve antes de avanzar.',
        recompensa: '+1 ⭐ por pregunta analítica',
      },
      {
        id: 'resolver-ejercicio',
        titulo: 'Resolver un ejercicio paso a paso',
        descripcion: 'Tú pones el problema y el tutor te guía con pistas sin regalarte el resultado final.',
        instruccionExtra:
          'Modalidad elegida: Resolver un ejercicio paso a paso. No me des la solución completa de una vez; pregúntame qué datos tengo y cuál creo que es el primer paso.',
        recompensa: '+1 ⭐ por justificar tu paso',
      },
      {
        id: 'cazar-error',
        titulo: 'Encontrar el error en mi procedimiento',
        descripcion: 'Ideal cuando tu respuesta no coincide y quieres descubrir en qué línea estuvo el fallo.',
        instruccionExtra:
          'Modalidad elegida: Revisión de mi procedimiento. Voy a mostrarte lo que hice para que me des pistas sobre en qué paso exacto está el error de signo, despeje o concepto.',
        recompensa: '+2 ⭐ por corregir tu propio error',
      },
      {
        id: 'metodo-profe',
        titulo: 'Usar el método exacto de mi profe',
        descripcion: 'Sube una foto o PDF de tu cuaderno para seguir la misma notación vista en el Liceo.',
        instruccionExtra:
          'Modalidad elegida: Seguir el método de clase de mi profesor(a). Respetemos los mismos pasos, símbolos y estructura de mis apuntes.',
        recompensa: '+2 ⭐ al cargar ejemplo de clase',
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
        titulo: 'Mapa 360° (Causas, actores y consecuencias)',
        descripcion: 'Desglosa el tema en sus raíces históricas, científicas, económicas y sociales.',
        instruccionExtra:
          'Lente elegido: Mapa 360°. Organiza el panorama mostrando causas principales, actores involucrados y consecuencias a corto y largo plazo.',
        recompensa: '+1 ⭐',
      },
      {
        id: 'choque-posturas',
        titulo: 'Contrastar 2 posturas opuestas con rigor',
        descripcion: 'Presenta los mejores argumentos y evidencias de cada lado sin caricaturizar ninguno.',
        instruccionExtra:
          'Lente elegido: Contraste de posturas. Muéstrame las dos o tres visiones más sólidas que chocan en este tema y en qué evidencia se apoya cada una.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'aterrizaje-local',
        titulo: 'Conectar con nuestra realidad local y escolar',
        descripcion: 'Analiza cómo se vive o qué implica este fenómeno en nuestra región y comunidad.',
        instruccionExtra:
          'Lente elegido: Conexión con el entorno. Ayúdame a pensar cómo se relaciona este tema con nuestra realidad en Colombia y Santander sin inventar datos locales no verificados.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'preguntas-investigacion',
        titulo: 'Formular preguntas para exposición o ensayo',
        descripcion: 'Ideal para encontrar un enfoque original antes de hacer un trabajo de clase.',
        instruccionExtra:
          'Lente elegido: Laboratorio de preguntas. Propónme 3 ángulos de investigación exigentes y ayúdame a elegir el más potente.',
        recompensa: '+1 ⭐',
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
        titulo: 'Estación 1: Fuerza de la Tesis y las Pruebas',
        descripcion: 'Revisa si la idea central es clara y si tus razones están respaldadas con hechos.',
        instruccionExtra:
          'Estación de revisión activa: Fuerza de la Tesis y Argumentos. Evalúa si mi postura es clara desde el inicio y dónde hay afirmaciones sin pruebas.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'capa-arquitectura',
        titulo: 'Estación 2: Orden de Párrafos y Conectores',
        descripcion: 'Detecta saltos bruscos entre ideas, párrafos desordenados o conectores repetidos.',
        instruccionExtra:
          'Estación de revisión activa: Coherencia y Conectores. Analiza cómo fluye un párrafo hacia el siguiente y señala dónde se pierde el hilo conductor.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'capa-estilo',
        titulo: 'Estación 3: Claridad, Precisión y Ortografía',
        descripcion: 'Identifica frases confusas, muletillas, errores de puntuación y precisión léxica.',
        instruccionExtra:
          'Estación de revisión activa: Precisión y Estilo. Señálame oraciones ambiguas, redundancias o errores de puntuación explicándome la regla para que yo mismo las corrija.',
        recompensa: '+1 ⭐',
      },
      {
        id: 'capa-integral',
        titulo: 'Diagnóstico Completo en 3 Capas',
        descripcion: 'Recibe un mapa completo: 1) Lo más sólido, 2) Puntos débiles de fondo y 3) Forma.',
        instruccionExtra:
          'Estación de revisión activa: Diagnóstico Integral en 3 Capas (Fortalezas, Argumentación/Estructura y Claridad/Precisión), sin reescribir el texto por mí.',
        recompensa: '+2 ⭐',
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
        titulo: 'Noticia viral, cadena o publicación de redes',
        subtitulo: 'Titulares alarmistas, capturas sin fecha o afirmaciones virales',
        icono: 'search',
        promptFragmento: 'Objeto de verificación: Afirmación viral o noticia de redes sociales.',
        temasSugeridos: [
          {
            id: 'ver-cadena',
            label: 'Probar con un titular viral o captura que circula en redes',
            promptCompleto:
              'Quiero verificar una afirmación viral que vi en redes sociales. Ayúdame a separar qué elementos son comprobables, qué fuentes oficiales deberíamos consultar y si hay señales de desinformación.',
          },
        ],
      },
      {
        id: 'cita-ia',
        titulo: 'Dato, cita o fuente que me dio una IA',
        subtitulo: 'Detectar libros inventados, fechas cruzadas o citas apócrifas',
        icono: 'shield',
        promptFragmento: 'Objeto de verificación: Respuesta, cita o referencia generada por una IA.',
        temasSugeridos: [
          {
            id: 'ver-ia-cita',
            label: 'Comprobar si un autor, libro, artículo o fecha citada realmente existe',
            promptCompleto:
              'Una inteligencia artificial me dio un dato y una cita bibliográfica. Vamos a verificar en tiempo real si la obra, el autor y la fecha existen exactamente así o si es una alucinación.',
          },
        ],
      },
      {
        id: 'cifra-ciencia',
        titulo: 'Estadística, porcentaje o afirmación científica',
        subtitulo: 'Datos del DANE, estudios médicos, gráficas o afirmaciones de salud',
        icono: 'atom',
        promptFragmento: 'Objeto de verificación: Estadística o afirmación científica.',
        temasSugeridos: [
          {
            id: 'ver-correlacion',
            label: 'Revisar si una cifra tiene fuente primaria o confunde correlación con causa',
            promptCompleto:
              'Quiero verificar una estadística o afirmación científica. Busquemos de qué institución o estudio proviene originalmente y si la conclusión está bien respaldada por los datos.',
          },
        ],
      },
      {
        id: 'historia-norma',
        titulo: 'Hecho histórico, geográfico o ley colombiana',
        subtitulo: 'Fechas, artículos constitucionales, historia regional o nacional',
        icono: 'scale',
        promptFragmento: 'Objeto de verificación: Hecho histórico, dato geográfico o norma de Colombia.',
        temasSugeridos: [
          {
            id: 'ver-historia',
            label: 'Contrastar un dato histórico o normativo de Colombia con fuentes documentales',
            promptCompleto:
              'Necesito verificar con precisión documental un dato histórico o normativo de Colombia. Contrasta lo que dicen las fuentes verificables y señálame cualquier imprecisión.',
          },
        ],
      },
    ],
    tituloPaso2: '2. ¿Qué prueba de contraste quieres aplicar?',
    opcionesPaso2: [
      {
        id: 'rastreo-fuentes',
        titulo: 'Rastreo de fuente primaria en Google',
        descripcion: 'Busca de dónde salió originalmente el dato y qué instituciones serias lo respaldan.',
        instruccionExtra:
          'Protocolo activo: Rastreo de fuente primaria. Usa la búsqueda web para identificar la fuente original, su fecha y su nivel de confiabilidad.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'hechos-vs-opinion',
        titulo: 'Separador de Hechos vs. Opiniones y Sesgos',
        descripcion: 'Desarma el texto en: 1) Lo probado, 2) Lo dudoso y 3) Adjetivos o juicios de valor.',
        instruccionExtra:
          'Protocolo activo: Separar hechos verificables de opiniones o lenguaje emocional. Clasifica cada parte con rigor.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'contexto-omitido',
        titulo: 'Detector de Contexto Omitido o Cifras Engañosas',
        descripcion: 'Revisa si un dato real está siendo usado fuera de contexto para inducir a error.',
        instruccionExtra:
          'Protocolo activo: Análisis de contexto omitido. Revisa qué datos de comparación faltan para entender la cifra o noticia de forma completa.',
        recompensa: '+3 ⭐',
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
        titulo: 'Misión 1: Cazar alucinaciones y datos inventados',
        subtitulo: 'Pon a prueba si la IA inventa detalles locales, fechas o documentos que no existen',
        icono: 'shield',
        promptFragmento: 'Misión de auditoría: Detección de alucinaciones y precisión factual.',
        temasSugeridos: [
          {
            id: 'aud-reto-local',
            label: 'Reto: Generar un párrafo con 2 verdades y 1 error sutil para que yo lo cace',
            promptCompleto:
              'Escribe un párrafo de nivel 11° sobre historia o ciencia en Colombia que contenga dos datos completamente ciertos y un error histórico o conceptual sutil pero importante. No me digas cuál es el error: déjame auditar tu texto y encontrarlo.',
          },
          {
            id: 'aud-citas',
            label: 'Reto: Auditar cómo responde la IA cuando le pido un dato muy específico',
            promptCompleto:
              'Explícame qué límites tienes para verificar datos hiperlocales o documentos internos de un municipio o colegio, y ponme una prueba práctica para aprender a detectar cuándo una IA está rellenando vacíos con suposiciones.',
          },
        ],
      },
      {
        id: 'mision-sesgos',
        titulo: 'Misión 2: Detectar sesgos y miradas omitidas',
        subtitulo: 'Descubre qué actores, regiones o puntos de vista suele dejar por fuera una respuesta',
        icono: 'eye',
        promptFragmento: 'Misión de auditoría: Análisis de sesgos de representación y encuadre.',
        temasSugeridos: [
          {
            id: 'aud-sesgo-tema',
            label: 'Reto: Analizar un tema polémico y descubrir qué perspectiva quedó invisible',
            promptCompleto:
              'Dame una respuesta estándar de 10 líneas sobre el impacto de la automatización tecnológica en América Latina. Luego pídeleme que te audite señalando qué sectores sociales o económicos quedaron por fuera de tu explicación.',
          },
        ],
      },
      {
        id: 'mision-trampa-logica',
        titulo: 'Misión 3: Trampa lógica o falacia oculta',
        subtitulo: 'Encuentra dónde un razonamiento que suena elegante tiene un salto lógico falso',
        icono: 'scale',
        promptFragmento: 'Misión de auditoría: Caza de falacias y saltos lógicos.',
        temasSugeridos: [
          {
            id: 'aud-falacia',
            label: 'Reto: Escribe un argumento muy convincente que esconda una falacia lógica',
            promptCompleto:
              'Redacta un argumento aparentemente muy académico y convincente sobre educación o tecnología, pero incluye adentro una falacia lógica camuflada (como falsa causalidad o falso dilema). Yo debo descubrir en qué frase exacta está la trampa.',
          },
        ],
      },
      {
        id: 'mision-externa',
        titulo: 'Misión 4: Auditar texto traído de otra IA',
        subtitulo: 'Pega aquí una respuesta de ChatGPT, Gemini o Copilot para diseccionarla juntos',
        icono: 'file',
        promptFragmento: 'Misión de auditoría: Inspección crítica de un texto generado por otra IA.',
        temasSugeridos: [
          {
            id: 'aud-pegar-ia',
            label: 'Quiero pegar una respuesta de otra IA para hacerle una radiografía crítica',
            promptCompleto:
              'Voy a pegarte una respuesta que me dio otra IA para un trabajo escolar. Ayúdame a auditarla: 1) ¿Qué afirmaciones requieren verificación urgente?, 2) ¿Qué suena genérico o superficial?, y 3) ¿Qué preguntas críticas le faltó responder?',
          },
        ],
      },
    ],
    tituloPaso2: '2. ¿Cómo quieres realizar la auditoría?',
    opcionesPaso2: [
      {
        id: 'modo-cazador',
        titulo: 'Modo Cazador (La IA me pone el reto oculto)',
        descripcion: 'La IA redacta un texto de prueba con un fallo camuflado y tú ganas estrellas al descubrirlo.',
        instruccionExtra:
          'Dinámica elegida: Modo Cazador. Preséntame el texto de prueba sin revelar dónde está el fallo para que yo lo audite.',
        recompensa: '+3 ⭐ al cazar el fallo',
      },
      {
        id: 'modo-forense',
        titulo: 'Modo Forense (Yo pego un texto y lo diseccionamos)',
        descripcion: 'Ideal cuando ya tienes un texto o respuesta y quieres pasarle el escáner de rigor.',
        instruccionExtra:
          'Dinámica elegida: Modo Forense. Analicemos el texto buscando imprecisiones, generalizaciones sin pruebas y sesgos.',
        recompensa: '+2 ⭐',
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
        titulo: 'Cuestionar una idea que todos repiten',
        subtitulo: 'Examinar frases hechas sobre el éxito, la tecnología, la justicia o la educación',
        icono: 'message',
        promptFragmento: 'Enfoque socrático: Cuestionar una creencia común.',
        temasSugeridos: [
          {
            id: 'soc-neutralidad',
            label: '«La tecnología no es buena ni mala, todo depende de cómo se use»',
            promptCompleto:
              'Quiero examinar socráticamente la frase: «La tecnología es neutral, todo depende de quién la use». Hazme una primera pregunta incisiva para poner a prueba si eso es siempre cierto.',
          },
          {
            id: 'soc-merito',
            label: '«El que quiere siempre puede, sin importar sus circunstancias»',
            promptCompleto:
              'Pongamos a prueba con diálogo socrático la idea de que el éxito depende únicamente del esfuerzo individual.',
          },
        ],
      },
      {
        id: 'dilema-etico',
        titulo: 'Analizar un dilema ético o ciudadano',
        subtitulo: 'Cuando dos valores importantes chocan (libertad vs. seguridad, progreso vs. ambiente)',
        icono: 'scale',
        promptFragmento: 'Enfoque socrático: Dilema ético o ciudadano.',
        temasSugeridos: [
          {
            id: 'soc-privacidad',
            label: '¿Vale la pena ceder nuestra privacidad digital a cambio de mayor seguridad?',
            promptCompleto:
              'Quiero explorar mediante diálogo socrático el dilema entre privacidad ciudadana y vigilancia tecnológica por seguridad.',
          },
        ],
      },
      {
        id: 'definir-concepto',
        titulo: 'Construir un concepto desde la raíz',
        subtitulo: '¿Qué es realmente la justicia, la verdad, la belleza o la inteligencia?',
        icono: 'lightbulb',
        promptFragmento: 'Enfoque socrático: Definición rigurosa de un concepto.',
        temasSugeridos: [
          {
            id: 'soc-pensar',
            label: '¿Pensar es lo mismo que procesar información como hace una máquina?',
            promptCompleto:
              'Dialoguemos socráticamente sobre qué diferencia el pensamiento humano consciente del procesamiento estadístico de una IA.',
          },
        ],
      },
    ],
    tituloPaso2: '2. Elige la intensidad del cuestionamiento',
    opcionesPaso2: [
      {
        id: 'socratico-gradual',
        titulo: 'Paso a paso (Con ejemplos cercanos)',
        descripcion: 'Preguntas breves conectadas con situaciones cotidianas para aclarar tu postura.',
        instruccionExtra: 'Intensidad: Gradual y cercana, usando ejemplos cotidianos.',
        recompensa: '+1 ⭐',
      },
      {
        id: 'socratico-retador',
        titulo: 'Retador (Contraejemplos y paradojas)',
        descripcion: 'Pone tus definiciones contra las cuerdas usando casos límite y paradojas clásicas.',
        instruccionExtra: 'Intensidad: Retadora, usando contraejemplos exigentes y casos límite.',
        recompensa: '+2 ⭐',
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
        titulo: 'Vida escolar y educación',
        subtitulo: 'Uso de celulares, evaluaciones, tareas, IA en el colegio y convivencia',
        icono: 'book',
        promptFragmento: 'Terreno del debate: Educación y vida escolar.',
        temasSugeridos: [
          {
            id: 'arg-celulares',
            label: 'Mi postura sobre la regulación de celulares o IA en el salón de clase',
            promptCompleto:
              'Quiero defender mi postura sobre cómo debería regularse el uso de celulares e inteligencia artificial en las clases del colegio. Primero pregúntame cuál es mi tesis y mi razón principal.',
          },
        ],
      },
      {
        id: 'arg-sociedad',
        titulo: 'Sociedad, economía y Colombia',
        subtitulo: 'Debates ciudadanos, medio ambiente, redes sociales y políticas públicas',
        icono: 'compass',
        promptFragmento: 'Terreno del debate: Sociedad y contexto ciudadano.',
        temasSugeridos: [
          {
            id: 'arg-redes-menores',
            label: '¿Debería limitarse por ley el acceso a redes sociales por edad?',
            promptCompleto:
              'Voy a defender una postura sobre si debería regularse por ley el uso de redes sociales en adolescentes. Pídeme mi argumento inicial para ponerlo a prueba.',
          },
        ],
      },
      {
        id: 'arg-ensayo',
        titulo: 'Blindar la tesis de mi ensayo o debate de clase',
        subtitulo: 'Entrena antes de una exposición o mesa redonda anticipando las preguntas difíciles',
        icono: 'target',
        promptFragmento: 'Terreno del debate: Preparación para mesa redonda o ensayo.',
        temasSugeridos: [
          {
            id: 'arg-blindaje',
            label: 'Tengo una tesis para una exposición y quiero que me lances las 2 objeciones más duras',
            promptCompleto:
              'Estoy preparando una exposición o debate para clase. Te voy a escribir mi tesis y mis argumentos para que actúes como el jurado más exigente y me ayudes a blindar mis puntos débiles.',
          },
        ],
      },
    ],
    tituloPaso2: '2. ¿Qué rol quieres que asuma el Interlocutor?',
    opcionesPaso2: [
      {
        id: 'rol-entrenador',
        titulo: 'Entrenador de blindaje',
        descripcion: 'Señala qué parte de tu argumento es vulnerable y te sugiere cómo reforzarlo con pruebas.',
        instruccionExtra: 'Rol elegido: Entrenador de blindaje argumentativo.',
        recompensa: '+1 ⭐',
      },
      {
        id: 'rol-abogado-diablo',
        titulo: 'Abogado del diablo exigente',
        descripcion: 'Defiende con rigor la postura contraria para obligarte a mejorar tus evidencias.',
        instruccionExtra: 'Rol elegido: Abogado del diablo con contraejemplos exigentes.',
        recompensa: '+2 ⭐',
      },
      {
        id: 'rol-caza-falacias',
        titulo: 'Juez detector de falacias',
        descripcion: 'Examina si en tu argumento hay generalizaciones apresuradas o saltos sin evidencia.',
        instruccionExtra: 'Rol elegido: Juez detector de falacias y rigor probatorio.',
        recompensa: '+2 ⭐',
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
    <div className="mt-4 rounded-[14px] border border-[var(--color-separador)] bg-[var(--color-fondo)] p-4 sm:p-5 flex flex-col gap-4">
      {/* Cabecera de la Ruta Guiada con indicador de pasos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-separador)]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-acento)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{config.insignia}</span>
          </div>
          <h3 className="font-literata text-[18px] font-semibold text-[var(--color-texto)] mt-0.5 leading-snug">
            {config.tituloRuta}
          </h3>
          <p className="text-[14px] text-[var(--color-secundario)] leading-snug mt-0.5">
            {config.subtituloRuta}
          </p>
        </div>

        <span className="self-start sm:self-center text-[13px] font-bold px-3 py-1 rounded-full bg-[var(--color-oro)]/15 text-[var(--color-oro)] shrink-0">
          {config.recompensaTexto.replace(/⭐/g, 'estrellas')}
        </span>
      </div>

      {/* PASO 1: Botones de Área / Materia / Tipo de Texto / Misión */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[14px] font-bold text-[var(--color-texto)]">
            {config.tituloPaso1}
          </span>
          <span className="text-[13px] text-[var(--color-secundario)]">
            Elige una opción
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 min-h-[78px] ${
                  activo
                    ? 'border-[var(--color-acento)] bg-[var(--color-acento)]/[0.08] shadow-2xs'
                    : 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="inline-flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activo
                          ? 'bg-[var(--color-acento)] text-white'
                          : 'bg-[var(--color-fondo)] text-[var(--color-acento)]'
                      }`}
                    >
                      <IconoOp className="w-4 h-4" />
                    </div>
                    <span className="text-[14px] font-bold text-[var(--color-texto)] leading-tight">
                      {op.titulo}
                    </span>
                  </div>
                  {activo && <CheckCircle2 className="w-4 h-4 text-[var(--color-acento)] shrink-0" />}
                </div>
                <p className="text-[12px] text-[var(--color-secundario)] leading-snug">
                  {op.subtitulo}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 2: Botones de Enfoque / Estación de Revisión / Método */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[14px] font-bold text-[var(--color-texto)]">
            {config.tituloPaso2}
          </span>
          {opcion2Actual?.recompensa && (
            <span className="text-[13px] font-bold text-[var(--color-oro)]">
              Recompensa: {opcion2Actual.recompensa.replace(/⭐/g, 'estrellas')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {config.opcionesPaso2.map((op2) => {
            const activo = op2.id === opcion2Actual?.id;
            return (
              <button
                key={op2.id}
                type="button"
                onClick={() => setPaso2Id(op2.id)}
                className={`text-left px-3.5 py-2.5 rounded-[14px] border transition-colors flex items-start justify-between gap-2 ${
                  activo
                    ? 'border-[var(--color-acento)] bg-[var(--color-acento-suave)]'
                    : 'border-[var(--color-separador)] bg-[var(--color-superficie)] hover:border-[var(--color-acento)]'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] font-bold text-[var(--color-texto)] leading-snug">
                      {op2.titulo}
                    </span>
                    {op2.recompensa && (
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-oro)]/15 text-[var(--color-oro)]">
                        {op2.recompensa.replace(/⭐/g, 'estrellas')}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--color-secundario)] leading-snug mt-0.5">
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

      {/* PASO 3: Subtemas / Misiones listas para entrar con un botón */}
      {temasDisponibles.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[13px] font-bold text-[var(--color-texto)]">
              3. Elige un punto de partida en «{opcion1Actual.titulo}» o sube tu material:
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {temasDisponibles.map((tema) => {
              const seleccionado = tema.id === temaElegidoId;
              return (
                <div
                  key={tema.id}
                  className={`rounded-xl border p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    seleccionado
                      ? 'border-[var(--color-acento)] bg-[var(--color-acento)]/[0.06]'
                      : 'border-[var(--color-separador)] bg-[var(--color-superficie)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTemaElegidoId(tema.id);
                      onPrepararPrompt(construirPromptCombinado(tema));
                    }}
                    className="text-left flex-1 min-w-0 flex items-start gap-2.5"
                  >
                    <ArrowRight className="w-4 h-4 text-[var(--color-acento)] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[13.5px] font-semibold text-[var(--color-texto)] leading-snug block">
                        {tema.label}
                      </span>
                      <span className="text-[11.5px] text-[var(--color-secundario)]">
                        Con enfoque: {opcion2Actual.titulo}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        setTemaElegidoId(tema.id);
                        onPrepararPrompt(construirPromptCombinado(tema));
                      }}
                      className="px-2.5 py-1.5 min-h-[34px] rounded-lg border border-[var(--color-separador)] bg-[var(--color-fondo)] text-[12px] font-medium text-[var(--color-texto)] hover:border-[var(--color-acento)] transition-colors"
                      title="Poner en el cuadro de texto para agregar tus propios detalles"
                    >
                      Editar antes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTemaElegidoId(tema.id);
                        onEnviarDirecto(construirPromptCombinado(tema));
                      }}
                      className="px-3 py-1.5 min-h-[34px] rounded-lg bg-[var(--color-acento)] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Iniciar ahora</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de acciones directas según el modo */}
      <div className="pt-2 border-t border-[var(--color-separador)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPrepararPrompt(construirPromptCombinado(temaActual))}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-[var(--color-acento)] text-[#FBFCFA] text-[14px] font-bold hover:opacity-90 transition-opacity sombra-boton-acento"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Usar esta combinación en mi mensaje</span>
          </button>

          {permiteAdjuntos && onSubirArchivo && (
            <button
              type="button"
              onClick={() => {
                onPrepararPrompt(construirPromptCombinado(temaActual));
                onSubirArchivo();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-acento)] bg-[var(--color-superficie)] text-[var(--color-acento)] text-[14px] font-bold hover:bg-[var(--color-acento-suave)] transition-colors"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>
                {modeKey === 'tutor'
                  ? 'Subir foto o PDF de mi ejercicio'
                  : modeKey === 'escrito'
                  ? 'Subir mi borrador (+2 estrellas)'
                  : 'Adjuntar archivo para revisar'}
              </span>
            </button>
          )}

          {modeKey === 'tutor' && onSubirEjemploClase && (
            <button
              type="button"
              onClick={onSubirEjemploClase}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-separador)] bg-[var(--color-superficie)] text-[var(--color-texto)] text-[14px] font-bold hover:border-[var(--color-acento)] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[var(--color-acento)] shrink-0" />
              <span>
                {ejemplosClaseCount > 0
                  ? `Apuntes de clase (${ejemplosClaseCount}), agregar otro`
                  : 'Subir apuntes del profesor (+2 estrellas)'}
              </span>
            </button>
          )}

          {(modeKey === 'verificar' || modeKey === 'auditar') && onAbrirVerificacionExterna && (
            <button
              type="button"
              onClick={onAbrirVerificacionExterna}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-oro)] bg-[var(--color-oro)]/12 text-[var(--color-oro)] text-[14px] font-bold hover:bg-[var(--color-oro)]/20 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Registrar lo verificado por fuera (+3 estrellas)</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setPaso1Id(config.opcionesPaso1[0]?.id || '');
            setPaso2Id(config.opcionesPaso2[0]?.id || '');
            setTemaElegidoId('');
          }}
          className="inline-flex items-center gap-1 min-h-[40px] text-[13px] text-[var(--color-secundario)] hover:text-[var(--color-texto)] px-2 py-1"
          title="Reiniciar selección de pasos"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar pasos</span>
        </button>
      </div>
    </div>
  );
};
