// ============================================================================
// Sistema de Gamificación Pedagógica · Ruta del Pensador Crítico
// Liceo Superior Rafael Pombo · San Gil, Santander
// ============================================================================

export interface RetoDiarioProgreso {
  id: string;
  titulo: string;
  descripcion: string;
  actual: number;
  meta: number;
  estrellas: number;
  xp: number;
  modoSugerido: string;
  completado: boolean;
  reclamado: boolean;
}

export interface InsigniaConfig {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  condicionTexto: string;
}

export interface RecompensaTienda {
  id: string;
  nombre: string;
  descripcion: string;
  costoEstrellas: number;
  tipo: 'escudo' | 'titulo' | 'comodines';
  valor: string;
}

export type CategoriaCulturaGeneral =
  | 'Colombia y Santander'
  | 'Matemáticas y Lógica'
  | 'Geografía y Planeta'
  | 'Ciencia y Universo'
  | 'Literatura y Arte'
  | 'Historia y Mundo';

export interface PreguntaDesafioRelampago {
  id: string;
  categoria: CategoriaCulturaGeneral;
  contexto: string;
  pregunta: string;
  opciones: string[];
  correcta: number;
  pista: string;
  explicacion: string;
}

export interface EstadoGamificacion {
  estrellas: number;
  estrellasAcumuladas?: number;
  estrellasHoy: number;
  metaEstrellasDiaria: number;
  xp: number;
  rachaDias: number;
  escudosRacha: number;
  comodinesPista: number;
  fechaIngreso?: string; // YYYY-MM-DD
  ultimaFechaActivo: string; // YYYY-MM-DD
  sonidoActivo: boolean;
  sonidosAmbientalesActivos?: boolean;
  ambienteSeleccionado?: 'lluvia-suave' | 'bosque-santander' | 'ondas-alfa';
  vibracionHapticaActiva?: boolean;
  modoLecturaActivo?: boolean;
  tituloEquipado: string;
  titulosDesbloqueados: string[];
  insigniasDesbloqueadas: string[];
  modosExplorados: string[];
  estadisticas: {
    mensajesArgumentados: number;
    preguntasAnaliticas: number;
    desafiosPensamientoCritico: number;
    verificacionesExternas: number;
    aciertosIcfes: number;
    intentosIcfes: number;
    rachaIcfesActual: number;
    cierresCompletados: number;
    archivosClaseSubidos: number;
    desafiosRelampagoGanados: number;
    aciertosCulturalesTotales?: number;
    categoriasCulturales?: Record<string, number>;
    preguntasCulturalesVistas?: string[];
  };
  retosFecha: string;
  retos: Record<string, { actual: number; completado: boolean; reclamado: boolean }>;
}

export interface NotificacionRecompensa {
  id: string;
  estrellas: number;
  xp: number;
  titulo: string;
  subtitulo?: string;
  tipo: 'estrella' | 'reto' | 'nivel' | 'insignia';
}

export const NIVELES_CRITICOS: Array<{
  nivel: number;
  nombre: string;
  xpMinimo: number;
  lema: string;
}> = [
  { nivel: 1, nombre: 'Explorador Curioso', xpMinimo: 0, lema: 'No acepta la primera respuesta sin preguntar por qué.' },
  { nivel: 2, nombre: 'Cazador de Supuestos', xpMinimo: 60, lema: 'Detecta lo que un texto da por hecho sin demostrarlo.' },
  { nivel: 3, nombre: 'Detective de Fuentes', xpMinimo: 150, lema: 'Contrasta datos fuera de la pantalla antes de creer.' },
  { nivel: 4, nombre: 'Arquitecto de Argumentos', xpMinimo: 280, lema: 'Construye ideas con razones, pruebas y matices.' },
  { nivel: 5, nombre: 'Auditor de Algoritmos', xpMinimo: 450, lema: 'Descubre sesgos, vacíos y alucinaciones en la IA.' },
  { nivel: 6, nombre: 'Estratega Saber 11', xpMinimo: 680, lema: 'Descarta distractores con método y lectura rigurosa.' },
  { nivel: 7, nombre: 'Filósofo de San Gil', xpMinimo: 960, lema: 'Conecta el saber académico con la realidad de su región.' },
  { nivel: 8, nombre: 'Maestro Crítico Pombo', xpMinimo: 1300, lema: 'Piensa con autonomía, rigor e integridad intelectual.' },
];

export const CATALOGO_RETOS_DIARIOS: Array<{
  id: string;
  titulo: string;
  descripcion: string;
  meta: number;
  estrellas: number;
  xp: number;
  modoSugerido: string;
}> = [
  {
    id: 'reto-dialogo',
    titulo: 'Mente en diálogo',
    descripcion: 'Argumenta con tus propias palabras en tres intervenciones.',
    meta: 3,
    estrellas: 3,
    xp: 45,
    modoSugerido: 'socratico',
  },
  {
    id: 'reto-verificacion',
    titulo: 'Detective de fuentes',
    descripcion: 'Comprueba un dato en una fuente externa real.',
    meta: 1,
    estrellas: 4,
    xp: 60,
    modoSugerido: 'verificar',
  },
  {
    id: 'reto-saber-tutor',
    titulo: 'Rigor en acción',
    descripcion: 'Resuelve dos ejercicios en Saber 11 o en el Tutor.',
    meta: 2,
    estrellas: 4,
    xp: 55,
    modoSugerido: 'icfes',
  },
  {
    id: 'reto-metacognicion',
    titulo: 'Cultura y reflexión',
    descripcion: 'Completa una ronda cultural o el cierre de una sesión.',
    meta: 1,
    estrellas: 5,
    xp: 75,
    modoSugerido: 'explorar',
  },
];

export const INSIGNIAS_CATALOGO: InsigniaConfig[] = [
  {
    id: 'primera-chispa',
    nombre: 'Primera Chispa',
    descripcion: 'Formulaste tu primer planteamiento con criterio propio.',
    icono: 'sparkles',
    condicionTexto: 'Primera intervención argumentada',
  },
  {
    id: 'ojo-esceptico',
    nombre: 'Ojo Escéptico',
    descripcion: 'Contrastaste un dato en una fuente externa real.',
    icono: 'search-check',
    condicionTexto: 'Registrar una verificación externa',
  },
  {
    id: 'metodologia-aula',
    nombre: 'Fiel al Aula',
    descripcion: 'Subiste apuntes de clase o un borrador propio.',
    icono: 'book-open',
    condicionTexto: 'Subir apuntes o borrador propio',
  },
  {
    id: 'imparable-saber',
    nombre: 'Estratega Saber 11',
    descripcion: 'Acertaste tres preguntas oficiales del ICFES.',
    icono: 'award',
    condicionTexto: 'Tres aciertos en Saber 11',
  },
  {
    id: 'cazador-sesgos',
    nombre: 'Mente Enciclopédica',
    descripcion: 'Superaste una ronda del desafío de cultura general.',
    icono: 'zap',
    condicionTexto: 'Completar una ronda cultural',
  },
  {
    id: 'pensador-reflexivo',
    nombre: 'Pensador Metacognitivo',
    descripcion: 'Cerraste una sesión reflexionando sobre lo aprendido.',
    icono: 'compass',
    condicionTexto: 'Completar un cierre de sesión',
  },
  {
    id: 'explorador-integral',
    nombre: 'Explorador Integral',
    descripcion: 'Practicaste en cuatro estaciones distintas de estudio.',
    icono: 'layers',
    condicionTexto: 'Explorar cuatro modos distintos',
  },
  {
    id: 'orgullo-pombo',
    nombre: 'Orgullo Rafael Pombo',
    descripcion: 'Alcanzaste veinticinco estrellas con trabajo constante.',
    icono: 'crown',
    condicionTexto: 'Reunir 25 estrellas acumuladas',
  },
];

export const RECOMPENSAS_CANJEABLES: RecompensaTienda[] = [
  {
    id: 'item-escudo',
    nombre: 'Escudo de racha',
    descripcion: 'Conserva tu racha diaria si un día no puedes practicar.',
    costoEstrellas: 6,
    tipo: 'escudo',
    valor: 'escudo',
  },
  {
    id: 'item-comodin',
    nombre: 'Lupa crítica (+2 pistas)',
    descripcion: 'Suma dos pistas para usar en el desafío cultural.',
    costoEstrellas: 5,
    tipo: 'comodines',
    valor: '2',
  },
  {
    id: 'titulo-cazador',
    nombre: 'Cazador de Falacias',
    descripcion: 'Distinción visible junto a tu código de estudiante.',
    costoEstrellas: 10,
    tipo: 'titulo',
    valor: 'Cazador de Falacias',
  },
  {
    id: 'titulo-verificador',
    nombre: 'Guardián de la Evidencia',
    descripcion: 'Reconocimiento por contrastar datos con fuentes reales.',
    costoEstrellas: 18,
    tipo: 'titulo',
    valor: 'Guardián de la Evidencia',
  },
  {
    id: 'titulo-pombo',
    nombre: 'Mente Maestra Pombo',
    descripcion: 'Máxima distinción académica del Liceo Rafael Pombo.',
    costoEstrellas: 30,
    tipo: 'titulo',
    valor: 'Mente Maestra Pombo',
  },
];

export const PREGUNTAS_DESAFIO_RELAMPAGO: PreguntaDesafioRelampago[] = [
  // ==========================================================================
  // 1. COLOMBIA Y SANTANDER (10 preguntas)
  // ==========================================================================
  {
    id: 'cg-col-1',
    categoria: 'Colombia y Santander',
    contexto:
      'En marzo de 1781, en la provincia de Santander (Socorro y poblaciones vecinas como San Gil y Charalá), estalló uno de los movimientos sociales más importantes antes de la Independencia.',
    pregunta: '¿Cómo se conoce históricamente a este levantamiento y quién rompió el edicto de los nuevos impuestos?',
    opciones: [
      'La Rebelión de los Comuneros, iniciada por Manuela Beltrán.',
      'La Patria Boba neogranadina, liderada por Antonio Nariño.',
      'La Guerra de los Mil Días, promovida por liberales radicales.',
    ],
    correcta: 0,
    pista: 'Ocurrió en 1781 bajo el lema «¡Viva el Rey y muera el mal gobierno!» frente al impuesto de la Armada de Barlovento.',
    explicacion:
      'La Insurrección de los Comuneros (1781) nació en nuestra región santandereana cuando Manuela Beltrán rompió el edicto de impuestos en el Socorro, marcando un hito en la historia de América.',
  },
  {
    id: 'cg-col-2',
    categoria: 'Colombia y Santander',
    contexto:
      'Colombia es el único país de Suramérica con costas en dos océanos y tres cordilleras andinas, lo que le otorga una geografía única en el planeta.',
    pregunta: '¿En qué categoría de biodiversidad ocupa Colombia el PRIMER lugar a nivel mundial?',
    opciones: [
      'Variedad de especies de aves y de orquídeas.',
      'Extensión de arrecifes coralinos y manglares.',
      'Cantidad de mamíferos grandes de alta montaña.',
    ],
    correcta: 0,
    pista: 'Piensa en los cielos de nuestras selvas y páramos, y en la flor nacional (Cattleya trianae).',
    explicacion:
      'Colombia es el país número uno del mundo en diversidad de aves (más de 1.950 especies registradas) y de orquídeas (más de 4.200 especies).',
  },
  {
    id: 'cg-col-3',
    categoria: 'Colombia y Santander',
    contexto:
      'El río Fonce, emblema de San Gil y cuna del canotaje en Santander, recorre la provincia de Guanentá antes de unir sus aguas con otro gran río santandereano.',
    pregunta: '¿En qué río desemboca el río Fonce y hacia qué gran cuenca hidrográfica de Colombia fluyen finalmente sus aguas?',
    opciones: [
      'En el río Suárez, hacia la cuenca del río Magdalena.',
      'En el río Cauca, rumbo a las llanuras del Caribe.',
      'En el río Chicamocha, directo hacia el río Orinoco.',
    ],
    correcta: 0,
    pista: 'El río Fonce se une al río Suárez cerca de San Gil/Galán, el cual luego forma el río Sogamoso tributario del Magdalena.',
    explicacion:
      'El río Fonce entrega sus aguas al río Suárez; este confluye con el río Chicamocha para formar el río Sogamoso, uno de los principales afluentes del río Magdalena.',
  },
  {
    id: 'cg-col-4',
    categoria: 'Colombia y Santander',
    contexto:
      'En el Museo del Oro de Bogotá se conserva una famosa pieza muisca hallada en Pasca (Cundinamarca), que representa la ceremonia de investidura del nuevo Zipa en la laguna de Guatavita.',
    pregunta: '¿Qué leyenda mundial nació a partir de esta ceremonia indígena y cómo se llama la pieza de orfebrería?',
    opciones: [
      'La leyenda de El Dorado y la Balsa Muisca.',
      'La leyenda de Bachué en el Poporo Quimbaya.',
      'El mito de Bochica en monolitos de San Agustín.',
    ],
    correcta: 0,
    pista: 'El heredero cubría su cuerpo con polvo de oro y se sumergía en las aguas sagradas de la laguna.',
    explicacion:
      'La Balsa Muisca recrea el rito de la laguna de Guatavita que dio origen a la leyenda de El Dorado, motor de numerosas expediciones en el siglo XVI.',
  },
  {
    id: 'cg-col-5',
    categoria: 'Colombia y Santander',
    contexto:
      'El 4 de agosto de 1819, pocos días antes de la Batalla del Puente de Boyacá, los habitantes de una población vecina a San Gil enfrentaron a las tropas realistas de Lucas González para impedir que reforzaran a Barreiro.',
    pregunta: '¿Cómo se conoce a esta batalla decisiva librada a orillas del río Pienta en territorio santandereano?',
    opciones: [
      'La Batalla del Pienta en el municipio de Charalá.',
      'La Batalla del Pantano de Vargas en tierras boyacenses.',
      'La Batalla de Palonegro cerca de la ciudad de Bucaramanga.',
    ],
    correcta: 0,
    pista: 'Se libró en la vecina población de Charalá y detuvo durante tres días el refuerzo militar realista.',
    explicacion:
      'El sacrificio del pueblo de Charalá en la Batalla del Pienta (4 de agosto de 1819) impidió que 800 soldados realistas llegaran a Tunja, facilitando el triunfo patriota el 7 de agosto.',
  },
  {
    id: 'cg-col-6',
    categoria: 'Colombia y Santander',
    contexto:
      'Antes de la llegada de los conquistadores españoles en el siglo XVI, las escarpadas montañas, mesas y cañones entre los ríos Chicamocha, Suárez y Fonce estaban habitados por un pueblo indígena de lengua chibcha.',
    pregunta: '¿Qué pueblo indígena habitó la provincia de Guanentá y la Mesa de Jéridas dejando pictografías y tejidos de algodón?',
    opciones: [
      'El pueblo Guane de las montañas santandereanas.',
      'La cultura Tayrona de las estribaciones costeñas.',
      'La confederación Zenú de las sabanas inundables.',
    ],
    correcta: 0,
    pista: 'De su cacique Guanentá proviene el nombre de nuestra provincia con capital en San Gil.',
    explicacion:
      'Los Guanes habitaron el cañón del Chicamocha, la Mesa de los Santos, Barichara y el valle del río Fonce, destacándose como tejedores de mantas de algodón y alfareros.',
  },
  {
    id: 'cg-col-7',
    categoria: 'Colombia y Santander',
    contexto:
      'El Parque Natural El Gallineral, ubicado en una isla de 4 hectáreas formada entre el río Fonce y la quebrada Curití en San Gil, debe su nombre a una planta epífita que cuelga de sus ceibas y anacos.',
    pregunta: '¿Qué tipo de planta son las «barbas de viejo» (Tillandsia usneoides) que adornan los árboles del parque?',
    opciones: [
      'Una bromelia epífita que absorbe humedad del aire.',
      'Un hongo parásito que extrae savia de las raíces.',
      'Un helecho acuático que crece bajo piedras del río.',
    ],
    correcta: 0,
    pista: 'No es un parásito ni un musgo: vive sobre las ramas sin dañar el árbol y capta agua de la brisa del río Fonce.',
    explicacion:
      'El musgo español o «barba de viejo» (Tillandsia usneoides) es una planta angiosperma de la familia de las bromelias (como la piña) que vive como epífita sin parasitar al árbol.',
  },
  {
    id: 'cg-col-8',
    categoria: 'Colombia y Santander',
    contexto:
      'En el macizo montañoso entre Santander y Norte de Santander se encuentra una fábrica natural de agua dulce que abastece a más de dos millones de personas en Bucaramanga, Cúcuta y decenas de municipios.',
    pregunta: '¿Cómo se llama este ecosistema estratégico de alta montaña caracterizado por sus frailejones?',
    opciones: [
      'El Páramo de Santurbán en la cordillera Oriental.',
      'El Parque Nacional Natural Los Nevados del Ruiz.',
      'La Serranía de la Macarena en la cuenca del Guaviare.',
    ],
    correcta: 0,
    pista: 'Sus frailejones atrapan la niebla andina por encima de los 3.000 metros sobre el nivel del mar en Santander.',
    explicacion:
      'El Páramo de Santurbán regula el ciclo hídrico de Santander y Norte de Santander; sus suelos y frailejones retienen el agua de la neblina y alimentan ríos vitales.',
  },
  {
    id: 'cg-col-9',
    categoria: 'Colombia y Santander',
    contexto:
      'A solo 20 kilómetros de San Gil se levanta un municipio declarado Monumento Nacional en 1978 por su arquitectura en piedra amarilla labrada a mano y sus caminos reales construidos por comunidades indígenas y coloniales.',
    pregunta: '¿De qué municipio de la provincia de Guanentá se trata y con qué pueblo se conecta por el Camino Real?',
    opciones: [
      'Barichara, conectado por camino de piedra con Guane.',
      'Vélez, comunicado por trocha real con Puente Nacional.',
      'Girón, enlazado por puentes coloniales con Floridablanca.',
    ],
    correcta: 0,
    pista: 'Su nombre en lengua guane significa «lugar de descanso» y sus calles están pavimentadas en piedra caliza.',
    explicacion:
      'Barichara conserva intacta su traza colonial en tapia pisada y piedra labrada, y su histórico Camino Real desciende hasta el centro poblado de Guane a orillas del río Suárez.',
  },
  {
    id: 'cg-col-10',
    categoria: 'Colombia y Santander',
    contexto:
      'Promulgada el 4 de julio de 1991 por una Asamblea Nacional Constituyente tras el movimiento estudiantil de la «Séptima Papeleta», la actual Constitución de Colombia introdujo mecanismos directos para proteger los derechos fundamentales.',
    pregunta: '¿Qué mecanismo constitucional permite a cualquier ciudadano reclamar ante un juez la protección inmediata de sus derechos fundamentales?',
    opciones: [
      'La Acción de Tutela consagrada en el artículo 86.',
      'El Referendo Constitucional aprobado en el Congreso.',
      'El Cabildo Abierto convocado por las juntas locales.',
    ],
    correcta: 0,
    pista: 'Debe ser resuelta por el juez en un plazo máximo de diez días cuando un derecho fundamental está amenazado.',
    explicacion:
      'La Acción de Tutela (artículo 86 de la Constitución de 1991) transformó la justicia colombiana al permitir a cualquier persona defender derechos como la salud, la vida y la educación.',
  },

  // ==========================================================================
  // 2. MATEMÁTICAS Y LÓGICA (10 preguntas)
  // ==========================================================================
  {
    id: 'cg-mat-1',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'En una famosa paradoja de crecimiento exponencial, un nenúfar en un lago duplica su tamaño cada día. Si el lago entero tarda exactamente 30 días en cubrirse por completo con la planta:',
    pregunta: '¿En qué día estuvo el lago cubierto exactamente hasta la MITAD de su superficie?',
    opciones: [
      'En el día 29, un día antes de llenarse.',
      'En el día 15, justo a la mitad del mes.',
      'En el día 20, tras dos tercios del ciclo.',
    ],
    correcta: 0,
    pista: 'Si cada día duplica su área y el día 30 llega al 100 %, piensa qué porcentaje tenía el día inmediatamente anterior.',
    explicacion:
      'Al duplicarse cada día, el día 29 cubría la mitad (50 %) del lago, y al duplicarse una vez más en el día 30 alcanzó el 100 %. Es una trampa clásica de intuición lineal frente a crecimiento exponencial.',
  },
  {
    id: 'cg-mat-2',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'Un comerciante en el mercado de San Gil sube el precio de un saco de café en un 20 % durante la cosecha baja, y semanas después aplica un descuento del 20 % sobre ese nuevo precio.',
    pregunta: 'En comparación con el precio original de partida, ¿cómo queda el precio final del saco de café?',
    opciones: [
      'Queda un 4 % más barato que el precio inicial.',
      'Vuelve exactamente al mismo valor del principio.',
      'Termina un 2 % más costoso que el precio original.',
    ],
    correcta: 0,
    pista: 'Si el saco costaba $100, subir 20 % lo lleva a $120. Ahora calcula cuánto es el 20 % de $120.',
    explicacion:
      'Si empezamos en 100, +20 % da 120. El 20 % de 120 es 24, y 120 − 24 = 96. Como el descuento se calcula sobre una base mayor, el precio final es el 96 % del inicial (4 % menos).',
  },
  {
    id: 'cg-mat-3',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'Observa la famosa sucesión matemática descrita en 1202 por Leonardo de Pisa: 1, 1, 2, 3, 5, 8, 13, 21, 34... Esta serie aparece en la disposición de las semillas del girasol y las piñas de los pinos.',
    pregunta: '¿Cómo se llama esta sucesión y cuál es el número que sigue inmediatamente después del 34?',
    opciones: [
      'Sucesión de Fibonacci y el siguiente número es 55.',
      'Progresión de Gauss y el siguiente término es 52.',
      'Serie de Pitágoras y el siguiente elemento es 68.',
    ],
    correcta: 0,
    pista: 'Cada término se obtiene sumando los dos números inmediatamente anteriores de la lista (21 + 34).',
    explicacion:
      'En la sucesión de Fibonacci cada término es la suma de los dos anteriores: 21 + 34 = 55. Además, el cociente entre números consecutivos se aproxima al número áureo (φ ≈ 1,618).',
  },
  {
    id: 'cg-mat-4',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'Los números primos son aquellos mayores que 1 que solo tienen dos divisores positivos distintos: el 1 y ellos mismos. Son considerados los «ladrillos fundamentales» de la aritmética.',
    pregunta: '¿Cuál es el único número primo que es PAR y por qué el número 1 no se clasifica como primo?',
    opciones: [
      'El 2 es el único par primo; el 1 tiene un solo divisor.',
      'El 4 es el menor par primo; el 1 es un número neutro.',
      'No existen primos pares; el 1 divide a todos los demás.',
    ],
    correcta: 0,
    pista: 'Cualquier otro número par mayor que 2 se puede dividir entre 2, por lo que tendría al menos tres divisores.',
    explicacion:
      'El 2 es el único número primo par. El 1 no se considera primo porque solo tiene un divisor positivo (él mismo) y excluirlo garantiza el Teorema Fundamental de la Aritmética.',
  },
  {
    id: 'cg-mat-5',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'En arquitectura y topografía se usa a diario un triángulo rectángulo clásico cuyos dos catetos miden 3 metros y 4 metros para verificar esquinas de 90 grados sin transportador.',
    pregunta: 'Según el Teorema de Pitágoras (a² + b² = c²), ¿cuánto mide exactamente la hipotenusa de ese triángulo?',
    opciones: [
      'Mide exactamente 5 metros de longitud.',
      'Mide exactamente 7 metros de diagonal.',
      'Mide exactamente 6 metros de extremo.',
    ],
    correcta: 0,
    pista: 'Calcula 3² + 4² = 9 + 16 = 25, y luego halla la raíz cuadrada de ese resultado.',
    explicacion:
      'La terna pitagórica (3, 4, 5) cumple que 3² + 4² = 9 + 16 = 25, y √25 = 5. Los antiguos constructores egipcios usaban una cuerda con 12 nudos (3 + 4 + 5) para trazar ángulos rectos.',
  },
  {
    id: 'cg-mat-6',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'En lógica formal y pensamiento crítico, si sabemos con certeza que la proposición «Si llueve en San Gil, entonces crece el caudal del río Fonce» es verdadera:',
    pregunta: '¿Qué podemos concluir con total rigor lógico si observamos que el caudal del río Fonce NO creció?',
    opciones: [
      'Que no llovió en San Gil (ley del contrarrecíproco).',
      'Que llovió muy poco en las montañas de Barichara.',
      'Que siempre que crece el río es porque antes llovió.',
    ],
    correcta: 0,
    pista: 'Si P implica Q (P → Q), y sabemos que Q es falso (¬Q), entonces P tampoco pudo haber ocurrido (Modus Tollens).',
    explicacion:
      'Por la regla lógica Modus Tollens (o contrarrecíproco), si «P → Q» es verdadero y se observa «no Q», necesariamente se deduce «no P»: no llovió en San Gil.',
  },
  {
    id: 'cg-mat-7',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'En estadística (muy evaluada en la prueba Saber 11), cuando en un grupo de 9 trabajadores ocho ganan $1.500.000 y el gerente gana $25.000.000, el promedio aritmético se distorsiona fuertemente.',
    pregunta: '¿Qué medida de tendencia central ordena los datos de menor a mayor y toma el valor central sin alterarse por valores extremos?',
    opciones: [
      'La mediana, que ocupa la posición central de los datos.',
      'La media aritmética, que divide la suma entre el total.',
      'La varianza muestral, que eleva las distancias al cuadrado.',
    ],
    correcta: 0,
    pista: 'Divide el conjunto ordenado en dos mitades con igual cantidad de elementos a cada lado.',
    explicacion:
      'La mediana (en este caso $1.500.000, el quinto dato ordenado) es robusta frente a valores atípicos o extremos, a diferencia del promedio o media aritmética.',
  },
  {
    id: 'cg-mat-8',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'Se cuenta que cuando el matemático alemán Carl Friedrich Gauss era niño, su maestro pidió sumar todos los números enteros del 1 al 100 (1 + 2 + 3 + ... + 99 + 100) pensando que tardarían una hora.',
    pregunta: '¿Qué resultado obtuvo Gauss en pocos segundos al emparejar los extremos (1+100, 2+99, 3+98...)?',
    opciones: [
      '5.050, al multiplicar 50 parejas que suman 101 cada una.',
      '5.000, al multiplicar 100 términos por su mitad exacta.',
      '4.950, al agrupar 49 parejas simétricas alrededor del 50.',
    ],
    correcta: 0,
    pista: 'Hay 50 parejas de números (1+100=101, 2+99=101, ..., 50+51=101). Multiplica 50 × 101.',
    explicacion:
      'Gauss notó que al emparejar el primero con el último se forman 50 pares cuya suma siempre es 101: 50 × 101 = 5.050. De ahí nace la fórmula n(n+1)/2.',
  },
  {
    id: 'cg-mat-9',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'Lanzas una moneda honesta (no trucada) al aire 4 veces seguidas y en las 4 ocasiones cae «cara». Estás a punto de realizar el quinto lanzamiento.',
    pregunta: '¿Cuál es la probabilidad matemática real de que en el quinto lanzamiento vuelva a salir «cara»?',
    opciones: [
      'Exactamente 50 % (1/2), pues la moneda no tiene memoria.',
      'Mucho menor al 50 %, porque ya toca equilibrar con sello.',
      'Cerca del 90 %, porque la moneda lleva una racha de caras.',
    ],
    correcta: 0,
    pista: 'Cada lanzamiento es un evento estadísticamente independiente de los anteriores; creer lo contrario es la «falacia del apostador».',
    explicacion:
      'En eventos independientes, los resultados pasados no alteran las probabilidades futuras: la probabilidad en el quinto lanzamiento sigue siendo exactamente 1/2 (50 %).',
  },
  {
    id: 'cg-mat-10',
    categoria: 'Matemáticas y Lógica',
    contexto:
      'Si 5 impresoras del laboratorio del colegio tardan exactamente 5 minutos en imprimir 5 cuadernillos de estudio trabajando al mismo ritmo constante:',
    pregunta: '¿Cuánto tiempo tardarán 100 impresoras idénticas trabajando simultáneamente en imprimir 100 cuadernillos?',
    opciones: [
      'Exactamente 5 minutos trabajando todas al mismo tiempo.',
      'Exactamente 100 minutos por el volumen total de hojas.',
      'Apenas 1 minuto al dividir el trabajo entre cien máquinas.',
    ],
    correcta: 0,
    pista: 'Analiza primero cuánto tarda UNA sola impresora en producir UN solo cuadernillo.',
    explicacion:
      'Si 5 impresoras hacen 5 cuadernillos en 5 minutos, significa que cada impresora tarda 5 minutos en hacer 1 cuadernillo. Por tanto, 100 impresoras trabajando a la vez harán 100 cuadernillos en esos mismos 5 minutos.',
  },

  // ==========================================================================
  // 3. GEOGRAFÍA Y PLANETA (10 preguntas)
  // ==========================================================================
  {
    id: 'cg-geo-1',
    categoria: 'Geografía y Planeta',
    contexto:
      'Al entrar a territorio colombiano por el Macizo Colombiano (o Nudo de los Pastos), la gran Cordillera de los Andes se divide en tres ramales: Occidental, Central y Oriental.',
    pregunta: '¿Qué grandes valles interandinos separan a nuestras tres cordilleras y qué ríos los recorren de sur a norte?',
    opciones: [
      'El valle del río Cauca y el valle del río Magdalena.',
      'El valle del río Orinoco y la cuenca del río Amazonas.',
      'El cañón del río Patía y la depresión del río Atrato.',
    ],
    correcta: 0,
    pista: 'Uno corre entre las cordilleras Occidental y Central, y el otro entre la Central y la Oriental.',
    explicacion:
      'El río Cauca corre entre las cordilleras Occidental y Central, mientras que el río Magdalena fluye entre la Central y la Oriental antes de unirse en la Depresión Momposina rumbo al mar Caribe.',
  },
  {
    id: 'cg-geo-2',
    categoria: 'Geografía y Planeta',
    contexto:
      'Aunque el monte Everest (8.848 m) es la cumbre de mayor altitud sobre el nivel del mar, la montaña más alta de la Tierra junto al mar —y la cima más alta de Colombia— está en nuestra costa Caribe.',
    pregunta: '¿Cómo se llama este macizo montañoso colombiano cuyos picos Bolívar y Colón alcanzan unos 5.775 metros a pocos kilómetros del mar?',
    opciones: [
      'La Sierra Nevada de Santa Marta en el Caribe colombiano.',
      'El Parque Nacional Natural El Cocuy en Boyacá y Arauca.',
      'La Serranía del Perijá en la frontera con Venezuela.',
    ],
    correcta: 0,
    pista: 'Es un sistema montañoso independiente de la cordillera de los Andes y posee todos los pisos térmicos.',
    explicacion:
      'La Sierra Nevada de Santa Marta es la formación montañosa litoral más alta del planeta, elevándose desde las playas del mar Caribe hasta las nieves perpetuas en apenas 42 kilómetros.',
  },
  {
    id: 'cg-geo-3',
    categoria: 'Geografía y Planeta',
    contexto:
      'América del Sur y África tienen perfiles costeros que parecen encajar como piezas de un rompecabezas. En 1912, el geofísico alemán Alfred Wegener propuso que hace unos 250 millones de años todos los continentes formaban una sola masa.',
    pregunta: '¿Cómo llamó Wegener a ese supercontinente primitivo y qué teoría geológica explica hoy el movimiento de la corteza terrestre?',
    opciones: [
      'Pangea, explicada hoy por la teoría de la tectónica de placas.',
      'Gondwana, impulsada únicamente por las mareas gravitatorias.',
      'Atlántida, desplazada por la rotación centrífuga del ecuador.',
    ],
    correcta: 0,
    pista: 'Su nombre proviene del griego «pan» (toda) y «gea» (Tierra), y se fragmentó por corrientes de convección del manto.',
    explicacion:
      'Pangea fue el supercontinente que agrupó las tierras emergidas; la tectónica de placas demostró que la litosfera se divide en placas que se desplazan sobre la astenosfera.',
  },
  {
    id: 'cg-geo-4',
    categoria: 'Geografía y Planeta',
    contexto:
      'Existe un único mar en la Tierra que no tiene costas terrestres en absoluto: sus límites están definidos íntegramente por corrientes oceánicas del Atlántico Norte y en sus aguas flotan algas pardas.',
    pregunta: '¿Cuál es el nombre de este singular mar oceánico donde además desovan las anguilas europeas y americanas?',
    opciones: [
      'El Mar de los Sargazos en el giro del Atlántico Norte.',
      'El Mar de Bering entre las costas de Alaska y Siberia.',
      'El Mar Rojo entre la península arábiga y el noreste africano.',
    ],
    correcta: 0,
    pista: 'Está rodeado por la Corriente del Golfo, la del Atlántico Norte, la de Canarias y la Ecuatorial del Norte.',
    explicacion:
      'El Mar de los Sargazos es el único mar del mundo sin riberas continentales; debe su nombre a las algas del género Sargassum que forman un ecosistema flotante único.',
  },
  {
    id: 'cg-geo-5',
    categoria: 'Geografía y Planeta',
    contexto:
      'En el extremo occidental de Suramérica y a lo largo de Japón, Filipinas, Indonesia, Nueva Zelanda y toda la costa pacífica de América se concentra cerca del 90 % de los terremotos y el 75 % de los volcanes del planeta.',
    pregunta: '¿Cómo se denomina geográficamente a esta extensa zona de subducción tectónica que bordea el océano más grande del mundo?',
    opciones: [
      'El Cinturón de Fuego del Pacífico (o Anillo de Fuego).',
      'La Dorsal Mesoatlántica de expansión submarina.',
      'El Gran Valle del Rift de la placa tectónica africana.',
    ],
    correcta: 0,
    pista: 'Colombia forma parte de este cinturón debido al choque entre la placa de Nazca y la placa Sudamericana.',
    explicacion:
      'El Cinturón de Fuego del Pacífico abarca unos 40.000 km en forma de herradura donde varias placas oceánicas se hunden (subducen) bajo placas continentales, generando vulcanismo y sismicidad.',
  },
  {
    id: 'cg-geo-6',
    categoria: 'Geografía y Planeta',
    contexto:
      'Durante siglos se debatió cuál era el río más caudaloso y largo de la Tierra. Este coloso nace en la cordillera de los Andes, baña el trapecio amazónico colombiano en Leticia y descarga al Atlántico una quinta parte del agua dulce fluvial del mundo.',
    pregunta: '¿De qué río se trata y qué otro gran río africano disputa históricamente el récord de longitud?',
    opciones: [
      'El río Amazonas en Suramérica y el río Nilo en África.',
      'El río Orinoco en Venezuela y el río Congo en África.',
      'El río Paraná en el Cono Sur y el río Yangtsé en Asia.',
    ],
    correcta: 0,
    pista: 'El río suramericano supera los 200.000 metros cúbicos por segundo de caudal medio, más que los siguientes siete ríos juntos.',
    explicacion:
      'El río Amazonas es indiscutiblemente el río más caudaloso y con la mayor cuenca hidrográfica del planeta (7 millones de km²), compartiendo con el Nilo el podio de los más largos (~6.992 km vs ~6.853 km).',
  },
  {
    id: 'cg-geo-7',
    categoria: 'Geografía y Planeta',
    contexto:
      'Mucha gente cree que un desierto es siempre un lugar de dunas de arena abrasadora; sin embargo, en geografía y climatología un desierto se define por su bajísima precipitación anual (menos de 250 mm de lluvia al año).',
    pregunta: 'Bajo esta definición científica, ¿cuál es el desierto más extenso de todo el planeta Tierra?',
    opciones: [
      'El Desierto Antártico en el polo sur, seguido por el Ártico.',
      'El Desierto del Sahara en el norte del continente africano.',
      'El Desierto de Atacama en la franja costera del norte de Chile.',
    ],
    correcta: 0,
    pista: 'Los dos desiertos más grandes de la Tierra son desiertos polares helados; el Sahara es el mayor de los cálidos.',
    explicacion:
      'La Antártida (con unos 14 millones de km² y precipitaciones interiores menores a 50 mm anuales) es el desierto más grande del planeta; el Sahara (~9,2 millones de km²) es el mayor desierto cálido.',
  },
  {
    id: 'cg-geo-8',
    categoria: 'Geografía y Planeta',
    contexto:
      'Para localizar cualquier punto sobre la esfera terrestre y definir los husos horarios, los cartógrafos trazaron una red de líneas imaginarias: paralelos horizontales y meridianos verticales.',
    pregunta: '¿Cuáles son las dos líneas de referencia principales (0° de latitud y 0° de longitud) y por qué país suramericano pasa la primera?',
    opciones: [
      'La Línea del Ecuador (que cruza Colombia) y el Meridiano de Greenwich.',
      'El Trópico de Cáncer (que cruza Panamá) y el Meridiano de París.',
      'El Círculo Polar Ártico y la Línea Internacional de Cambio de Fecha.',
    ],
    correcta: 0,
    pista: 'El paralelo 0° atraviesa el sur de Colombia (Putumayo, Caquetá, Vaupés y Amazonas) dividiendo la Tierra en hemisferio norte y sur.',
    explicacion:
      'El paralelo 0° es el Ecuador terrestre (que atraviesa el sur de Colombia, Ecuador y Brasil) y el meridiano 0° es el Meridiano de Greenwich (Londres), base del Tiempo Universal Coordinado (UTC).',
  },
  {
    id: 'cg-geo-9',
    categoria: 'Geografía y Planeta',
    contexto:
      'A diferencia de las latitudes templadas que tienen cuatro estaciones (primavera, verano, otoño e invierno) por la inclinación del eje terrestre, en los Andes colombianos la temperatura cambia al subir o bajar de las montañas.',
    pregunta: '¿Cómo se denomina este fenómeno geográfico de nuestras montañas y cuáles son sus franjas desde el nivel del mar hasta las cumbres?',
    opciones: [
      'Pisos térmicos: cálido, templado, frío, páramo y nieves perpetuas.',
      'Zonas monzónicas: ecuatorial, tropical, subtropical y polar andina.',
      'Corrientes convectivas: basal, fluvial, boscosa, esteparia y glaciar.',
    ],
    correcta: 0,
    pista: 'San Gil (~1.114 m s. n. m.) goza de piso térmico templado, mientras que Bogotá (2.600 m) está en piso frío.',
    explicacion:
      'En la zona intertropical andina la temperatura disminuye unos 0,6 °C por cada 100 metros de altitud, dando origen a los pisos térmicos estudiados desde la Expedición Botánica y Caldas.',
  },
  {
    id: 'cg-geo-10',
    categoria: 'Geografía y Planeta',
    contexto:
      'En el Pacífico occidental, cerca de las islas Marianas, la corteza oceánica se hunde formando el abismo submarino más profundo conocido en los océanos de la Tierra.',
    pregunta: '¿Cómo se llama esta fosa oceánica y qué profundidad aproximada alcanza su punto más hondo (el Abismo Challenger)?',
    opciones: [
      'La Fosa de las Marianas, con casi 11.000 metros de profundidad.',
      'La Fosa de Puerto Rico, con cerca de 8.400 metros bajo el mar.',
      'La Fosa de Atacama, con alrededor de 8.065 metros de hondura.',
    ],
    correcta: 0,
    pista: 'Si colocáramos el monte Everest en su fondo, a su cumbre aún le faltarían más de 2 kilómetros para llegar a la superficie del agua.',
    explicacion:
      'La Fosa de las Marianas alcanza unos 10.994 metros de profundidad en el Abismo Challenger, donde la presión supera en más de mil veces la presión atmosférica al nivel del mar.',
  },

  // ==========================================================================
  // 4. CIENCIA Y UNIVERSO (10 preguntas)
  // ==========================================================================
  {
    id: 'cg-cie-1',
    categoria: 'Ciencia y Universo',
    contexto:
      'Aunque el Sol se encuentra a unos 150 millones de kilómetros de la Tierra y la luz viaja en el vacío a casi 300.000 km por segundo, su luz no llega de forma instantánea.',
    pregunta: '¿Cuánto tiempo tarda aproximadamente un rayo de luz desde la superficie del Sol en llegar hasta nuestros ojos en la Tierra?',
    opciones: [
      'Aproximadamente 8 minutos y 20 segundos en llegar.',
      'Menos de 2 segundos al viajar por el vacío espacial.',
      'Alrededor de 24 horas durante la rotación terrestre.',
    ],
    correcta: 0,
    pista: 'Divide 150.000.000 km entre 300.000 km/s: obtendrás 500 segundos.',
    explicacion:
      '500 segundos equivalen a 8 minutos y 20 segundos. Eso significa que cada vez que miramos el cielo diurno, vemos al Sol tal como era hace más de 8 minutos.',
  },
  {
    id: 'cg-cie-2',
    categoria: 'Ciencia y Universo',
    contexto:
      'En 1928, el científico escocés Alexander Fleming regresó a su laboratorio y notó que un hongo (Penicillium notatum) había contaminado accidentalmente una placa de Petri, impidiendo que crecieran las bacterias alrededor.',
    pregunta: '¿Qué revolucionario descubrimiento médico surgió de esa observación curiosa?',
    opciones: [
      'La penicilina, el primer antibiótico de uso médico.',
      'La vacuna antirrábica mediante virus atenuados.',
      'La pasteurización térmica para eliminar bacterias.',
    ],
    correcta: 0,
    pista: 'Inauguró la era de los antibióticos en la medicina moderna.',
    explicacion:
      'En lugar de tirar la muestra contaminada, Fleming se preguntó «¿por qué no crecen bacterias cerca del moho?». Así nació la penicilina.',
  },
  {
    id: 'cg-cie-3',
    categoria: 'Ciencia y Universo',
    contexto:
      'En la tabla periódica de los elementos, la mayoría de los símbolos coinciden con sus iniciales en español, pero varios provienen de sus antiguos nombres en latín o griego.',
    pregunta: '¿Cuáles son los símbolos químicos correctos del Oro, la Plata, el Hierro y el Sodio?',
    opciones: [
      'Oro: Au, Plata: Ag, Hierro: Fe y Sodio: Na.',
      'Oro: Or, Plata: Pl, Hierro: Hi y Sodio: So.',
      'Oro: Ag, Plata: Au, Hierro: He y Sodio: Sd.',
    ],
    correcta: 0,
    pista: 'Recuerda palabras como «áureo» (oro), «Argentina» (tierra de plata) y «férreo» (hierro).',
    explicacion:
      'Los símbolos universales de la IUPAC conservan raíces latinas: Au (Aurum), Ag (Argentum), Fe (Ferrum) y Na (Natrium). ¡Clave para química y el Saber 11!',
  },
  {
    id: 'cg-cie-4',
    categoria: 'Ciencia y Universo',
    contexto:
      'A menudo se dice que la Selva Amazónica es el único «pulmón del planeta», pero la mayor parte del oxígeno que se libera a la atmósfera terrestre proviene de otro ecosistema.',
    pregunta: '¿Qué organismos producen más del 50 % del oxígeno del planeta Tierra mediante la fotosíntesis?',
    opciones: [
      'El fitoplancton marino y las cianobacterias de los océanos.',
      'Los bosques boreales de coníferas en el hemisferio norte.',
      'Las selvas húmedas tropicales del Congo y el sudeste asiático.',
    ],
    correcta: 0,
    pista: 'Los océanos cubren más del 70 % de la superficie de la Tierra y están llenos de vida microscópica fotosintética.',
    explicacion:
      'El fitoplancton oceánico realiza más de la mitad de la fotosíntesis global, capturando carbono y liberando la mayor proporción del oxígeno de la atmósfera.',
  },
  {
    id: 'cg-cie-5',
    categoria: 'Ciencia y Universo',
    contexto:
      'En 1903 y 1911, una científica nacida en Varsovia (Polonia) y nacionalizada francesa hizo historia al convertirse en la primera persona en recibir dos Premios Nobel en distintas especialidades científicas.',
    pregunta: '¿Quién fue esta extraordinaria científica y en qué dos disciplinas recibió el Premio Nobel?',
    opciones: [
      'Marie Curie, galardonada en Física y en Química.',
      'Rosalind Franklin, premiada en Biología y en Física.',
      'Ada Lovelace, distinguida en Matemáticas y en Física.',
    ],
    correcta: 0,
    pista: 'Descubrió los elementos radiactivos polonio (en honor a su patria) y radio junto a Pierre Curie.',
    explicacion:
      'Marie Skłodowska-Curie ganó el Nobel de Física en 1903 (por sus investigaciones sobre la radiación) y el Nobel de Química en 1911 (por aislar el radio y descubrir el polonio).',
  },
  {
    id: 'cg-cie-6',
    categoria: 'Ciencia y Universo',
    contexto:
      'En el núcleo de cada célula humana se almacena el manual de instrucciones genéticas en una molécula con forma de doble hélice, cuya estructura fue dilucidada en 1953 gracias a las fotografías de difracción de rayos X de Rosalind Franklin y el modelo de Watson y Crick.',
    pregunta: '¿Cuáles son las cuatro bases nitrogenadas del ADN y cómo se emparejan siempre entre sí?',
    opciones: [
      'Adenina con Timina (A-T) y Citosina con Guanina (C-G).',
      'Adenina con Guanina (A-G) y Citosina con Uracilo (C-U).',
      'Timina con Citosina (T-C) y Guanina con Uracilo (G-U).',
    ],
    correcta: 0,
    pista: 'Recuerda la regla mnemotécnica clásica de biología: «Aníbal Troilo (A-T) y Carlos Gardel (C-G)».',
    explicacion:
      'En el ADN, la Adenina se une siempre con la Timina mediante dos puentes de hidrógeno, y la Citosina con la Guanina mediante tres puentes de hidrógeno (en el ARN la Timina es reemplazada por Uracilo).',
  },
  {
    id: 'cg-cie-7',
    categoria: 'Ciencia y Universo',
    contexto:
      'Cuando viajas de pie en un autobús y el conductor frena de repente, tu cuerpo tiende a seguir moviéndose hacia adelante con la velocidad que traía.',
    pregunta: '¿Cuál de las tres leyes del movimiento de Isaac Newton explica directamente este fenómeno?',
    opciones: [
      'La Primera Ley de Newton o Principio de Inercia.',
      'La Tercera Ley de Newton de Acción y Reacción.',
      'La Ley de la Gravitación Universal de las masas.',
    ],
    correcta: 0,
    pista: 'Establece que todo cuerpo persevera en su estado de reposo o movimiento rectilíneo uniforme a menos que actúe una fuerza neta sobre él.',
    explicacion:
      'La Primera Ley de Newton (Inercia) explica que, al frenar el autobús, las ruedas se detienen por la fricción con el asfalto, pero tu cuerpo tiende a conservar su velocidad inicial.',
  },
  {
    id: 'cg-cie-8',
    categoria: 'Ciencia y Universo',
    contexto:
      'Al respirar inhalamos aire para obtener oxígeno, pero el oxígeno ni siquiera es el gas más abundante de la atmósfera que rodea la Tierra.',
    pregunta: '¿Cuál es el gas que compone aproximadamente el 78 % del aire que respiramos a diario?',
    opciones: [
      'El nitrógeno molecular (N₂), seguido por el oxígeno (21 %).',
      'El oxígeno puro (O₂), seguido por el dióxido de carbono.',
      'El vapor de agua (H₂O), seguido por el gas noble argón.',
    ],
    correcta: 0,
    pista: 'Representa casi cuatro quintas partes del aire seco y es indispensable para el ciclo de las proteínas en las plantas.',
    explicacion:
      'La atmósfera terrestre seca está compuesta por un 78 % de nitrógeno (N₂), un 21 % de oxígeno (O₂), un 0,93 % de argón y cerca de 0,04 % de dióxido de carbono (CO₂).',
  },
  {
    id: 'cg-cie-9',
    categoria: 'Ciencia y Universo',
    contexto:
      'En 1958, un ingeniero electrónico e inventor colombiano creó un dispositivo médico implantable que transformó la cardiología mundial y ha salvado decenas de millones de vidas.',
    pregunta: '¿Quién fue este científico colombiano y qué inventó junto al cirujano Rune Elmqvist?',
    opciones: [
      'Jorge Reynolds Pombo, creador del marcapasos cardíaco.',
      'Salomón Hakim Dow, inventor de la válvula cerebral.',
      'Manuel Elkin Patarroyo, autor de la vacuna sintética.',
    ],
    correcta: 0,
    pista: 'Curiosamente, su segundo apellido es Pombo (descendiente de la familia de Rafael Pombo) y su invento regula los latidos del corazón con impulsos eléctricos.',
    explicacion:
      'El ingeniero colombiano Jorge Reynolds Pombo diseñó el primer marcapasos artificial externo con electrodos internos Exitoso, hito de la bioingeniería mundial (mientras que Salomón Hakim inventó la válvula para la hidrocefalia).',
  },
  {
    id: 'cg-cie-10',
    categoria: 'Ciencia y Universo',
    contexto:
      'Casi todos los líquidos de la naturaleza se contraen y se vuelven más densos al congelarse. Sin embargo, el agua (H₂O) tiene una propiedad anómala fascinante entre los 4 °C y los 0 °C.',
    pregunta: '¿Qué ocurre con el agua al congelarse y por qué esa propiedad permite que exista vida en los lagos congelados en invierno?',
    opciones: [
      'Se expande y disminuye su densidad, por lo que el hielo flota y aísla el agua líquida.',
      'Se comprime y aumenta su peso, hundiéndose al fondo para calentar las rocas.',
      'Pierde sus átomos de oxígeno, liberando calor químico que evita la congelación.',
    ],
    correcta: 0,
    pista: 'Los puentes de hidrógeno forman una red cristalina hexagonal con más espacio vacío que en el agua líquida.',
    explicacion:
      'Al congelarse, el agua forma una red hexagonal menos densa que el agua líquida. Por eso el hielo flota en la superficie y actúa como manto térmico aislante, permitiendo que los peces sobrevivan debajo.',
  },

  // ==========================================================================
  // 5. LITERATURA Y ARTE (10 preguntas)
  // ==========================================================================
  {
    id: 'cg-lit-1',
    categoria: 'Literatura y Arte',
    contexto:
      'Nuestro colegio lleva con orgullo el nombre de Rafael Pombo (1833–1912), coronado en 1905 como Poeta Nacional de Colombia en el Teatro Colón de Bogotá.',
    pregunta: 'Además de «El Renacuajo Paseador» y «La Pobre Viejecita», ¿cuál de estas obras pertenece también a la pluma de Rafael Pombo?',
    opciones: [
      '«Mirringa Mirronga» y el poema «Hora de tinieblas».',
      '«La Vorágine» y la novela romántica «María».',
      '«El coronel no tiene quien le escriba» y «Relato».',
    ],
    correcta: 0,
    pista: 'Incluye una famosa gata que invita a sus amigas a cenar y uno de los poemas filosóficos más intensos del romanticismo colombiano.',
    explicacion:
      'Rafael Pombo no solo escribió fábulas infantiles inmortales como «Mirringa Mirronga» y «Pastorcita», sino también profunda poesía romántica y traducciones clásicas.',
  },
  {
    id: 'cg-lit-2',
    categoria: 'Literatura y Arte',
    contexto:
      'En 1982, la Academia Sueca otorgó el Premio Nobel de Literatura a Gabriel García Márquez «por sus novelas e historias cortas, en las que lo fantástico y lo real se combinan en un mundo ricamente compuesto».',
    pregunta: '¿Con qué título pronunció García Márquez su histórico discurso de aceptación del Premio Nobel en Estocolmo?',
    opciones: [
      '«La soledad de América Latina» ante la Academia.',
      '«El cataclismo de Damocles y la memoria viva».',
      '«Botella al mar para el dios de las palabras».',
    ],
    correcta: 0,
    pista: 'En ese discurso reclama el derecho de nuestra región a tener «una segunda oportunidad sobre la tierra».',
    explicacion:
      'Su discurso «La soledad de América Latina» (diciembre de 1982) es una de las piezas oratorias más importantes del siglo XX sobre la identidad e historia de nuestro continente.',
  },
  {
    id: 'cg-lit-3',
    categoria: 'Literatura y Arte',
    contexto:
      'En 1937, tras el bombardeo aéreo sobre una villa vasca durante la Guerra Civil Española, Pablo Picasso pintó un monumental lienzo en blanco, negro y escalas de gris.',
    pregunta: '¿Cómo se titula esta obra maestra del arte del siglo XX y qué simboliza hoy en el mundo?',
    opciones: [
      '«Guernica», denuncia universal contra la barbarie de la guerra.',
      '«Las Meninas», retrato barroco de la corte de Felipe IV.',
      '«Los fusilamientos del tres de mayo», sobre la invasión en Madrid.',
    ],
    correcta: 0,
    pista: 'Lleva el nombre de la población vasca bombardeada el 26 de abril de 1937.',
    explicacion:
      'El «Guernica» de Pablo Picasso (hoy en el Museo Reina Sofía de Madrid) utiliza el lenguaje del cubismo y el expresionismo para denunciar el horror de la guerra.',
  },
  {
    id: 'cg-lit-4',
    categoria: 'Literatura y Arte',
    contexto:
      'Publicada en dos partes (1605 y 1615) por Miguel de Cervantes Saavedra, es considerada la primera novela moderna de la literatura universal.',
    pregunta: '¿Con qué famosa frase inicia «Don Quijote de la Mancha» y cuál era el verdadero nombre del hidalgo en la novela?',
    opciones: [
      '«En un lugar de la Mancha...» y se llamaba Alonso Quijano.',
      '«Muchos años después...» y se llamaba Aureliano Buendía.',
      '«Vine a Comala porque me dijeron...» y era Juan Preciado.',
    ],
    correcta: 0,
    pista: 'Alonso Quijano enloquece leyendo libros de caballerías y sale al mundo junto a Sancho Panza.',
    explicacion:
      'Miguel de Cervantes creó con Alonso Quijano (Don Quijote) y Sancho Panza un diálogo inmortal entre el idealismo y el sentido práctico humano.',
  },
  {
    id: 'cg-lit-5',
    categoria: 'Literatura y Arte',
    contexto:
      'Publicada en 1924 por el escritor huilense José Eustasio Rivera, esta gran novela colombiana denuncia la explotación de los caucheros en las selvas del Orinoco y el Amazonas y termina con la célebre frase: «¡Los devoró la selva!».',
    pregunta: '¿Cuál es el título de esta obra cumbre de la literatura colombiana y cómo se llama su protagonista?',
    opciones: [
      '«La Vorágine», protagonizada por el poeta Arturo Cova.',
      '«María», protagonizada por el joven Efraín en el Cauca.',
      '«La Marquesa de Yolombó», escrita por Tomás Carrasquilla.',
    ],
    correcta: 0,
    pista: 'Comienza con la famosa línea: «Antes que me hubiera apasionado por mujer alguna, jugué mi corazón al azar y me lo ganó la Violencia».',
    explicacion:
      '«La Vorágine» (1924) de José Eustasio Rivera es una de las novelas fundacionales de la literatura latinoamericana, donde Arturo Cova y Alicia se internan en los llanos y la selva amazónica.',
  },
  {
    id: 'cg-lit-6',
    categoria: 'Literatura y Arte',
    contexto:
      'Nacido en Medellín en 1932 y fallecido en 2023, este pintor y escultor colombiano alcanzó fama mundial por su estilo inconfundible de figuras monumentales y voluminosas que exploran el humor, la crítica social y la historia del arte.',
    pregunta: '¿De qué maestro plástico colombiano hablamos y en qué museo de Bogotá donó una gran colección abierta gratuitamente al público?',
    opciones: [
      'Fernando Botero, creador del Museo Botero en La Candelaria.',
      'Alejandro Obregón, autor de los murales del Salón Elíptico.',
      'Omar Rayo, fundador del museo de arte geométrico en Roldanillo.',
    ],
    correcta: 0,
    pista: 'Su estilo es conocido mundialmente como «boterismo» y sus esculturas en bronce adornan plazas desde París y Nueva York hasta Medellín.',
    explicacion:
      'Fernando Botero exaltó el volumen sensual y monumental en la pintura y la escultura, y en el año 2000 donó a Colombia más de 200 obras propias y de maestros internacionales.',
  },
  {
    id: 'cg-lit-7',
    categoria: 'Literatura y Arte',
    contexto:
      'En la antigua Grecia se compusieron dos grandes poemas épicos atribuidos a Homero: la «Ilíada», que narra la cólera de Aquiles en el sitio de Troya, y un segundo poema sobre el largo viaje de regreso a casa de uno de los héroes griegos.',
    pregunta: '¿Cómo se titula esa segunda epopeya homérica y qué héroe tarda diez años en volver a su isla de Ítaca?',
    opciones: [
      'La «Odisea», protagonizada por el ingenioso Odiseo (Ulises).',
      'La «Eneida», protagonizada por el príncipe troyano Eneas.',
      'La «Teogonía», escrita por el poeta beocio Hesíodo.',
    ],
    correcta: 0,
    pista: 'En su viaje enfrenta al cíclope Polifemo, el canto de las sirenas y los monstruos Escila y Caribdis mientras lo esperan Penélope y Telémaco.',
    explicacion:
      'La «Odisea» relata el regreso de Odiseo (Ulises en la tradición latina) desde Troya hasta Ítaca, convirtiendo la palabra «odisea» en sinónimo universal de travesía llena de peripecias.',
  },
  {
    id: 'cg-lit-8',
    categoria: 'Literatura y Arte',
    contexto:
      'Durante cuatro años (1508–1512), un genial escultor, pintor y arquitecto del Renacimiento italiano trabajó sobre un alto andamio para pintar al fresco más de 300 figuras bíblicas en la bóveda de una capilla del Vaticano.',
    pregunta: '¿Quién pintó la bóveda de la Capilla Sixtina y esculpió además el famoso «David» de mármol en Florencia?',
    opciones: [
      'Miguel Ángel Buonarroti durante el Renacimiento italiano.',
      'Leonardo da Vinci, autor de «La última cena» en Milán.',
      'Rafael Sanzio, pintor del fresco «La escuela de Atenas».',
    ],
    correcta: 0,
    pista: 'Entre sus escenas más célebres en el techo de la capilla está «La creación de Adán», donde dos dedos están a punto de tocarse.',
    explicacion:
      'Miguel Ángel Buonarroti (1475–1564) fue uno de los mayores genios del Renacimiento, autor del «David», «La Piedad» y los frescos de la Capilla Sixtina.',
  },
  {
    id: 'cg-lit-9',
    categoria: 'Literatura y Arte',
    contexto:
      'En 1945, la Academia Sueca entregó por primera vez en la historia el Premio Nobel de Literatura a una persona nacida en América Latina: una poeta, diplomática y pedagoga chilena defensora de la escuela rural y la infancia.',
    pregunta: '¿Cuál era el seudónimo literario de Lucila Godoy Alcayaga, autora de «Desolación» y «Ternura»?',
    opciones: [
      'Gabriela Mistral, primera Nobel de Literatura latinoamericana.',
      'Alfonsina Storni, poeta modernista y posmodernista argentina.',
      'Juana de Ibarbourou, conocida como «Juana de América».',
    ],
    correcta: 0,
    pista: 'Se adelantó 26 años a su compatriota Pablo Neruda (quien ganó el Nobel en 1971).',
    explicacion:
      'Gabriela Mistral (1889–1957) abrió el camino para las letras hispanoamericanas al obtener el Premio Nobel de Literatura en 1945 y dedicó su vida a renovar la educación en América.',
  },
  {
    id: 'cg-lit-10',
    categoria: 'Literatura y Arte',
    contexto:
      'En 1824, en Viena, se estrenó la «Novena Sinfonía en re menor, op. 125», cuyo cuarto movimiento incorpora por primera vez un coro y solistas vocales que cantan la «Oda a la Alegría» de Friedrich Schiller. Su compositor estaba ya completamente sordo.',
    pregunta: '¿Qué gran compositor alemán escribió la Novena Sinfonía escuchando la música únicamente en su mente?',
    opciones: [
      'Ludwig van Beethoven, puente entre el Clasicismo y el Romanticismo.',
      'Wolfgang Amadeus Mozart, niño prodigio nacido en Salzburgo.',
      'Johann Sebastian Bach, maestro del contrapunto barroco alemán.',
    ],
    correcta: 0,
    pista: 'Al terminar el estreno tuvieron que girarlo hacia el público para que pudiera ver la ovación que no podía oír.',
    explicacion:
      'Ludwig van Beethoven (1770–1827) compuso sus obras más revolucionarias —incluida la Novena Sinfonía— tras perder el oído, demostrando la capacidad de abstracción del espíritu humano.',
  },

  // ==========================================================================
  // 6. HISTORIA Y MUNDO (10 preguntas)
  // ==========================================================================
  {
    id: 'cg-his-1',
    categoria: 'Historia y Mundo',
    contexto:
      'Hacia el año 1440 en Maguncia (Alemania), Johannes Gutenberg perfeccionó un invento que permitió reproducir libros a gran escala sin tener que copiarlos a mano uno por uno en los monasterios.',
    pregunta: '¿Qué invento fue este y qué transformación histórica impulsó en Europa y el mundo?',
    opciones: [
      'La imprenta de tipos móviles, que impulsó el Renacimiento.',
      'El telégrafo eléctrico mediante el sistema de código Morse.',
      'La máquina de vapor industrial, que mecanizó las fábricas.',
    ],
    correcta: 0,
    pista: 'Permitió combinar letras metálicas reutilizables para imprimir páginas enteras en minutos.',
    explicacion:
      'La imprenta de tipos móviles redujo drásticamente el costo de los libros y permitió que las ideas científicas, literarias y filosóficas circularan por todo el mundo.',
  },
  {
    id: 'cg-his-2',
    categoria: 'Historia y Mundo',
    contexto:
      'Durante casi tres décadas (1961–1989), una ciudad europea estuvo dividida físicamente por un muro de hormigón que representaba la separación ideológica entre el bloque occidental y el bloque soviético.',
    pregunta: '¿De qué acontecimiento histórico estamos hablando y con qué conflicto global se asocia?',
    opciones: [
      'La caída del Muro de Berlín al final de la Guerra Fría.',
      'La toma de la Bastilla en París durante el año 1789.',
      'La firma del Tratado de Versalles tras la Gran Guerra.',
    ],
    correcta: 0,
    pista: 'Ocurrió en la actual capital de Alemania en noviembre de 1989.',
    explicacion:
      'La caída del Muro de Berlín el 9 de noviembre de 1989 permitió la reunificación alemana y marcó el desenlace de la Guerra Fría.',
  },
  {
    id: 'cg-his-3',
    categoria: 'Historia y Mundo',
    contexto:
      'En la antigüedad clásica en Atenas y en la Biblioteca de Alejandría, los sabios sabían que la Tierra era esférica. En el siglo III a. C., un astrónomo y matemático griego midió la sombra de dos obeliscos en Siena y Alejandría al mediodía del solsticio.',
    pregunta: '¿Quién logró calcular por primera vez la circunferencia de la Tierra con asombrosa precisión usando geometría?',
    opciones: [
      'Eratóstenes de Cirene en el siglo III antes de Cristo.',
      'Claudio Ptolomeo mediante sus tablas astronómicas.',
      'Nicolás Copérnico al formular el modelo heliocéntrico.',
    ],
    correcta: 0,
    pista: 'Fue director de la Biblioteca de Alejandría y usó ángulos alternos internos entre rayos solares paralelos.',
    explicacion:
      'Más de 1.700 años antes del viaje de Colón, Eratóstenes calculó la circunferencia terrestre en unos 40.000 km con apenas un margen de error mínimo, usando solo geometría y observación.',
  },
  {
    id: 'cg-his-4',
    categoria: 'Historia y Mundo',
    contexto:
      'Tras pasar 27 años en prisión por luchar contra el régimen de segregación racial en Sudáfrica, se convirtió en el primer presidente elegido democráticamente por sufragio universal en su país en 1994 y recibió el Premio Nobel de la Paz.',
    pregunta: '¿Cómo se llamaba este líder histórico y cómo se denominaba el sistema de segregación que ayudó a desmontar?',
    opciones: [
      'Nelson Mandela y el régimen sudafricano del Apartheid.',
      'Mahatma Gandhi y el dominio colonial británico en India.',
      'Martin Luther King Jr. y las leyes de segregación racial.',
    ],
    correcta: 0,
    pista: 'Fue conocido cariñosamente en su país por el nombre de su clan: «Madiba».',
    explicacion:
      'Nelson Mandela (1918–2013) es uno de los mayores referentes mundiales de derechos humanos, justicia transicional y superación pacífica del Apartheid en Sudáfrica.',
  },
  {
    id: 'cg-his-5',
    categoria: 'Historia y Mundo',
    contexto:
      'En diciembre de 1793, en su imprenta patriótica de Santafé de Bogotá, un precursor de la Independencia neogranadina tradujo del francés e imprimió un documento proclamado en París en 1789, lo que le costó prisión y destierro.',
    pregunta: '¿Quién fue este prócer neogranadino y qué histórico documento tradujo al español?',
    opciones: [
      'Antonio Nariño y la Declaración de los Derechos del Hombre y del Ciudadano.',
      'Camilo Torres Tenorio y el Memorial de Agravios dirigido a la Corona.',
      'Francisco de Paula Santander y la Constitución de la Villa del Rosario.',
    ],
    correcta: 0,
    pista: 'Tradujo los 17 artículos aprobados por la Asamblea Nacional Constituyente francesa en agosto de 1789.',
    explicacion:
      'Antonio Nariño tradujo e imprimió en 1793 la «Declaración de los Derechos del Hombre y del Ciudadano», sembrando las ideas ilustradas de libertad e igualdad jurídica en la Nueva Granada.',
  },
  {
    id: 'cg-his-6',
    categoria: 'Historia y Mundo',
    contexto:
      'Hacia el año 3200 a. C., en la región situada entre los ríos Tigris y Éufrates (actual Irak), los sumerios desarrollaron el primer sistema de escritura de la humanidad grabando signos en forma de cuña sobre tablillas de arcilla fresca.',
    pregunta: '¿Cómo se denomina a esta región histórica («tierra entre ríos») y cómo se llama su forma de escritura?',
    opciones: [
      'Mesopotamia y el sistema de escritura cuneiforme.',
      'El Antiguo Egipto y la escritura jeroglífica en papiro.',
      'La Fenicia mediterránea y el primer alfabeto fonético.',
    ],
    correcta: 0,
    pista: 'En esa misma civilización se escribió el «Poema de Gilgamesh» y el «Código de Hammurabi».',
    explicacion:
      'Mesopotamia (en griego, «entre ríos») vio nacer las primeras ciudades-estado en Sumeria y la escritura cuneiforme, que marca el paso de la Prehistoria a la Historia.',
  },
  {
    id: 'cg-his-7',
    categoria: 'Historia y Mundo',
    contexto:
      'En la segunda mitad del siglo XVIII, en Gran Bretaña, la invención y mejora de la máquina de vapor por James Watt transformó la producción artesanal en producción mecanizada en fábricas, el transporte ferroviario y la vida urbana.',
    pregunta: '¿Con qué nombre se conoce este proceso histórico y cuál fue su principal fuente de energía inicial?',
    opciones: [
      'La Primera Revolución Industrial, impulsada por el carbón mineral y el vapor.',
      'La Revolución Científica Moderna, movida por la electricidad y el petróleo.',
      'La Ilustración Europea, basada en la energía hidráulica de los molinos.',
    ],
    correcta: 0,
    pista: 'Comenzó en la industria textil algodonera y la siderurgia británica alimentada por minas de hulla (carbón).',
    explicacion:
      'La Primera Revolución Industrial sustituyó la fuerza muscular y animal por la energía térmica del carbón aplicada a la máquina de vapor en fábricas, barcos y locomotoras.',
  },
  {
    id: 'cg-his-8',
    categoria: 'Historia y Mundo',
    contexto:
      'Durante la Segunda Guerra Mundial, el matemático y lógico británico Alan Turing lideró en Bletchley Park al equipo que logró descifrar los mensajes secretos de la máquina «Enigma», acortando la guerra en años.',
    pregunta: '¿De qué disciplina moderna es considerado padre Alan Turing gracias a su concepto de «máquina universal» de 1936?',
    opciones: [
      'De las ciencias de la computación y la inteligencia artificial.',
      'De la física nuclear experimental y los reactores atómicos.',
      'De la telecomunicación satelital y las ondas de radar.',
    ],
    correcta: 0,
    pista: 'El máximo galardón mundial de la informática (equivalente al Nobel de Computación) lleva hoy su apellido.',
    explicacion:
      'Alan Turing (1912–1954) formalizó los conceptos de algoritmo y computación con la «Máquina de Turing», sentando las bases teóricas de todos los computadores modernos.',
  },
  {
    id: 'cg-his-9',
    categoria: 'Historia y Mundo',
    contexto:
      'El 10 de diciembre de 1948, tras la devastación de la Segunda Guerra Mundial, la Asamblea General de las Naciones Unidas reunida en París aprobó un documento histórico de 30 artículos traducido hoy a más de 500 idiomas.',
    pregunta: '¿Qué documento fundamental para la dignidad humana se proclamó ese día en la ONU?',
    opciones: [
      'La Declaración Universal de los Derechos Humanos.',
      'El Tratado del Atlántico Norte para la defensa mutua.',
      'El Convenio de Ginebra sobre neutralidad marítima.',
    ],
    correcta: 0,
    pista: 'Su artículo 1 proclama: «Todos los seres humanos nacen libres e iguales en dignidad y derechos».',
    explicacion:
      'La Declaración Universal de los Derechos Humanos de 1948, impulsada por una comisión presidida por Eleanor Roosevelt, estableció por primera vez un estándar global de derechos inalienables.',
  },
  {
    id: 'cg-his-10',
    categoria: 'Historia y Mundo',
    contexto:
      'En Colombia, las mujeres participaron activamente en las luchas sociales e intelectuales desde la Independencia, pero durante más de un siglo no tuvieron derecho a elegir ni a ser elegidas en las urnas.',
    pregunta: '¿En qué año se aprobó constitucionalmente el derecho al voto femenino en Colombia y en qué año votaron por primera vez?',
    opciones: [
      'Se aprobó en 1954 y ejercieron el voto por primera vez en el plebiscito de 1957.',
      'Se aprobó en la Constitución de 1886 y votaron en las presidenciales de 1910.',
      'Se aprobó en la reforma de 1936 y sufragaron por primera vez en el año 1938.',
    ],
    correcta: 0,
    pista: 'Líderes como Esmeralda Arboleda, Josefina Valencia y Ofelia Uribe de Acosta lucharon décadas hasta lograr el Acto Legislativo N.º 3 de 1954.',
    explicacion:
      'En Colombia el sufragio femenino fue aprobado el 25 de agosto de 1954 y las mujeres acudieron por primera vez a las urnas de manera masiva el 1 de diciembre de 1957 (más de 1.800.000 mujeres votaron ese día).',
  },
];

function barajarArray<T>(items: T[]): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function mezclarOpcionesPregunta(p: PreguntaDesafioRelampago): PreguntaDesafioRelampago {
  const pares = p.opciones.map((texto, idx) => ({ texto, esCorrecta: idx === p.correcta }));
  const barajados = barajarArray(pares);
  return {
    ...p,
    opciones: barajados.map((item) => item.texto),
    correcta: barajados.findIndex((item) => item.esCorrecta),
  };
}

export function seleccionarPreguntasDesafioSinRepetir(
  estudiante: string,
  categoria: 'Todas' | CategoriaCulturaGeneral,
  cantidad = 4
): PreguntaDesafioRelampago[] {
  const estado = leerProgreso(estudiante);
  const vistasSet = new Set(estado.estadisticas.preguntasCulturalesVistas || []);

  const bancoFiltrado =
    categoria === 'Todas'
      ? PREGUNTAS_DESAFIO_RELAMPAGO
      : PREGUNTAS_DESAFIO_RELAMPAGO.filter((p) => p.categoria === categoria);

  const noVistas = barajarArray(bancoFiltrado.filter((p) => !vistasSet.has(p.id)));
  const yaVistas = barajarArray(bancoFiltrado.filter((p) => vistasSet.has(p.id)));

  let seleccionadas: PreguntaDesafioRelampago[] = [];

  if (noVistas.length >= cantidad) {
    seleccionadas = noVistas.slice(0, cantidad);
  } else {
    // Se toman todas las no vistas que quedan y se reinicia el ciclo de esa categoría para completar la ronda sin repetir dentro de la misma ronda
    const faltantes = cantidad - noVistas.length;
    const idsBancoCategoria = new Set(bancoFiltrado.map((p) => p.id));
    idsBancoCategoria.forEach((id) => vistasSet.delete(id));
    seleccionadas = [...noVistas, ...yaVistas.slice(0, faltantes)];
  }

  seleccionadas.forEach((p) => vistasSet.add(p.id));
  estado.estadisticas.preguntasCulturalesVistas = Array.from(vistasSet);
  guardarProgreso(estudiante, estado);

  return seleccionadas.map(mezclarOpcionesPregunta);
}

function fechaHoyColombia(): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // YYYY-MM-DD
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function ayerColombia(): string {
  try {
    const d = new Date(Date.now() - 86400000);
    return d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
  } catch {
    return '';
  }
}

function claveStorage(estudiante: string): string {
  const limpio = (estudiante || 'general').trim().toUpperCase();
  return `interlocutor-gamificacion-v1:${limpio}`;
}

function estadoInicial(): EstadoGamificacion {
  const hoy = fechaHoyColombia();
  const retosInit: Record<string, { actual: number; completado: boolean; reclamado: boolean }> = {};
  CATALOGO_RETOS_DIARIOS.forEach((r) => {
    retosInit[r.id] = { actual: 0, completado: false, reclamado: false };
  });

  return {
    estrellas: 0,
    estrellasAcumuladas: 0,
    estrellasHoy: 0,
    metaEstrellasDiaria: 10,
    xp: 0,
    rachaDias: 1,
    escudosRacha: 1,
    comodinesPista: 1,
    fechaIngreso: hoy,
    ultimaFechaActivo: hoy,
    sonidoActivo: true,
    sonidosAmbientalesActivos: false,
    ambienteSeleccionado: 'lluvia-suave',
    vibracionHapticaActiva: true,
    tituloEquipado: '',
    titulosDesbloqueados: [],
    insigniasDesbloqueadas: [],
    modosExplorados: [],
    estadisticas: {
      mensajesArgumentados: 0,
      preguntasAnaliticas: 0,
      desafiosPensamientoCritico: 0,
      verificacionesExternas: 0,
      aciertosIcfes: 0,
      intentosIcfes: 0,
      rachaIcfesActual: 0,
      cierresCompletados: 0,
      archivosClaseSubidos: 0,
      desafiosRelampagoGanados: 0,
      aciertosCulturalesTotales: 0,
      categoriasCulturales: {},
      preguntasCulturalesVistas: [],
    },
    retosFecha: hoy,
    retos: retosInit,
  };
}

export function leerProgreso(estudiante: string): EstadoGamificacion {
  const base = estadoInicial();
  try {
    const raw = localStorage.getItem(claveStorage(estudiante));
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<EstadoGamificacion>;
    const hoy = fechaHoyColombia();
    const ayer = ayerColombia();

    let rachaDias = typeof parsed.rachaDias === 'number' ? parsed.rachaDias : 1;
    let escudosRacha = typeof parsed.escudosRacha === 'number' ? parsed.escudosRacha : 1;
    const ultimaFecha = parsed.ultimaFechaActivo || hoy;
    const fechaIngreso = parsed.fechaIngreso || ultimaFecha || hoy;

    // Actualización de racha diaria al cambiar de día
    if (ultimaFecha !== hoy) {
      if (ultimaFecha === ayer) {
        rachaDias += 1;
      } else if (escudosRacha > 0) {
        escudosRacha -= 1;
      } else {
        rachaDias = 1;
      }
    }

    const mismoDiaRetos = parsed.retosFecha === hoy;
    const retos: Record<string, { actual: number; completado: boolean; reclamado: boolean }> = {};
    CATALOGO_RETOS_DIARIOS.forEach((r) => {
      const guardado = mismoDiaRetos ? parsed.retos?.[r.id] : undefined;
      retos[r.id] = guardado
        ? {
            actual: Number(guardado.actual) || 0,
            completado: Boolean(guardado.completado),
            reclamado: Boolean(guardado.reclamado),
          }
        : { actual: 0, completado: false, reclamado: false };
    });

    const estrellasActuales = typeof parsed.estrellas === 'number' ? parsed.estrellas : base.estrellas;
    const costoTitulosCanjeados = (parsed.titulosDesbloqueados || []).reduce((acc, t) => {
      const item = RECOMPENSAS_CANJEABLES.find((r) => r.tipo === 'titulo' && r.valor === t);
      return acc + (item ? item.costoEstrellas : 0);
    }, 0);
    const estrellasAcumuladas = Math.max(
      typeof parsed.estrellasAcumuladas === 'number' ? parsed.estrellasAcumuladas : 0,
      estrellasActuales + costoTitulosCanjeados
    );

    return {
      ...base,
      ...parsed,
      estrellasAcumuladas,
      fechaIngreso,
      rachaDias,
      escudosRacha,
      estrellasHoy: ultimaFecha === hoy ? Number(parsed.estrellasHoy) || 0 : 0,
      ultimaFechaActivo: hoy,
      retosFecha: hoy,
      retos,
      estadisticas: {
        ...base.estadisticas,
        ...(parsed.estadisticas || {}),
      },
    };
  } catch {
    return base;
  }
}

export function guardarProgreso(estudiante: string, estado: EstadoGamificacion): void {
  try {
    localStorage.setItem(claveStorage(estudiante), JSON.stringify(estado));
  } catch {
    /* continuar en memoria si el navegador restringe almacenamiento */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('interlocutor:progreso-actualizado', { detail: estado }));
  }
}

export function calcularNivel(xp: number): {
  nivelActual: (typeof NIVELES_CRITICOS)[number];
  siguienteNivel: (typeof NIVELES_CRITICOS)[number] | null;
  progresoPorcentaje: number;
  xpParaSiguiente: number;
} {
  let actual = NIVELES_CRITICOS[0];
  let siguiente: (typeof NIVELES_CRITICOS)[number] | null = NIVELES_CRITICOS[1];

  for (let i = 0; i < NIVELES_CRITICOS.length; i++) {
    if (xp >= NIVELES_CRITICOS[i].xpMinimo) {
      actual = NIVELES_CRITICOS[i];
      siguiente = NIVELES_CRITICOS[i + 1] || null;
    }
  }

  if (!siguiente) {
    return {
      nivelActual: actual,
      siguienteNivel: null,
      progresoPorcentaje: 100,
      xpParaSiguiente: 0,
    };
  }

  const rango = siguiente.xpMinimo - actual.xpMinimo;
  const avance = Math.max(0, xp - actual.xpMinimo);
  const progresoPorcentaje = Math.min(100, Math.round((avance / rango) * 100));

  return {
    nivelActual: actual,
    siguienteNivel: siguiente,
    progresoPorcentaje,
    xpParaSiguiente: Math.max(0, siguiente.xpMinimo - xp),
  };
}

// Síntesis de audio Web Audio API estilo Apple (cálido, filtrado y sin archivos externos)
let audioCtx: AudioContext | null = null;
let ultimoSonidoTs = 0;

export function reproducirSonidoRecompensa(
  tipo: 'estrella' | 'reto' | 'nivel' | 'acierto' | 'error' | 'clic',
  activo = true
): void {
  if (!activo || typeof window === 'undefined') return;
  const ahora = Date.now();
  if (ahora - ultimoSonidoTs < (tipo === 'clic' ? 40 : 120)) return;
  ultimoSonidoTs = ahora;

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const filtro = audioCtx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(tipo === 'error' ? 950 : 3200, now);
    filtro.Q.setValueAtTime(0.7, now);
    filtro.connect(audioCtx.destination);

    const tocarNota = (
      frecuencia: number,
      inicio: number,
      duracion: number,
      ganancia = 0.06,
      onda: OscillatorType = 'sine',
      frecuenciaFinal?: number
    ) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = onda;
      osc.frequency.setValueAtTime(frecuencia, now + inicio);
      if (frecuenciaFinal) {
        osc.frequency.exponentialRampToValueAtTime(frecuenciaFinal, now + inicio + duracion);
      }
      const ataque = Math.min(0.014, duracion * 0.25);
      gain.gain.setValueAtTime(0.0001, now + inicio);
      gain.gain.linearRampToValueAtTime(ganancia, now + inicio + ataque);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + inicio + duracion);
      osc.connect(gain);
      gain.connect(filtro);
      osc.start(now + inicio);
      osc.stop(now + inicio + duracion + 0.015);
    };

    if (tipo === 'clic') {
      tocarNota(310, 0, 0.026, 0.032, 'sine', 135);
    } else if (tipo === 'acierto') {
      tocarNota(587.33, 0, 0.16, 0.055, 'sine'); // D5
      tocarNota(880.0, 0.075, 0.26, 0.065, 'sine'); // A5
    } else if (tipo === 'estrella') {
      tocarNota(659.25, 0, 0.2, 0.055, 'sine'); // E5
      tocarNota(987.77, 0.065, 0.24, 0.06, 'sine'); // B5
      tocarNota(1318.51, 0.13, 0.36, 0.068, 'sine'); // E6
    } else if (tipo === 'reto') {
      tocarNota(523.25, 0, 0.2, 0.058, 'sine'); // C5
      tocarNota(783.99, 0.075, 0.22, 0.06, 'sine'); // G5
      tocarNota(987.77, 0.15, 0.24, 0.065, 'sine'); // B5
      tocarNota(1318.51, 0.225, 0.45, 0.075, 'sine'); // E6
    } else if (tipo === 'nivel') {
      tocarNota(587.33, 0, 0.22, 0.058, 'sine'); // D5
      tocarNota(739.99, 0.08, 0.24, 0.06, 'sine'); // F#5
      tocarNota(880.0, 0.16, 0.26, 0.065, 'sine'); // A5
      tocarNota(1174.66, 0.24, 0.35, 0.07, 'sine'); // D6
      tocarNota(1479.98, 0.32, 0.5, 0.078, 'sine'); // F#6
    } else if (tipo === 'error') {
      tocarNota(220, 0, 0.14, 0.045, 'sine', 185);
      tocarNota(174.61, 0.11, 0.2, 0.045, 'sine', 146.83);
    }
  } catch {
    /* ignorar si el navegador bloquea el audio automático */
  }
}

function emitirNotificacion(notif: NotificacionRecompensa) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('interlocutor:recompensa', { detail: notif }));
  }
}

function evaluarInsignias(estado: EstadoGamificacion): InsigniaConfig[] {
  const nuevas: InsigniaConfig[] = [];
  const tiene = (id: string) => estado.insigniasDesbloqueadas.includes(id);
  const desbloquear = (id: string) => {
    if (!tiene(id)) {
      estado.insigniasDesbloqueadas.push(id);
      const cfg = INSIGNIAS_CATALOGO.find((i) => i.id === id);
      if (cfg) nuevas.push(cfg);
    }
  };

  if (estado.estadisticas.mensajesArgumentados >= 1) desbloquear('primera-chispa');
  if (estado.estadisticas.verificacionesExternas >= 1) desbloquear('ojo-esceptico');
  if (estado.estadisticas.archivosClaseSubidos >= 1) desbloquear('metodologia-aula');
  if (estado.estadisticas.aciertosIcfes >= 3) desbloquear('imparable-saber');
  if (estado.estadisticas.desafiosRelampagoGanados >= 1) desbloquear('cazador-sesgos');
  if (estado.estadisticas.cierresCompletados >= 1) desbloquear('pensador-reflexivo');
  if (estado.modosExplorados.length >= 4) desbloquear('explorador-integral');
  if (estado.estrellas >= 25) desbloquear('orgullo-pombo');

  return nuevas;
}

function avanzarReto(
  estado: EstadoGamificacion,
  idReto: string,
  incremento = 1
): { completadoAhora: boolean; cfg?: (typeof CATALOGO_RETOS_DIARIOS)[number] } {
  const cfg = CATALOGO_RETOS_DIARIOS.find((r) => r.id === idReto);
  if (!cfg) return { completadoAhora: false };
  const actualObj = estado.retos[idReto] || { actual: 0, completado: false, reclamado: false };
  if (actualObj.completado) return { completadoAhora: false };

  const nuevoValor = Math.min(cfg.meta, actualObj.actual + incremento);
  const completado = nuevoValor >= cfg.meta;
  estado.retos[idReto] = {
    actual: nuevoValor,
    completado,
    reclamado: completado ? true : actualObj.reclamado,
  };

  if (completado) {
    estado.estrellas += cfg.estrellas;
    estado.estrellasAcumuladas = (estado.estrellasAcumuladas || estado.estrellas) + cfg.estrellas;
    estado.estrellasHoy += cfg.estrellas;
    estado.xp += cfg.xp;
    return { completadoAhora: true, cfg };
  }
  return { completadoAhora: false };
}

export interface ResumenSesionModo {
  turnosTotales: number;
  mensajesArgumentados: number;
  preguntasAnaliticas: number;
  desafiosPensamientoCritico: number;
  archivosClaseSubidos: number;
  verificacionesExternas: number;
  intentosIcfes: number;
  aciertosIcfes: number;
  conReflexion?: boolean;
}

export type AccionGamificacion =
  | {
      tipo: 'mensaje_argumentado';
      modo: string;
      palabras: number;
      tieneArchivos: boolean;
      esPreguntaAnalitica?: boolean;
      esDesafioCritico?: boolean;
      motivoCritico?: string;
    }
  | { tipo: 'pregunta_analitica'; modo: string; palabras: number; pregunta?: string }
  | { tipo: 'desafio_pensamiento_critico'; modo: string; motivo?: string }
  | { tipo: 'verificacion_externa'; modo: string }
  | { tipo: 'respuesta_icfes'; correcta: boolean; area: string }
  | { tipo: 'cierre_sesion'; modo: string; resumen?: ResumenSesionModo }
  | { tipo: 'desafio_relampago'; aciertos: number; total: number; categoria?: string };

export function analizarTextoInteraccionChat(
  texto: string,
  modo: string,
  tieneArchivos: boolean,
  turnosEnSesion = 1
): {
  palabras: number;
  esPreguntaAnalitica: boolean;
  esDesafioCritico: boolean;
  motivoCritico?: string;
} {
  const limpio = (texto || '').trim();
  const palabras = limpio
    .split(/\s+/)
    .filter((p) => /[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9]{2,}/.test(p)).length;

  // Detectar preguntas analíticas formuladas por el estudiante
  const tieneSignoInterrogacion = /[?¿]/.test(limpio);
  const patronInterrogativoAnalitico =
    /\b(por\s+qu[eé]|c[oó]mo\s+se\s+(demuestra|explica|comprueba|sabe)|qu[eé]\s+(evidencia|pruebas?|fuentes?|supuestos?|pasar[ií]a\s+si|relaci[oó]n)|de\s+d[oó]nde\s+sale|cu[aá]l\s+es\s+la\s+(fuente|causa|diferencia|raz[oó]n)|en\s+qu[eé]\s+te\s+basas|no\s+ser[ií]a\s+contradictorio)\b/i.test(
      limpio
    );
  const esPreguntaAnalitica =
    palabras >= 5 && (patronInterrogativoAnalitico || (tieneSignoInterrogacion && palabras >= 7));

  // Detectar desafíos de pensamiento crítico: contraargumentos, detección de sesgos/falacias, verificación matemática o hitos de diálogo
  const patronContraargumentoOSesgo =
    /\b(sin\s+embargo|por\s+el\s+contrario|en\s+cambio|contraejemplo|contradicci[oó]n|te\s+contradices|sesgo|falacia|alucinaci[oó]n|supuesto\s+oculto|no\s+estoy\s+de\s+acuerdo\s+porque|mi\s+hip[oó]tesis|sustituyendo|comprob[eé]|verifiqu[eé]|seg[uú]n\s+la\s+fuente|la\s+evidencia\s+muestra)\b/i.test(
      limpio
    );
  const hitoDialogoSostenido = palabras >= 8 && turnosEnSesion > 0 && turnosEnSesion % 3 === 0;
  const esDesafioCritico = (palabras >= 8 && patronContraargumentoOSesgo) || hitoDialogoSostenido;

  let motivoCritico: string | undefined;
  if (patronContraargumentoOSesgo && palabras >= 8) {
    motivoCritico = 'Planteaste una objeción razonada, prueba o detección de sesgo en el chat.';
  } else if (hitoDialogoSostenido) {
    motivoCritico = `Completaste ${turnosEnSesion} intervenciones críticas sostenidas en esta sesión.`;
  } else if (tieneArchivos && modo === 'tutor') {
    motivoCritico = 'Aportaste ejercicios desarrollados en clase para guiar el método de resolución.';
  }

  return {
    palabras,
    esPreguntaAnalitica,
    esDesafioCritico,
    motivoCritico,
  };
}

export function registrarAccionGamificacion(estudiante: string, accion: AccionGamificacion): EstadoGamificacion {
  const estado = leerProgreso(estudiante);
  const nivelAntes = calcularNivel(estado.xp).nivelActual.nivel;

  let estrellasGanadas = 0;
  let xpGanado = 0;
  let tituloNotif = '';
  let subtituloNotif = '';
  let silencioso = false;

  if ('modo' in accion && accion.modo && !estado.modosExplorados.includes(accion.modo)) {
    estado.modosExplorados.push(accion.modo);
  }

  let retoRecienCompletado: (typeof CATALOGO_RETOS_DIARIOS)[number] | undefined;

  // Las acciones individuales dentro del chat solo registran estadísticas en silencio;
  // las estrellas y avisos se entregan al terminar de usar el modo ('cierre_sesion').
  if (accion.tipo === 'pregunta_analitica') {
    silencioso = true;
    estado.estadisticas.preguntasAnaliticas = (estado.estadisticas.preguntasAnaliticas || 0) + 1;
    estado.estadisticas.mensajesArgumentados += 1;
  } else if (accion.tipo === 'desafio_pensamiento_critico') {
    silencioso = true;
    estado.estadisticas.desafiosPensamientoCritico = (estado.estadisticas.desafiosPensamientoCritico || 0) + 1;
  } else if (accion.tipo === 'mensaje_argumentado') {
    silencioso = true;
    if (accion.tieneArchivos) {
      estado.estadisticas.archivosClaseSubidos += 1;
    }
    if (accion.esDesafioCritico) {
      estado.estadisticas.desafiosPensamientoCritico = (estado.estadisticas.desafiosPensamientoCritico || 0) + 1;
    } else if (accion.esPreguntaAnalitica) {
      estado.estadisticas.preguntasAnaliticas = (estado.estadisticas.preguntasAnaliticas || 0) + 1;
    }
    if (accion.palabras >= 8 || accion.esPreguntaAnalitica) {
      estado.estadisticas.mensajesArgumentados += 1;
    }
  } else if (accion.tipo === 'verificacion_externa') {
    silencioso = true;
    estado.estadisticas.verificacionesExternas += 1;
  } else if (accion.tipo === 'respuesta_icfes') {
    silencioso = true;
    estado.estadisticas.intentosIcfes += 1;
    if (accion.correcta) {
      estado.estadisticas.aciertosIcfes += 1;
      estado.estadisticas.rachaIcfesActual += 1;
    } else {
      estado.estadisticas.rachaIcfesActual = 0;
    }
  } else if (accion.tipo === 'cierre_sesion') {
    const r = accion.resumen;
    const conReflexion = r ? r.conReflexion !== false : true;

    if (r) {
      estado.estadisticas.mensajesArgumentados += r.mensajesArgumentados || 0;
      estado.estadisticas.preguntasAnaliticas =
        (estado.estadisticas.preguntasAnaliticas || 0) + (r.preguntasAnaliticas || 0);
      estado.estadisticas.desafiosPensamientoCritico =
        (estado.estadisticas.desafiosPensamientoCritico || 0) + (r.desafiosPensamientoCritico || 0);
      estado.estadisticas.archivosClaseSubidos += r.archivosClaseSubidos || 0;
      estado.estadisticas.verificacionesExternas += r.verificacionesExternas || 0;
      estado.estadisticas.intentosIcfes += r.intentosIcfes || 0;
      estado.estadisticas.aciertosIcfes += r.aciertosIcfes || 0;

      // Estrellas acumuladas durante la sesión del modo
      if (r.turnosTotales > 0) {
        const puntosDialogo =
          Math.max(1, r.mensajesArgumentados) +
          r.preguntasAnaliticas +
          r.desafiosPensamientoCritico * 2 +
          r.archivosClaseSubidos * 2;
        estrellasGanadas += Math.min(6, Math.max(1, puntosDialogo));
        xpGanado += Math.min(90, Math.max(20, puntosDialogo * 15));
      }

      if (r.verificacionesExternas > 0) {
        estrellasGanadas += r.verificacionesExternas * 3;
        xpGanado += r.verificacionesExternas * 45;
        const rVerif = avanzarReto(estado, 'reto-verificacion', r.verificacionesExternas);
        if (rVerif.completadoAhora && !retoRecienCompletado) retoRecienCompletado = rVerif.cfg;
      }

      if (r.intentosIcfes > 0) {
        const fallos = Math.max(0, r.intentosIcfes - r.aciertosIcfes);
        estrellasGanadas += r.aciertosIcfes * 2 + fallos;
        xpGanado += r.aciertosIcfes * 30 + fallos * 15;
        const rIcfes = avanzarReto(estado, 'reto-saber-tutor', r.intentosIcfes);
        if (rIcfes.completadoAhora && !retoRecienCompletado) retoRecienCompletado = rIcfes.cfg;
      }

      const avancesDialogo =
        (r.mensajesArgumentados || 0) +
        (r.preguntasAnaliticas || 0) +
        (r.desafiosPensamientoCritico || 0);
      if (avancesDialogo > 0) {
        const rDial = avanzarReto(estado, 'reto-dialogo', avancesDialogo);
        if (rDial.completadoAhora && !retoRecienCompletado) retoRecienCompletado = rDial.cfg;
      }

      if (accion.modo === 'tutor' && r.turnosTotales > 0) {
        const rTutor = avanzarReto(estado, 'reto-saber-tutor', r.turnosTotales);
        if (rTutor.completadoAhora && !retoRecienCompletado) retoRecienCompletado = rTutor.cfg;
      }
    }

    if (conReflexion) {
      estado.estadisticas.cierresCompletados += 1;
      estrellasGanadas += 4;
      xpGanado += 60;
      tituloNotif = '¡Modo finalizado con reflexión!';
      subtituloNotif = 'Se sumaron las estrellas de tu sesión y de tu cierre.';
      const r4 = avanzarReto(estado, 'reto-metacognicion', 1);
      if (r4.completadoAhora && !retoRecienCompletado) retoRecienCompletado = r4.cfg;
    } else if (estrellasGanadas > 0) {
      tituloNotif = '¡Sesión de modo completada!';
      subtituloNotif = 'Recibiste las estrellas ganadas durante tu práctica.';
    }
  } else if (accion.tipo === 'desafio_relampago') {
    estado.estadisticas.desafiosRelampagoGanados += 1;
    estado.estadisticas.aciertosCulturalesTotales =
      (estado.estadisticas.aciertosCulturalesTotales || 0) + accion.aciertos;
    if (accion.categoria) {
      const mapaCat = { ...(estado.estadisticas.categoriasCulturales || {}) };
      mapaCat[accion.categoria] = (mapaCat[accion.categoria] || 0) + 1;
      estado.estadisticas.categoriasCulturales = mapaCat;
    }
    estrellasGanadas += Math.max(2, accion.aciertos * 2);
    xpGanado += Math.max(30, accion.aciertos * 20);
    tituloNotif = `¡Desafío de Cultura General (${accion.aciertos}/${accion.total})!`;
    subtituloNotif = 'Completaste la ronda de cultura general.';
    const r4 = avanzarReto(estado, 'reto-metacognicion', 1);
    if (r4.completadoAhora) retoRecienCompletado = r4.cfg;
  }

  if (estrellasGanadas > 0 || xpGanado > 0) {
    estado.estrellas += estrellasGanadas;
    estado.estrellasAcumuladas = (estado.estrellasAcumuladas || 0) + estrellasGanadas;
    estado.estrellasHoy += estrellasGanadas;
    estado.xp += xpGanado;
  }

  const nuevasInsignias = silencioso ? [] : evaluarInsignias(estado);
  if (nuevasInsignias.length > 0) {
    // Bono por desbloquear insignia
    estado.estrellas += 2 * nuevasInsignias.length;
    estado.estrellasAcumuladas = (estado.estrellasAcumuladas || 0) + 2 * nuevasInsignias.length;
    estado.xp += 30 * nuevasInsignias.length;
  }

  const nivelDespues = calcularNivel(estado.xp).nivelActual;
  guardarProgreso(estudiante, estado);

  if (silencioso) {
    return estado;
  }

  if (nivelDespues.nivel > nivelAntes) {
    reproducirSonidoRecompensa('nivel', estado.sonidoActivo);
    emitirNotificacion({
      id: `notif-${Date.now()}`,
      estrellas: estrellasGanadas + (retoRecienCompletado?.estrellas || 0),
      xp: xpGanado + (retoRecienCompletado?.xp || 0),
      titulo: `¡Subiste a Nivel ${nivelDespues.nivel}: ${nivelDespues.nombre}!`,
      subtitulo: nivelDespues.lema,
      tipo: 'nivel',
    });
  } else if (retoRecienCompletado) {
    reproducirSonidoRecompensa('reto', estado.sonidoActivo);
    emitirNotificacion({
      id: `notif-${Date.now()}`,
      estrellas: estrellasGanadas + retoRecienCompletado.estrellas,
      xp: xpGanado + retoRecienCompletado.xp,
      titulo: `¡Reto diario cumplido: ${retoRecienCompletado.titulo}!`,
      subtitulo: `Ganaste +${retoRecienCompletado.estrellas} estrellas extra de recompensa.`,
      tipo: 'reto',
    });
  } else if (nuevasInsignias.length > 0) {
    reproducirSonidoRecompensa('reto', estado.sonidoActivo);
    emitirNotificacion({
      id: `notif-${Date.now()}`,
      estrellas: estrellasGanadas + 2,
      xp: xpGanado + 30,
      titulo: `¡Nueva insignia: ${nuevasInsignias[0].nombre}!`,
      subtitulo: nuevasInsignias[0].descripcion,
      tipo: 'insignia',
    });
  } else if (estrellasGanadas > 0) {
    reproducirSonidoRecompensa('estrella', estado.sonidoActivo);
    emitirNotificacion({
      id: `notif-${Date.now()}`,
      estrellas: estrellasGanadas,
      xp: xpGanado,
      titulo: tituloNotif,
      subtitulo: subtituloNotif,
      tipo: 'estrella',
    });
  }

  return estado;
}

export function canjearRecompensaTienda(
  estudiante: string,
  itemId: string
): { ok: boolean; mensaje: string; estado: EstadoGamificacion } {
  const estado = leerProgreso(estudiante);
  const item = RECOMPENSAS_CANJEABLES.find((r) => r.id === itemId);
  if (!item) {
    return { ok: false, mensaje: 'Recompensa no encontrada.', estado };
  }

  if (item.tipo === 'titulo' && estado.titulosDesbloqueados.includes(item.valor)) {
    estado.tituloEquipado = estado.tituloEquipado === item.valor ? '' : item.valor;
    guardarProgreso(estudiante, estado);
    return {
      ok: true,
      mensaje: estado.tituloEquipado ? `Equipaste el título «${item.valor}».` : 'Quitaste el título equipado.',
      estado,
    };
  }

  if (estado.estrellas < item.costoEstrellas) {
    return {
      ok: false,
      mensaje: `Necesitas ${item.costoEstrellas} estrellas (tienes ${estado.estrellas}). ¡Cumple retos o participa en los modos para ganar más!`,
      estado,
    };
  }

  estado.estrellas -= item.costoEstrellas;
  if (item.tipo === 'escudo') {
    estado.escudosRacha += 1;
  } else if (item.tipo === 'comodines') {
    estado.comodinesPista += 2;
  } else if (item.tipo === 'titulo') {
    if (!estado.titulosDesbloqueados.includes(item.valor)) {
      estado.titulosDesbloqueados.push(item.valor);
    }
    estado.tituloEquipado = item.valor;
  }

  reproducirSonidoRecompensa('reto', estado.sonidoActivo);
  guardarProgreso(estudiante, estado);
  return {
    ok: true,
    mensaje:
      item.tipo === 'titulo'
        ? `¡Desbloqueaste y equipaste «${item.valor}»!`
        : `¡Canje exitoso! Se añadió «${item.nombre}» a tu inventario.`,
    estado,
  };
}

export function alternarSonidoGamificacion(estudiante: string): EstadoGamificacion {
  const estado = leerProgreso(estudiante);
  estado.sonidoActivo = !estado.sonidoActivo;
  if (estado.sonidoActivo) {
    reproducirSonidoRecompensa('estrella', true);
  }
  guardarProgreso(estudiante, estado);
  return estado;
}

export function usarComodinPista(estudiante: string): boolean {
  const estado = leerProgreso(estudiante);
  if (estado.comodinesPista <= 0) return false;
  estado.comodinesPista -= 1;
  guardarProgreso(estudiante, estado);
  return true;
}
