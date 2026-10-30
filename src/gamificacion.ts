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
    descripcion: 'Escribe 3 respuestas argumentadas (8+ palabras) cuestionando o explicando con tus palabras.',
    meta: 3,
    estrellas: 3,
    xp: 45,
    modoSugerido: 'socratico',
  },
  {
    id: 'reto-verificacion',
    titulo: 'Detective de fuentes',
    descripcion: 'Comprueba 1 dato fuera de la IA usando el botón «Lo verifiqué por fuera».',
    meta: 1,
    estrellas: 4,
    xp: 60,
    modoSugerido: 'verificar',
  },
  {
    id: 'reto-saber-tutor',
    titulo: 'Rigor en acción',
    descripcion: 'Resuelve 2 retos en el Entrenador Saber 11 o en el Tutor de Matemáticas, Física y Química.',
    meta: 2,
    estrellas: 4,
    xp: 55,
    modoSugerido: 'icfes',
  },
  {
    id: 'reto-metacognicion',
    titulo: 'Desafío de Cultura General o Reflexión',
    descripcion: 'Supera el Desafío Diario de Cultura General o completa la reflexión final («Terminar») de una sesión.',
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
    descripcion: 'Formulaste tu primer planteamiento argumentado con criterio propio.',
    icono: 'sparkles',
    condicionTexto: 'Escribir tu primera intervención argumentada',
  },
  {
    id: 'ojo-esceptico',
    nombre: 'Ojo Escéptico',
    descripcion: 'Contrastaste una afirmación de la IA en una fuente externa real.',
    icono: 'search-check',
    condicionTexto: 'Registrar 1 verificación en «Lo verifiqué por fuera»',
  },
  {
    id: 'metodologia-aula',
    nombre: 'Fiel al Aula',
    descripcion: 'Subiste ejemplos de clase o un borrador propio para trabajar sobre tu proceso.',
    icono: 'book-open',
    condicionTexto: 'Subir un ejemplo del salón o borrador propio',
  },
  {
    id: 'imparable-saber',
    nombre: 'Estratega Saber 11',
    descripcion: 'Lograste acertar 3 preguntas del cuadernillo oficial del ICFES.',
    icono: 'award',
    condicionTexto: 'Acumular 3 aciertos en el Entrenador Saber 11',
  },
  {
    id: 'cazador-sesgos',
    nombre: 'Mente Enciclopédica',
    descripcion: 'Superaste con éxito el Desafío Diario de Cultura General demostrando amplitud de conocimientos.',
    icono: 'zap',
    condicionTexto: 'Completar 1 Desafío de Cultura General',
  },
  {
    id: 'pensador-reflexivo',
    nombre: 'Pensador Metacognitivo',
    descripcion: 'Cerraste una sesión evaluando qué aprendiste y qué pensaste sin ayuda.',
    icono: 'compass',
    condicionTexto: 'Completar 1 reflexión de cierre de sesión',
  },
  {
    id: 'explorador-integral',
    nombre: 'Explorador Integral',
    descripcion: 'Pusiste a prueba tu mente en al menos 4 modos distintos del Interlocutor.',
    icono: 'layers',
    condicionTexto: 'Participar en 4 modos diferentes',
  },
  {
    id: 'orgullo-pombo',
    nombre: 'Orgullo Rafael Pombo',
    descripcion: 'Acumulaste 25 estrellas demostrando constancia y pensamiento autónomo.',
    icono: 'crown',
    condicionTexto: 'Alcanzar 25 estrellas acumuladas',
  },
];

export const RECOMPENSAS_CANJEABLES: RecompensaTienda[] = [
  {
    id: 'item-escudo',
    nombre: 'Escudo Protector de Racha',
    descripcion: 'Protege tu racha diaria automáticamente si un día no puedes practicar.',
    costoEstrellas: 6,
    tipo: 'escudo',
    valor: 'escudo',
  },
  {
    id: 'item-comodin',
    nombre: 'Lupa Crítica (+2 Pistas)',
    descripcion: 'Añade 2 pistas analíticas para usar en el Desafío Relámpago sin perder vidas.',
    costoEstrellas: 5,
    tipo: 'comodines',
    valor: '2',
  },
  {
    id: 'titulo-cazador',
    nombre: 'Título: Cazador de Falacias',
    descripcion: 'Insignia de rango visible junto a tu código de estudiante.',
    costoEstrellas: 10,
    tipo: 'titulo',
    valor: 'Cazador de Falacias',
  },
  {
    id: 'titulo-verificador',
    nombre: 'Título: Guardián de la Evidencia',
    descripcion: 'Distinción para quienes jamás aceptan un dato sin comprobar su fuente.',
    costoEstrellas: 18,
    tipo: 'titulo',
    valor: 'Guardián de la Evidencia',
  },
  {
    id: 'titulo-pombo',
    nombre: 'Título: Mente Maestra Pombo',
    descripcion: 'El máximo reconocimiento de pensamiento crítico en el Liceo Superior Rafael Pombo.',
    costoEstrellas: 30,
    tipo: 'titulo',
    valor: 'Mente Maestra Pombo',
  },
];

export const PREGUNTAS_DESAFIO_RELAMPAGO: PreguntaDesafioRelampago[] = [
  // --- COLOMBIA Y SANTANDER ---
  {
    id: 'cg-col-1',
    categoria: 'Colombia y Santander',
    contexto:
      'En marzo de 1781, en la provincia de Santander (Socorro y poblaciones vecinas como San Gil y Charalá), estalló uno de los movimientos sociales más importantes antes de la Independencia.',
    pregunta: '¿Cómo se conoce históricamente a este levantamiento y quién rompió el edicto de los nuevos impuestos?',
    opciones: [
      'La Rebelión de los Comuneros, iniciada por Manuela Beltrán.',
      'La Patria Boba, liderada por Antonio Nariño.',
      'La Guerra de los Mil Días, promovida por guerrillas liberales en Santander.',
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
      'Extensión de arrecifes coralinos y manglares costeros.',
      'Cantidad de mamíferos grandes y reptiles de alta montaña.',
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
      'En el río Cauca hacia el mar Caribe.',
      'En el río Chicamocha, que fluye directo hacia la cuenca del Orinoco.',
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
      'La leyenda de Bachué, esculpida en el Poporo Quimbaya.',
      'El mito de Bochica, grabado en los monolitos de San Agustín.',
    ],
    correcta: 0,
    pista: 'El heredero cubría su cuerpo con polvo de oro y se sumergía en las aguas sagradas de la laguna.',
    explicacion:
      'La Balsa Muisca recrea el rito de la laguna de Guatavita que dio origen a la leyenda de El Dorado, motor de numerosas expediciones en el siglo XVI.',
  },

  // --- LITERATURA Y ARTE ---
  {
    id: 'cg-lit-1',
    categoria: 'Literatura y Arte',
    contexto:
      'Nuestro colegio lleva con orgullo el nombre de Rafael Pombo (1833–1912), coronado en 1905 como Poeta Nacional de Colombia en el Teatro Colón de Bogotá.',
    pregunta: 'Además de «El Renacuajo Paseador» y «La Pobre Viejecita», ¿cuál de estas obras pertenece también a la pluma de Rafael Pombo?',
    opciones: [
      '«Mirringa Mirronga» y el poema «Hora de tinieblas».',
      '«La Vorágine» y «María».',
      '«El coronel no tiene quien le escriba» y «Los funerales de la Mamá Grande».',
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
      '«La soledad de América Latina».',
      '«El cataclismo de Damocles y la memoria».',
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
      '«Guernica», denuncia contra la barbarie de la guerra.',
      '«Las Meninas», retrato de la corte real.',
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
      '«Vine a Comala porque me dijeron...» y se llamaba Juan Preciado.',
    ],
    correcta: 0,
    pista: 'Alonso Quijano enloquece leyendo libros de caballerías y sale al mundo junto a Sancho Panza.',
    explicacion:
      'Miguel de Cervantes creó con Alonso Quijano (Don Quijote) y Sancho Panza un diálogo inmortal entre el idealismo y el sentido práctico humano.',
  },

  // --- CIENCIA Y UNIVERSO ---
  {
    id: 'cg-cie-1',
    categoria: 'Ciencia y Universo',
    contexto:
      'Aunque el Sol se encuentra a unos 150 millones de kilómetros de la Tierra y la luz viaja en el vacío a casi 300.000 km por segundo, su luz no llega de forma instantánea.',
    pregunta: '¿Cuánto tiempo tarda aproximadamente un rayo de luz desde la superficie del Sol en llegar hasta nuestros ojos en la Tierra?',
    opciones: [
      'Aproximadamente 8 minutos y 20 segundos.',
      'Menos de 2 segundos en el vacío.',
      'Alrededor de 24 horas completas durante la rotación terrestre.',
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
      'La penicilina, el primer antibiótico médico.',
      'La vacuna contra la rabia mediante virus atenuados.',
      'La pasteurización térmica para eliminar bacterias en líquidos.',
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
      'El fitoplancton marino de los océanos.',
      'Los bosques boreales de coníferas en el hemisferio norte.',
      'Las selvas húmedas tropicales de las cuencas del Congo y Asia.',
    ],
    correcta: 0,
    pista: 'Los océanos cubren más del 70 % de la superficie de la Tierra y están llenos de vida microscópica fotosintética.',
    explicacion:
      'El fitoplancton oceánico realiza más de la mitad de la fotosíntesis global, capturando carbono y liberando la mayor proporción del oxígeno de la atmósfera.',
  },

  // --- HISTORIA Y MUNDO ---
  {
    id: 'cg-his-1',
    categoria: 'Historia y Mundo',
    contexto:
      'Hacia el año 1440 en Maguncia (Alemania), Johannes Gutenberg perfeccionó un invento que permitió reproducir libros a gran escala sin tener que copiarlos a mano uno por uno en los monasterios.',
    pregunta: '¿Qué invento fue este y qué transformación histórica impulsó en Europa y el mundo?',
    opciones: [
      'La imprenta de tipos móviles, que impulsó el Renacimiento.',
      'El telégrafo eléctrico mediante código Morse.',
      'La máquina de vapor industrial, que mecanizó los talleres europeos.',
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
      'La toma de la Bastilla en París en 1789.',
      'La firma del Tratado de Versalles tras la Primera Guerra Mundial.',
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
      'Eratóstenes de Cirene en el siglo III a. C.',
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
      'Nelson Mandela y el sistema del Apartheid.',
      'Mahatma Gandhi y el dominio colonial británico en la India.',
      'Martin Luther King Jr. y las leyes de segregación Jim Crow.',
    ],
    correcta: 0,
    pista: 'Fue conocido cariñosamente en su país por el nombre de su clan: «Madiba».',
    explicacion:
      'Nelson Mandela (1918–2013) es uno de los mayores referentes mundiales de derechos humanos, justicia transicional y superación pacífica del Apartheid en Sudáfrica.',
  },
];

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
    estrellas: 2, // Bienvenida inicial para motivar al estudiante
    estrellasAcumuladas: 2,
    estrellasHoy: 0,
    metaEstrellasDiaria: 10,
    xp: 15,
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
  | { tipo: 'cierre_sesion'; modo: string }
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

  if ('modo' in accion && accion.modo && !estado.modosExplorados.includes(accion.modo)) {
    estado.modosExplorados.push(accion.modo);
  }

  let retoRecienCompletado: (typeof CATALOGO_RETOS_DIARIOS)[number] | undefined;

  if (accion.tipo === 'pregunta_analitica') {
    estado.estadisticas.preguntasAnaliticas = (estado.estadisticas.preguntasAnaliticas || 0) + 1;
    estado.estadisticas.mensajesArgumentados += 1;
    estrellasGanadas += 2;
    xpGanado += 30;
    tituloNotif = '¡Pregunta analítica formulada!';
    subtituloNotif = 'Cuestionar el porqué y pedir pruebas impulsa el pensamiento crítico.';
    const r1 = avanzarReto(estado, 'reto-dialogo', 1);
    if (r1.completadoAhora) retoRecienCompletado = r1.cfg;
  } else if (accion.tipo === 'desafio_pensamiento_critico') {
    estado.estadisticas.desafiosPensamientoCritico = (estado.estadisticas.desafiosPensamientoCritico || 0) + 1;
    estrellasGanadas += 3;
    xpGanado += 45;
    tituloNotif = '¡Desafío de pensamiento crítico superado!';
    subtituloNotif = accion.motivo || 'Contrastaste ideas y sostuviste una postura con rigor.';
    const r1 = avanzarReto(estado, 'reto-dialogo', 1);
    if (r1.completadoAhora) retoRecienCompletado = r1.cfg;
  } else if (accion.tipo === 'mensaje_argumentado') {
    if (accion.tieneArchivos) {
      estado.estadisticas.archivosClaseSubidos += 1;
      estrellasGanadas += 2;
      xpGanado += 25;
      tituloNotif = '¡Material de trabajo cargado!';
      subtituloNotif = 'Trabajar sobre tus propios apuntes o ejercicios suma rigor.';
    }
    if (accion.esDesafioCritico) {
      estado.estadisticas.desafiosPensamientoCritico = (estado.estadisticas.desafiosPensamientoCritico || 0) + 1;
      estrellasGanadas += 2;
      xpGanado += 30;
      tituloNotif = '¡Desafío de pensamiento crítico en el chat!';
      subtituloNotif = accion.motivoCritico || 'Formulaste un contraargumento o contraste riguroso.';
    } else if (accion.esPreguntaAnalitica) {
      estado.estadisticas.preguntasAnaliticas = (estado.estadisticas.preguntasAnaliticas || 0) + 1;
      estrellasGanadas += 1;
      xpGanado += 15;
      tituloNotif = '¡Pregunta analítica aguda!';
      subtituloNotif = 'Indagar causas, supuestos o pruebas te da estrellas extra.';
    }
    if (accion.palabras >= 8 || accion.esPreguntaAnalitica) {
      estado.estadisticas.mensajesArgumentados += 1;
      estrellasGanadas += 1;
      xpGanado += 15;
      if (!tituloNotif) {
        tituloNotif = '¡Argumento con criterio!';
        subtituloNotif = 'Explicar con tus palabras fortalece tu pensamiento autónomo.';
      }
      const r1 = avanzarReto(estado, 'reto-dialogo', 1);
      if (r1.completadoAhora) retoRecienCompletado = r1.cfg;

      if (accion.modo === 'tutor') {
        const rTutor = avanzarReto(estado, 'reto-saber-tutor', 1);
        if (rTutor.completadoAhora && !retoRecienCompletado) retoRecienCompletado = rTutor.cfg;
      }
    }
  } else if (accion.tipo === 'verificacion_externa') {
    estado.estadisticas.verificacionesExternas += 1;
    estrellasGanadas += 3;
    xpGanado += 45;
    tituloNotif = '¡Fuente contrastada fuera de la IA!';
    subtituloNotif = 'Comprobar en fuentes externas es la cima del pensamiento crítico.';
    const r2 = avanzarReto(estado, 'reto-verificacion', 1);
    if (r2.completadoAhora) retoRecienCompletado = r2.cfg;
  } else if (accion.tipo === 'respuesta_icfes') {
    estado.estadisticas.intentosIcfes += 1;
    const r3 = avanzarReto(estado, 'reto-saber-tutor', 1);
    if (r3.completadoAhora) retoRecienCompletado = r3.cfg;

    if (accion.correcta) {
      estado.estadisticas.aciertosIcfes += 1;
      estado.estadisticas.rachaIcfesActual += 1;
      const bonoRacha = estado.estadisticas.rachaIcfesActual >= 3 ? 1 : 0;
      estrellasGanadas += 2 + bonoRacha;
      xpGanado += 35 + bonoRacha * 15;
      tituloNotif =
        bonoRacha > 0
          ? `¡Racha de ${estado.estadisticas.rachaIcfesActual} aciertos en Saber 11!`
          : '¡Acierto en el cuadernillo Saber 11!';
      subtituloNotif = 'Excelente lectura crítica y descarte de distractores.';
    } else {
      estado.estadisticas.rachaIcfesActual = 0;
      estrellasGanadas += 1;
      xpGanado += 15;
      tituloNotif = '¡Intento analizado en Saber 11!';
      subtituloNotif = 'Analizar por qué descartar cada opción te hace más fuerte.';
    }
  } else if (accion.tipo === 'cierre_sesion') {
    estado.estadisticas.cierresCompletados += 1;
    estrellasGanadas += 5;
    xpGanado += 70;
    tituloNotif = '¡Reflexión metacognitiva completada!';
    subtituloNotif = 'Evaluar lo que aprendiste consolida tu autonomía.';
    const r4 = avanzarReto(estado, 'reto-metacognicion', 1);
    if (r4.completadoAhora) retoRecienCompletado = r4.cfg;
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
    tituloNotif = `¡Desafío de Cultura General superado (${accion.aciertos}/${accion.total})!`;
    subtituloNotif = 'Excelente bagaje cultural en historia, ciencia, literatura y Colombia.';
    const r4 = avanzarReto(estado, 'reto-metacognicion', 1);
    if (r4.completadoAhora) retoRecienCompletado = r4.cfg;
  }

  if (estrellasGanadas > 0 || xpGanado > 0) {
    estado.estrellas += estrellasGanadas;
    estado.estrellasAcumuladas = (estado.estrellasAcumuladas || 0) + estrellasGanadas;
    estado.estrellasHoy += estrellasGanadas;
    estado.xp += xpGanado;
  }

  const nuevasInsignias = evaluarInsignias(estado);
  if (nuevasInsignias.length > 0) {
    // Bono por desbloquear insignia
    estado.estrellas += 2 * nuevasInsignias.length;
    estado.estrellasAcumuladas = (estado.estrellasAcumuladas || 0) + 2 * nuevasInsignias.length;
    estado.xp += 30 * nuevasInsignias.length;
  }

  const nivelDespues = calcularNivel(estado.xp).nivelActual;
  guardarProgreso(estudiante, estado);

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
