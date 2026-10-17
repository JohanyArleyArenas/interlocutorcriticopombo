export type CategoriaSugerencia =
  | 'filosofía'
  | 'ética'
  | 'ciencia'
  | 'matemáticas'
  | 'lenguaje'
  | 'tecnología e IA'
  | 'sociedad'
  | 'vida cotidiana'
  | 'noticias y desinformación';

export interface Sugerencia {
  id: string;
  categoria: CategoriaSugerencia;
  texto: string;
  modoSugerido: string;
  modoTitulo: string;
}

export const BANCO_SUGERENCIAS: Sugerencia[] = [
  // FILOSOFÍA (5)
  {
    id: 'filo-1',
    categoria: 'filosofía',
    texto: '¿El libre albedrío es real o todas nuestras decisiones están determinadas por factores previos?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'filo-2',
    categoria: 'filosofía',
    texto: '¿Cómo podemos saber si lo que percibimos por los sentidos es la realidad o una construcción mental?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'filo-3',
    categoria: 'filosofía',
    texto: 'Tesis: la identidad personal no reside en el cuerpo sino en la continuidad de la memoria y la conciencia.',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'filo-4',
    categoria: 'filosofía',
    texto: '¿Tiene la vida un sentido intrínseco o es una construcción individual y social?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'filo-5',
    categoria: 'filosofía',
    texto: '¿Qué significa que algo sea «justo»: dar a todos lo mismo o dar a cada uno según sus necesidades?',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },

  // ÉTICA (5)
  {
    id: 'etica-1',
    categoria: 'ética',
    texto: '¿Es moralmente admisible mentir si con esa mentira se protege la vida o el bienestar de alguien?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'etica-2',
    categoria: 'ética',
    texto: '¿Deberían los algoritmos de autos autónomos priorizar salvar al pasajero o a los peatones en un choque inevitable?',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'etica-3',
    categoria: 'ética',
    texto: 'Tesis: los seres humanos tenemos obligaciones morales directas hacia los animales no humanos.',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'etica-4',
    categoria: 'ética',
    texto: '¿Es ético usar herramientas de IA para hacer tareas escolares si luego el estudiante estudia el resultado?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'etica-5',
    categoria: 'ética',
    texto: '¿El fin justifica los medios cuando se busca evitar un mal mayor para toda una sociedad?',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },

  // CIENCIA (5)
  {
    id: 'cien-1',
    categoria: 'ciencia',
    texto: 'Quiero entender paso a paso cómo ocurre la respiración celular y en qué se diferencia de la fotosíntesis.',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'cien-2',
    categoria: 'ciencia',
    texto: '¿Por qué el agua caliente a veces se congela más rápido que la fría (el efecto Mpemba)?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'cien-3',
    categoria: 'ciencia',
    texto: 'Quiero comprender cómo funciona la dilatación del tiempo en la teoría de la relatividad de Einstein.',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'cien-4',
    categoria: 'ciencia',
    texto: '¿Qué evidencias respaldan la teoría de la evolución biológica por selección natural?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'cien-5',
    categoria: 'ciencia',
    texto: 'Explícame las leyes de la termodinámica con ejemplos sencillos de la vida cotidiana.',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },

  // MATEMÁTICAS (5)
  {
    id: 'mat-1',
    categoria: 'matemáticas',
    texto: 'Quiero aprender paso a paso a resolver ecuaciones cuadráticas y saber cuándo usar la fórmula general.',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'mat-2',
    categoria: 'matemáticas',
    texto: 'No entiendo cómo simplificar radicales como √76 o √180; ¿me explicas con un paso a paso?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'mat-3',
    categoria: 'matemáticas',
    texto: '¿Por qué cualquier número distinto de cero elevado a la potencia cero (x⁰) es igual a 1?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'mat-4',
    categoria: 'matemáticas',
    texto: '¿Cómo se aplican las razones trigonométricas (seno, coseno, tangente) para calcular alturas inalcanzables?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'mat-5',
    categoria: 'matemáticas',
    texto: 'Quiero entender el concepto de probabilidad condicional y cómo calcularla sin confundirme.',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },

  // LENGUAJE (5)
  {
    id: 'leng-1',
    categoria: 'lenguaje',
    texto: '¿Cuál es la diferencia entre un argumento deductivo y uno inductivo con ejemplos de la vida real?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'leng-2',
    categoria: 'lenguaje',
    texto: '¿Cómo identificar falacias como el «hombre de paja», «ad hominem» o la «falsa dicotomía» en un debate?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'leng-3',
    categoria: 'lenguaje',
    texto: 'Tesis: el uso de conectores lógicos variados es más determinante para la claridad de un texto que el léxico rebuscado.',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'leng-4',
    categoria: 'lenguaje',
    texto: '¿Cómo influye la ironía y el subtexto en la interpretación de una obra literaria o columna de opinión?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'leng-5',
    categoria: 'lenguaje',
    texto: 'Quiero revisar los criterios para estructurar la introducción y la tesis de un ensayo académico.',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },

  // TECNOLOGÍA E IA (5)
  {
    id: 'tec-1',
    categoria: 'tecnología e IA',
    texto: '¿Puede un modelo de inteligencia artificial comprender realmente el lenguaje o solo predice la siguiente palabra?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'tec-2',
    categoria: 'tecnología e IA',
    texto: 'Le pregunté a otra IA si la energía nuclear es segura y me dio una respuesta dudosa. Quiero auditarla.',
    modoSugerido: 'auditar',
    modoTitulo: 'Auditar a otra IA',
  },
  {
    id: 'tec-3',
    categoria: 'tecnología e IA',
    texto: '¿Cómo funcionan los algoritmos de recomendación de TikTok e Instagram y cómo crean cámaras de eco?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'tec-4',
    categoria: 'tecnología e IA',
    texto: 'Tesis: la automatización mediante IA generativa creará más oportunidades de empleo de las que destruirá.',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'tec-5',
    categoria: 'tecnología e IA',
    texto: '¿Cuáles son los principales riesgos de seguridad y privacidad al usar modelos de lenguaje en la escuela?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },

  // SOCIEDAD (5)
  {
    id: 'soc-1',
    categoria: 'sociedad',
    texto: 'Tesis: el voto debería ser obligatorio en Colombia para fortalecer la legitimidad democrática.',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'soc-2',
    categoria: 'sociedad',
    texto: '¿Qué causas estructurales explican la brecha económica entre zonas urbanas y rurales en Colombia?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'soc-3',
    categoria: 'sociedad',
    texto: '¿Debería prohibirse el uso de teléfonos celulares durante la jornada escolar en secundaria?',
    modoSugerido: 'argumento',
    modoTitulo: 'Poner a prueba mi argumento',
  },
  {
    id: 'soc-4',
    categoria: 'sociedad',
    texto: '¿Cómo afecta la gentrificación y el turismo masivo a los habitantes tradicionales de una ciudad?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'soc-5',
    categoria: 'sociedad',
    texto: '¿Qué factores hacen que una protesta social logre reformas institucionales duraderas?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },

  // VIDA COTIDIANA (5)
  {
    id: 'vida-1',
    categoria: 'vida cotidiana',
    texto: '¿Por qué procrastinamos las tareas escolares difíciles aun sabiendo que nos perjudica?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'vida-2',
    categoria: 'vida cotidiana',
    texto: '¿Existe realmente el «multitasking» o nuestro cerebro solo cambia rápidamente de una tarea a otra perdiendo foco?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'vida-3',
    categoria: 'vida cotidiana',
    texto: '¿Cómo afecta la falta de sueño de los adolescentes a su capacidad de retención y regulación emocional?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'vida-4',
    categoria: 'vida cotidiana',
    texto: '¿Qué sesgos cognitivos cometemos con más frecuencia al tomar decisiones bajo presión o estrés?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
  {
    id: 'vida-5',
    categoria: 'vida cotidiana',
    texto: '¿Cómo gestionar el miedo a equivocarse al hablar en público o participar en clase?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },

  // NOTICIAS Y DESINFORMACIÓN (5)
  {
    id: 'notic-1',
    categoria: 'noticias y desinformación',
    texto: '«Tomar agua con limón en ayunas alcaliniza la sangre y cura enfermedades». ¿Es mito o realidad científica?',
    modoSugerido: 'verificar',
    modoTitulo: 'Verificar una afirmación',
  },
  {
    id: 'notic-2',
    categoria: 'noticias y desinformación',
    texto: '«El cambio climático es solo un ciclo natural y la actividad humana no tiene impacto significativo».',
    modoSugerido: 'verificar',
    modoTitulo: 'Verificar una afirmación',
  },
  {
    id: 'notic-3',
    categoria: 'noticias y desinformación',
    texto: '¿Cómo detectar si una fotografía o video viral en redes sociales fue alterado con deepfake o IA?',
    modoSugerido: 'explorar',
    modoTitulo: 'Investigar una pregunta',
  },
  {
    id: 'notic-4',
    categoria: 'noticias y desinformación',
    texto: '«Las vacunas contienen microchips de rastreo». ¿De dónde surgió esta teoría y qué evidencia existe?',
    modoSugerido: 'verificar',
    modoTitulo: 'Verificar una afirmación',
  },
  {
    id: 'notic-5',
    categoria: 'noticias y desinformación',
    texto: '¿Cuáles son los pasos clave del «fact-checking» periodístico que cualquier estudiante puede aplicar?',
    modoSugerido: 'socratico',
    modoTitulo: 'Diálogo socrático',
  },
];

const CLAVE_STORAGE = 'interlocutor-sugerencias-vistas';

function leerIdsVistos(): string[] {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarIdsVistos(ids: string[]) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(ids));
  } catch {
    /* localStorage no disponible o lleno */
  }
}

/**
 * Selecciona al azar 4 sugerencias de 4 categorías distintas,
 * evitando repetir las mostradas la última vez guardadas en localStorage.
 */
export function obtenerSugerenciasAleatorias(cantidad = 4, paraModo?: string): Sugerencia[] {
  const vistosPrevios = new Set(leerIdsVistos());

  // Lista de las 9 categorías
  const categorias: CategoriaSugerencia[] = [
    'filosofía',
    'ética',
    'ciencia',
    'matemáticas',
    'lenguaje',
    'tecnología e IA',
    'sociedad',
    'vida cotidiana',
    'noticias y desinformación',
  ];

  // Barajar categorías (Fisher-Yates)
  const categoriasBarajadas = [...categorias].sort(() => Math.random() - 0.5);

  const seleccionadas: Sugerencia[] = [];
  const categoriasUsadas = new Set<CategoriaSugerencia>();

  // Si se solicita para un modo específico (por ejemplo socratico o explorar en ChatView)
  const bancoBase = paraModo
    ? BANCO_SUGERENCIAS.filter((s) => s.modoSugerido === paraModo)
    : BANCO_SUGERENCIAS;

  // Si paraModo filtra demasiado, usamos el banco completo como respaldo
  const banco = bancoBase.length >= cantidad ? bancoBase : BANCO_SUGERENCIAS;

  // Paso 1: Intentar tomar 1 por categoría de entre las no vistas recientemente
  for (const cat of categoriasBarajadas) {
    if (seleccionadas.length >= cantidad) break;
    const candidatasDeCat = banco.filter((s) => s.categoria === cat);
    if (candidatasDeCat.length === 0) continue;

    // Preferir las no vistas
    const noVistas = candidatasDeCat.filter((s) => !vistosPrevios.has(s.id));
    const pool = noVistas.length > 0 ? noVistas : candidatasDeCat;

    const elegida = pool[Math.floor(Math.random() * pool.length)];
    if (elegida && !seleccionadas.some((s) => s.id === elegida.id)) {
      seleccionadas.push(elegida);
      categoriasUsadas.add(cat);
    }
  }

  // Paso 2: Si aún no alcanzamos la cantidad (por ejemplo si un modo tenía pocas categorías), rellenar evitando repetir
  if (seleccionadas.length < cantidad) {
    const restantes = banco.filter((s) => !seleccionadas.some((sel) => sel.id === s.id));
    const restantesNoVistas = restantes.filter((s) => !vistosPrevios.has(s.id));
    const poolRestante = restantesNoVistas.length >= (cantidad - seleccionadas.length)
      ? restantesNoVistas
      : restantes;
    const poolBarajado = [...poolRestante].sort(() => Math.random() - 0.5);
    for (const r of poolBarajado) {
      if (seleccionadas.length >= cantidad) break;
      seleccionadas.push(r);
    }
  }

  // Guardar los nuevos IDs en localStorage (conservando hasta los últimos 16 para mayor rotación)
  const nuevosIds = seleccionadas.map((s) => s.id);
  const historialCombinado = [...nuevosIds, ...Array.from(vistosPrevios)].slice(0, 16);
  guardarIdsVistos(historialCombinado);

  return seleccionadas;
}
