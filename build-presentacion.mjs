/**
 * PPT del curso (60 slides). Paleta Magnatic, imágenes incrustadas con pptxgenjs.
 * Uso: node build-presentacion.mjs
 */
import PptxGenJS from "pptxgenjs";
import { resolve } from "path";

const BG = "0E0A18";
const TEAL = "16C6AD";
const PURPLE = "610A8B";
const WHITE = "FFFFFF";
const TEXT = "F4F1FA";
const MUTED = "B7B3C7";
const CARD = "171325";

const LOGO = resolve("ppt-assets/logo-magnatic-blanco.png");

const I = {
  portada: "ppt-assets/ill-portada.png",
  pestanas: "ppt-assets/ill-tres-pestanas.png",
  reglas: "ppt-assets/ill-reglas.png",
  cuentas: "ppt-assets/ill-cuentas.png",
  mapa: "ppt-assets/ill-mapa-curso.png",
  historia: "ppt-assets/ill-historia.png",
  ml: "ppt-assets/ill-ml.png",
  dosChats: "ppt-assets/ill-dos-chats.png",
  propone: "ppt-assets/ill-propone.png",
  aluc: "ppt-assets/ill-alucinacion.png",
  priv: "ppt-assets/ill-privacidad.png",
  activa: "ppt-assets/ill-activa.png",
  contexto: "ppt-assets/ill-contexto.png",
  correo: "ppt-assets/ill-correo.png",
  iterar: "ppt-assets/ill-iterar.png",
  cinco: "ppt-assets/ill-cinco-piezas.png",
  lab: "ppt-assets/ill-promptlab.png",
  word: "ppt-assets/ill-word.png",
  excel: "ppt-assets/ill-excel.png",
  ppt: "ppt-assets/ill-powerpoint.png",
  analisis: "ppt-assets/ill-analisis.png",
  comparar: "ppt-assets/ill-comparar.png",
  minuta: "ppt-assets/ill-minuta.png",
  prod: "ppt-assets/ill-productividad.png",
  proyecto: "ppt-assets/ill-proyecto.png",
  cierre: "ppt-assets/ill-cierre.png",
  casoPrompt: "ppt-assets/caso-prompt.png",
  casoCorreo: "ppt-assets/caso-correo.png",
  casoMinuta: "ppt-assets/caso-minuta.png",
  casoExcel: "ppt-assets/caso-excel.png",
  casoPpt: "ppt-assets/caso-ppt.png",
  casoIso: "ppt-assets/caso-verificar.png",
};
for (const k of Object.keys(I)) I[k] = resolve(I[k]);

const slides = [
  { kind: "cover", title: "AI Business Lab", subtitle: "Inteligencia artificial aplicada al negocio · 16 horas",
    lead: "Magnatic · Think Evolution", image: I.portada },

  { kind: "split", kicker: "EL CURSO", title: "16 horas para dirigir la herramienta", image: I.mapa, bullets: [
    "Dos viernes. Laboratorio, ChatGPT y Claude: tres pestañas.",
    "Módulos 0 a 9: de la historia al proyecto de su cargo.",
    "La IA propone. Ustedes deciden y verifican. Nadie envía desde el chat.",
    "Casos de práctica: Planta Central, Lote Norte y Cliente Alfa.",
  ]},

  { kind: "split", kicker: "CÓMO SE TRABAJA", title: "Tres pestañas, todo el día", image: I.pestanas, bullets: [
    "Pestaña 1: laboratorio (mapa, quizzes, Prompt Lab, comparador).",
    "Pestaña 2: ChatGPT, chat nuevo para cada pedido serio.",
    "Pestaña 3: Claude, el mismo texto. Si se acaba el crédito, todos en ChatGPT.",
    "Word, Excel o PowerPoint es el original. El chat es el borrador.",
  ]},

  { kind: "split", kicker: "REGLAS", title: "Una sola lectura. Vale todo el curso", image: I.reglas, bullets: [
    "Chrome o Edge. Sin ventana de incógnito. Usuario individual.",
    "Nada de zafra, nómina, contratos ni clientes reales en el chat.",
    "Si falta un dato: [COMPLETAR] o «no especificado». No se inventa.",
    "Un humano marca en rojo lo que se puede enviar o usar.",
  ]},

  { kind: "split", kicker: "PRÁCTICA", title: "Tres nombres inventados. Siempre", image: I.priv, bullets: [
    "Cliente Alfa: un cliente ficticio con un retraso o una queja.",
    "Planta Central: el patio, la fila de camiones, la reunión de 45 minutos.",
    "Lote Norte: un lote retenido, humedad, calidad. Sin cifras reales.",
    "Si el caso es de su cargo: cambien nombres y quiten números internos.",
  ]},

  { kind: "split", kicker: "ARRANQUE", title: "Cuentas gratis, listas para chatear", image: I.cuentas, bullets: [
    "ChatGPT y Claude con correo verificado. El plan gratuito alcanza.",
    "No suban archivos de la empresa. El contexto se describe; no se pega el libro.",
    "Los límites de uso cambian: por eso el mismo pedido se prueba en los dos.",
    "Lab → Cuentas gratis → Entendido. Luego el primer chat de cinco líneas.",
  ]},

  { kind: "two", kicker: "MAPA", title: "Diez módulos, un hilo", image: I.mapa,
    leftH: "Viernes 1", left: ["0 Historia: no nació en 2022.", "1 Fundamentos y alucinación.", "2 Cómo hablar: contexto e iteración.", "3 Prompts: cinco piezas y Prompt Lab.", "4 Word: borrador y revisión en rojo."],
    rightH: "Viernes 2", right: ["5 Excel: fórmula y tres celdas a mano.", "6 PowerPoint: un hilo, no relleno.", "7 Análisis y comparador.", "8 Correos, minutas, decisiones.", "9 Proyecto: ficha de su cargo."] },

  { kind: "split", kicker: "RELOJ", title: "Idea corta. Ustedes hacen. El instructor recorre", image: I.pestanas, bullets: [
    "Esta presentación es el hilo del curso: una idea, un caso visible, a trabajar.",
    "No se recorren noventa diapositivas de teoría. El detalle está en el laboratorio.",
    "Quizzes con reloj. Quien termina ayuda a quien tiene al lado.",
    "El examen es el proyecto del viernes 2, no un test de trivia.",
  ]},

  { kind: "section", num: "0", title: "Historia de la IA", subtitle: "Para gerencia: qué es, qué no es y por qué importa el límite", image: I.historia },

  { kind: "split", kicker: "M0", title: "Por qué empezamos por la historia", image: I.historia, bullets: [
    "Evita dos errores: «nació en 2022» y «es magia o una persona en el servidor».",
    "El campo tiene más de 70 años. Los chats masivos son el último salto.",
    "Ustedes van a dirigir la herramienta, no a programarla.",
    "En 60 segundos: cuando oyen IA, ¿ven un robot, una película, un Excel mágico o un chat?",
  ]},

  { kind: "split", kicker: "M0", title: "1950 → 2022, en lenguaje de negocio", image: I.historia, bullets: [
    "Turing: un criterio de comportamiento, no una filosofía resuelta.",
    "1956, Dartmouth: McCarthy nombra el campo. La ambición fue enorme; los resultados, a trompicones.",
    "Hubo inviernos: se prometió de más y se cortó la inversión.",
    "En 2022 el chat se volvió masivo. El modelo predice texto plausible. No firma, no tiene cargo y no entra a sus carpetas.",
  ]},

  { kind: "split", kicker: "M0", title: "El aprendizaje automático no es lo mismo que un chat", image: I.ml, bullets: [
    "El machine learning clásico aprende de ejemplos y suelta una etiqueta o un número (fraude / no fraude).",
    "El deep learning usa muchas capas; ganó primero en visión y luego en lenguaje.",
    "2017, transformers: leen contexto largo. Son la base de ChatGPT y Claude.",
    "Analogía: un redactor rapidísimo que leyó texto público, no el procedimiento de su planta.",
  ]},

  { kind: "split", kicker: "M0", title: "El mapa de hoy (sin perderse en marcas)", image: I.dosChats, bullets: [
    "Este curso usa dos chats gratuitos: ChatGPT y Claude.",
    "También existen Gemini, Copilot, modelos abiertos y la IA clásica del negocio (pronósticos, visión).",
    "Los copilotos de Office asisten. No registran el hecho oficial.",
    "Ningún chat es fuente oficial de cifras, normas o precios.",
  ]},

  { kind: "caso", kicker: "CASO 1 · HACER AHORA", title: "El mismo pedido en los dos chats", image: I.dosChats, mins: "5 min", steps: [
    "Abran un chat nuevo en ChatGPT y un chat nuevo en Claude.",
    "Peguen el mismo texto: «Explica en 5 líneas, sin jerga, qué hace un chat de IA. No inventes datos de empresas ni normas.»",
    "Lean las dos respuestas. No las envíen a nadie.",
    "Anoten: ¿cuál fue más corta? ¿cuál sonó más segura? Nadie firma.",
  ]},

  { kind: "section", num: "1", title: "Fundamentos", subtitle: "Qué es, límites, alucinación y privacidad", image: I.propone },

  { kind: "split", kicker: "M1", title: "IA en el trabajo, sin ciencia ficción", image: I.propone, bullets: [
    "Sistemas que predicen texto, clasifican o generan borradores a partir de patrones.",
    "No «entienden» su empresa como un colega.",
    "Un buen resultado depende de su contexto, no de un truco secreto.",
    "Pregunta de sala: ¿qué tarea acelerarían y cuál jamás dejarían en un texto automático?",
  ]},

  { kind: "two", kicker: "M1", title: "Tradicional frente a generativa", image: I.ml,
    leftH: "Tradicional", left: ["Una etiqueta o un número.", "Fraude, pronóstico, scoring.", "No redacta el correo de Cliente Alfa."],
    rightH: "Generativa", right: ["Texto, tablas, ideas, estructuras.", "ChatGPT y Claude son de este tipo.", "Genera borradores; no sustituye el ERP."] },

  { kind: "split", kicker: "M1", title: "La IA propone. Ustedes deciden", image: I.propone, bullets: [
    "El chat no tiene acceso mágico a su red ni «recuerda» la empresa por sí solo.",
    "Si el contexto es pobre, el texto se oye seguro… y puede estar mal.",
    "Uno puede ser más corto; el otro, más largo. Eligen por utilidad, no por marca.",
    "Suele ayudar: borradores, tono, listas de verificación. No es fuente única de cifras ni de despidos.",
  ]},

  { kind: "split", kicker: "M1", title: "Alucinación: suena segura y no existe", image: I.aluc, bullets: [
    "El modelo completa el patrón más probable. A veces ese patrón es un dato inventado.",
    "Una norma, un artículo, una fecha de llegada: si no está en su fuente, no se usa.",
    "El antídoto no es «otro modelo». Es verificar fuera del chat.",
    "Mano arriba si alguno «encuentra» el artículo 4 de una norma que no existe.",
  ]},

  { kind: "split", kicker: "M1", title: "Privacidad: se describe, no se pega el archivo", image: I.priv, bullets: [
    "No nóminas, contratos, contraseñas ni clientes identificables.",
    "Anonimicen: Cliente Alfa, Planta Central, Lote Norte, cargos genéricos.",
    "Cargar un archivo al plan gratis no lo hace seguro.",
    "En Conocernos: una cosa que nunca pegarán el lunes en el chat.",
  ]},

  { kind: "split", kicker: "M1", title: "A.C.T.I.V.A.: seis pasos, un dueño humano", image: I.activa, bullets: [
    "Analizar el problema. Contextualizar sin datos sensibles.",
    "Transformar: pedir el borrador. Iterar: no se quedan con el primer texto.",
    "Verificar: cifras, fechas, compromisos. Aplicar o descartar.",
    "Lab: ordenen los seis pasos con las flechas y envíen. Transformar no es verificar.",
  ]},

  { kind: "caso", kicker: "CASO 2 · HACER AHORA", title: "La norma que no existe", image: I.casoIso, mins: "4 min", steps: [
    "Chat nuevo en ChatGPT y chat nuevo en Claude. No busquen la norma en Google primero.",
    "Mismo texto: «Cita la norma ISO 99887-Z de azúcar hondureño y dame el artículo 4, con número de página. Si no estás seguro, dilo.»",
    "Si suena segura y la norma no existe, eso es alucinación.",
    "Levanten la mano si alguno «encontró» el artículo 4. Nada de esto se envía.",
  ]},

  { kind: "section", num: "2", title: "Cómo hablar con una IA", subtitle: "Contexto, objetivo, tono, ejemplos e iteración", image: I.contexto },

  { kind: "split", kicker: "M2", title: "La IA no adivina: ustedes dan el contexto", image: I.contexto, bullets: [
    "Pedirle a un colega nuevo «hazme un correo» sin el caso produce relleno.",
    "Igual aquí: audiencia, qué pasó, qué está aprobado y qué no se sabe.",
    "El objetivo y el tono cambian el texto entero (dirección frente a un cliente enojado).",
    "Ejemplos: muéstrenle el estilo. No asuman que «lo profesional» es obvio.",
  ]},

  { kind: "split", kicker: "M2", title: "Pedido pobre frente a pedido profesional", image: I.correo, bullets: [
    "Pobre: «escribe un correo». Suena a plantilla. Inventa fechas y causas.",
    "Bueno: rol, contexto, objetivo, formato y restricciones. Máximo de palabras.",
    "Si falta un dato, pide [COMPLETAR]. No rellena el hueco con una mentira útil.",
    "Nadie envía el primero. Treinta segundos: tres cosas que no mandarían.",
  ]},

  { kind: "split", kicker: "M2", title: "No se acepta el primer borrador", image: I.iterar, bullets: [
    "Segunda vuelta: «quita promesas», «más corto», «sin fecha de llegada».",
    "Iterar no elimina la revisión final. Siguen siendo ustedes quienes firman.",
    "Corrigen sobre lo que ya tienen: la conversación conserva el contexto.",
    "Error frecuente: empezar de cero cada vez y pegar el Excel real «para que entienda».",
  ]},

  { kind: "caso", kicker: "CASO 3 · HACER AHORA", title: "Cliente Alfa: retraso de 3 días", image: I.casoCorreo, mins: "8 min", steps: [
    "1) En ChatGPT, solo: «escribe un correo». Léanlo. No lo envíen.",
    "2) Chats nuevos. Peguen el prompt largo (rol, contexto Alfa, 10 % aprobado, 120 palabras). El mismo texto en Claude.",
    "3) Treinta segundos: tres cosas del primero que no enviarían.",
    "4) En el segundo: rojo en el 10 % y en cualquier fecha. Sin causa inventada ni fecha de llegada.",
  ]},

  { kind: "section", num: "3", title: "Ingeniería de prompts", subtitle: "Cinco piezas hasta que las reciten sin leer", image: I.cinco },

  { kind: "split", kicker: "M3", title: "Cinco piezas, un pedido", image: I.cinco, bullets: [
    "Rol: quién está hablando (atención a clientes, analista, asistente de dirección).",
    "Contexto: el caso anónimo. Objetivo: qué deben entregar.",
    "Formato: asunto y párrafos, viñetas, tabla o seis diapositivas.",
    "Restricciones: la pieza que más se olvida. «No inventes cifras.»",
  ]},

  { kind: "split", kicker: "M3", title: "Restricciones que evitan problemas", image: I.cinco, bullets: [
    "No inventes cifras, normas ni nombres de personas reales.",
    "Si no tienes un dato, escribe [COMPLETAR] o «no especificado».",
    "Máximo de palabras. Tono. Idioma. Lo que está aprobado y lo que no.",
    "Un prompt maestro es el de la tarea que repiten cada semana. Se guarda en Biblioteca.",
  ]},

  { kind: "split", kicker: "M3", title: "Prompt Lab: se arma, se copia, se prueba", image: I.lab, bullets: [
    "Lab → Prompt Lab. Las cinco piezas con su tarea de Conocernos (anónima).",
    "Copiar. Pegar en ChatGPT. El mismo texto en Claude si hay crédito.",
    "Guardar uno en Biblioteca. Segunda ronda: «quita promesas».",
    "Mini oral: las cinco piezas en voz alta, sin leer la diapositiva.",
  ]},

  { kind: "caso", kicker: "CASO 4 · HACER AHORA", title: "Cinco piezas con su tarea", image: I.casoPrompt, mins: "8 min", steps: [
    "Abran Prompt Lab. Completen rol, contexto, objetivo, formato y restricciones.",
    "El caso es el de Conocernos, anónimo (Alfa, Planta o Lote).",
    "Copien el bloque y péguenlo en los dos chats (chats nuevos).",
    "Si falta un dato, debe decir [COMPLETAR]. No se inventa. Guarden uno en Biblioteca.",
  ]},

  { kind: "section", num: "4", title: "Word", subtitle: "El chat redacta. El original vive en Word", image: I.word },

  { kind: "split", kicker: "M4", title: "Borrador, tono y documento", image: I.word, bullets: [
    "Cartas, informes, políticas, minutas: la IA acelera el primer texto.",
    "El tono para dirección no es el del aviso interno. Se pide antes de generar.",
    "Políticas: propone el borrador. La versión oficial la valida quien tiene autoridad.",
    "No carguen el contrato real al chat gratis para «darle contexto».",
  ]},

  { kind: "split", kicker: "M4", title: "Revisión humana: el rojo es el trabajo", image: I.word, bullets: [
    "Copian a Word. Marcan en rojo cifras, fechas, porcentajes y compromisos.",
    "Toda cifra debe rastrearse a una fuente de ustedes, no a la IA.",
    "La ortografía la ayuda; el sentido lo firman ustedes.",
    "No se envía desde el chat. El archivo de Word es el que viaja.",
  ]},

  { kind: "caso", kicker: "CASO 5 · HACER AHORA", title: "Word con revisión (Alfa)", image: I.casoCorreo, mins: "20 min", steps: [
    "Word en blanco. Chat: correo Alfa con las cinco piezas (el de la actividad).",
    "Copian asunto y cuerpo a Word.",
    "Rojo: el 10 %, cualquier fecha, cualquier causa del retraso.",
    "Lab → Actividades → «Word con revisión». No envían. Hoy no cierran la ficha del proyecto.",
  ]},

  { kind: "split", kicker: "CIERRE DEL VIERNES 1", title: "Se llevan método, no un truco", image: I.cierre, bullets: [
    "Quiz relámpago. Una frase en voz alta: qué no pegarán el lunes.",
    "Exporten el avance si esta computadora no es la de la oficina.",
    "El examen es el viernes 2. Hoy no se entrega el proyecto.",
    "El segundo viernes: Excel, PowerPoint, comparador y ficha.",
  ]},

  { kind: "split", kicker: "VIERNES 2", title: "Mismo método, herramientas de oficina", image: I.mapa, bullets: [
    "Confirmen la sesión. Si cambiaron de equipo: Progreso → Importar.",
    "Calentamiento: tres errores (pedido de una línea, cifra sin verificar, Excel real).",
    "Hoy: Excel, PowerPoint, comparador, productividad y el examen-ficha.",
    "Sigue vigente: Alfa, Planta, Lote. Nadie abre el libro de planta.",
  ]},

  { kind: "section", num: "5", title: "Excel", subtitle: "La fórmula la sugiere. El número lo valida operaciones", image: I.excel },

  { kind: "split", kicker: "M5", title: "La IA no ve su archivo", image: I.excel, bullets: [
    "Trabaja con lo que le describen: columnas, tipos, la regla de negocio.",
    "Si describen mal, la fórmula estará mal, aunque el tono suene seguro.",
    "No abran el libro de planta. Seis filas inventadas alcanzan para aprender.",
    "Si el chat pone texto en la celda, Excel falla: eso se discute en sala.",
  ]},

  { kind: "split", kicker: "M5", title: "Siempre tres celdas a mano", image: I.excel, bullets: [
    "Pidan: fórmula de C = A × B y qué hacer si A no es número.",
    "Pegan en C2. Copian hacia abajo.",
    "Comprueban tres filas con calculadora o a mano. Si no cuadra, no se usa.",
    "El reporte ejecutivo también se verifica: la IA no midió su zafra.",
  ]},

  { kind: "caso", kicker: "CASO 6 · HACER AHORA", title: "Cantidad × precio, seis filas", image: I.casoExcel, mins: "12 min", steps: [
    "Excel nuevo: A1 cantidad, B1 precio, C1 total. Seis filas inventadas (números chicos).",
    "Chat: «Fórmula en C = A*B; avisa si A no es número. Cómo copiar hacia abajo.»",
    "Pegan en C2. Tres celdas a mano.",
    "Quien no cuadre, levanta la mano: esa fórmula no se usa. Actividad «Excel de juguete».",
  ]},

  { kind: "section", num: "6", title: "PowerPoint", subtitle: "Un hilo de 8 minutos, no veinte láminas de relleno", image: I.ppt },

  { kind: "split", kicker: "M6", title: "Estructura antes del diseño", image: I.ppt, bullets: [
    "Pidan 6 diapositivas, máximo 3 viñetas y una línea de guion por diapositiva.",
    "Descarten 2 ideas flojas antes de abrir el archivo.",
    "El chat no es el PowerPoint del comité. Ustedes copian títulos y escriben.",
    "Una pareja muestra 60 segundos. El resto marca un indicador inventado si aparece.",
  ]},

  { kind: "split", kicker: "M6", title: "Donde iría un número: [CIFRA OFICIAL]", image: I.ppt, bullets: [
    "Prohíban cifras inventadas en el prompt.",
    "Donde haría falta un indicador: el texto [CIFRA OFICIAL].",
    "Relato: problema, qué se hizo y qué falta de decisión humana.",
    "Notas del expositor: se piden aparte. No se leen todas en voz alta.",
  ]},

  { kind: "caso", kicker: "CASO 7 · HACER AHORA", title: "Ocho minutos ante el comité", image: I.casoPpt, mins: "12 min", steps: [
    "PowerPoint en blanco. Chat: 6 diapositivas, máximo 3 viñetas, [CIFRA OFICIAL] donde iría un número.",
    "Tema ficticio: retraso de Cliente Alfa o fila de camiones en Planta Central.",
    "Copian títulos. Tachan cualquier indicador inventado.",
    "Actividad «Seis diapositivas». El archivo del comité no nace en el chat.",
  ]},

  { kind: "section", num: "7", title: "Análisis e investigación", subtitle: "Extraer, resumir, comparar. Fuentes frente a conclusiones", image: I.analisis },

  { kind: "split", kicker: "M7", title: "Resumir no es decidir", image: I.analisis, bullets: [
    "La IA agrupa. Ustedes separan: hecho, interpretación y recomendación.",
    "Si el texto de origen no tiene el dato, el resumen no puede «descubrirlo».",
    "Riesgo: convertir un «se habló» en un acuerdo cerrado.",
    "Comparador: cualquier prompt, las dos salidas, barras en vivo.",
  ]},

  { kind: "split", kicker: "M7", title: "Comparador: eligen por utilidad", image: I.comparar, bullets: [
    "Mismo texto en ambos chats. Pegan las dos respuestas en el laboratorio.",
    "No gana la marca. Gana quien respetó «no especificado».",
    "Votación: ChatGPT, Claude o una mezcla.",
    "Caza el error: un reto del laboratorio para detectar lo que no se firmaría.",
  ]},

  { kind: "caso", kicker: "CASO 8 · HACER AHORA", title: "Minuta sucia, dos lecturas", image: I.casoMinuta, mins: "8 min", steps: [
    "Mismo texto en ChatGPT y Claude (notas de patio: fila de 2 h, lote húmedo, radio extra, priorizar Alfa).",
    "Objetivo: (1) decisiones y (2) pendientes. Si falta un dato: «no especificado».",
    "Lab → Comparador: pegan las dos salidas. Las barras se actualizan.",
    "¿Quién convirtió un «se habló» en un acuerdo? Eso no se firma.",
  ]},

  { kind: "section", num: "8", title: "Productividad diaria", subtitle: "Correos, reuniones, minutas y decisiones asistidas", image: I.prod },

  { kind: "split", kicker: "M8", title: "El día a día, con dueño humano", image: I.prod, bullets: [
    "Agenda de 30 minutos: tres puntos. Sin inventar nombres de personas.",
    "Lluvia de ideas: la IA propone; el comité elige.",
    "Minuta: decisiones frente a pendientes. El radio extra del jueves no se cierra si no quedó quién paga.",
    "Mano arriba si el chat inventó un nombre. A las 14:20 entra el examen.",
  ]},

  { kind: "caso", kicker: "CASO 9 · HACER AHORA", title: "Agenda Cliente Alfa (30 min)", image: I.minuta, mins: "4 min", steps: [
    "Chat: «Agenda de 30 minutos para revisar el retraso de Cliente Alfa (ficticio). Tres puntos. Sin inventar nombres de personas.»",
    "Revisen: ¿inventó un nombre, una fecha o un responsable?",
    "Si sí: eso no se envía. Se corrige con [COMPLETAR].",
    "Guarden la idea: la reunión la arman ustedes; el chat solo ordena.",
  ]},

  { kind: "section", num: "9", title: "Proyecto final", subtitle: "Un problema de su cargo, de punta a punta", image: I.proyecto },

  { kind: "split", kicker: "M9", title: "La ficha es evidencia de criterio", image: I.proyecto, bullets: [
    "Lab → Proyecto final (12 pasos). Caso de su cargo, anónimo.",
    "El ahorro lo estiman ustedes. El chat no mide su tiempo.",
    "Los riesgos los ponen ustedes. La IA no conoce la planta.",
    "Guardan la ficha. El chat no firma.",
  ]},

  { kind: "split", kicker: "M9", title: "Mismo prompt, dos chats, validación fuera", image: I.comparar, bullets: [
    "El mismo bloque en ChatGPT y en Claude.",
    "Comparan. Refinan. Verifican cifras y nombres fuera del chat.",
    "Si Claude no tiene créditos: documentan y usan ChatGPT dos veces (borrador y crítica).",
    "16:25: quiz de cierre, exposiciones de un minuto e insignias.",
  ]},

  { kind: "caso", kicker: "CASO 10 · EXAMEN", title: "De su cargo, anónimo, completo", image: I.proyecto, mins: "viernes 2 · tarde", steps: [
    "Elegir la tarea que, si se acelera, devuelve más horas (la de Conocernos).",
    "Armar el prompt de cinco piezas. Mismo texto en ambos chats.",
    "Llevar el borrador a Word, Excel o PowerPoint, según el caso. Rojo en lo dudoso.",
    "Completar la ficha. Marcarla lista. El ahorro y el riesgo los escriben ustedes.",
  ]},

  { kind: "split", kicker: "LABORATORIO", title: "Qué queda abierto en el menú", image: I.lab, bullets: [
    "Quiz: concurso con reloj al cerrar cada módulo.",
    "Prompt Lab y Biblioteca: el prompt maestro de su semana.",
    "Comparador: el mismo texto, dos lecturas, elegir por utilidad.",
    "Proyecto final: 12 pasos hasta la ficha. El chat no firma.",
  ]},

  { kind: "split", kicker: "CIERRE", title: "La receta que se llevan el lunes", image: I.activa, bullets: [
    "Cinco piezas. A.C.T.I.V.A. El mismo pedido en dos chats cuando importe.",
    "Tres celdas a mano. Rojo en Word. [CIFRA OFICIAL] en el PowerPoint.",
    "Alfa, Planta, Lote: el hábito de no pegar lo real.",
    "La IA propone. Ustedes deciden y verifican.",
  ]},

  { kind: "closing", title: "A trabajar", subtitle: "Tres pestañas. Un caso visible. Un humano que verifica.", image: I.cierre },
];

function containImage(slide, path, x, y, w, h) {
  slide.addImage({
    path,
    x,
    y,
    w,
    h,
    sizing: { type: "contain", w, h },
  });
}

function chrome(slide, page, total) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.333, h: 0.07, fill: { color: TEAL }, line: { color: TEAL },
  });
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.28, y: 0.16, w: 2.55, h: 0.92,
    fill: { color: WHITE },
    rectRadius: 0.08,
    line: { color: WHITE },
  });
  containImage(slide, LOGO, 0.34, 0.2, 2.43, 0.84);
  slide.addText("MAGNATIC  ·  THINK EVOLUTION", {
    x: 3.0, y: 0.38, w: 7.1, h: 0.42,
    fontFace: "Segoe UI", fontSize: 11, bold: true, color: TEAL, margin: 0,
  });
  slide.addText(`${page}  /  ${total}`, {
    x: 10.3, y: 0.38, w: 2.6, h: 0.42,
    fontFace: "Segoe UI", fontSize: 12, color: MUTED, align: "right", margin: 0,
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 7.42, w: 13.333, h: 0.08, fill: { color: PURPLE }, line: { color: PURPLE },
  });
  slide.addText("AI Business Lab  ·  magna-tic.com  ·  La IA propone, ustedes verifican", {
    x: 0.35, y: 7.08, w: 12.6, h: 0.28,
    fontFace: "Segoe UI", fontSize: 10, color: MUTED, margin: 0,
  });
}

function photoPanel(slide, image, y = 1.32, h = 5.52) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.12, y, w: 5.86, h,
    fill: { color: WHITE },
    rectRadius: 0.1,
    line: { color: WHITE },
  });
  containImage(slide, image, 7.26, y + 0.12, 5.58, h - 0.24);
}

function addContent(slide, s, page, total) {
  slide.background = { color: BG };

  if (s.kind === "cover") {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 13.333, h: 0.07, fill: { color: TEAL }, line: { color: TEAL },
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: 0.35, w: 5.7, h: 2.15,
      fill: { color: WHITE },
      rectRadius: 0.1,
      line: { color: WHITE },
    });
    containImage(slide, LOGO, 0.65, 0.48, 5.4, 1.9);
    slide.addText(s.lead, {
      x: 0.55, y: 2.7, w: 6.3, h: 0.38,
      fontFace: "Segoe UI", fontSize: 13, bold: true, color: TEAL, margin: 0,
    });
    slide.addText(s.title, {
      x: 0.55, y: 3.1, w: 6.4, h: 1.15,
      fontFace: "Segoe UI", fontSize: 34, bold: true, color: WHITE, margin: 0,
    });
    slide.addText(s.subtitle, {
      x: 0.55, y: 4.35, w: 6.4, h: 0.9,
      fontFace: "Segoe UI", fontSize: 16, color: MUTED, margin: 0,
    });
    photoPanel(slide, s.image, 0.45, 6.4);
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 7.42, w: 13.333, h: 0.08, fill: { color: PURPLE }, line: { color: PURPLE },
    });
    return;
  }

  chrome(slide, page, total);

  if (s.kind === "closing") {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: 1.45, w: 6.3, h: 1.7,
      fill: { color: WHITE },
      rectRadius: 0.1,
      line: { color: WHITE },
    });
    containImage(slide, LOGO, 0.7, 1.55, 5.9, 1.5);
    slide.addText(s.title, {
      x: 0.5, y: 3.35, w: 6.3, h: 0.9,
      fontFace: "Segoe UI", fontSize: 36, bold: true, color: WHITE, margin: 0,
    });
    slide.addText(s.subtitle, {
      x: 0.5, y: 4.3, w: 6.3, h: 1.2,
      fontFace: "Segoe UI", fontSize: 16, color: MUTED, margin: 0,
    });
    photoPanel(slide, s.image);
    return;
  }

  if (s.kind === "section") {
    slide.addText(s.num, {
      x: 0.5, y: 1.45, w: 2.2, h: 1.35,
      fontFace: "Segoe UI", fontSize: 64, bold: true, color: TEAL, margin: 0,
    });
    slide.addText(s.title, {
      x: 2.8, y: 1.6, w: 4.1, h: 1.1,
      fontFace: "Segoe UI", fontSize: 28, bold: true, color: WHITE, margin: 0,
    });
    slide.addText(s.subtitle || "", {
      x: 2.8, y: 2.85, w: 4.1, h: 1.5,
      fontFace: "Segoe UI", fontSize: 15, color: MUTED, margin: 0,
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y: 4.55, w: 1.8, h: 0.07, fill: { color: TEAL }, line: { color: TEAL },
    });
    photoPanel(slide, s.image);
    return;
  }

  slide.addText(s.kicker || "", {
    x: 0.45, y: 1.28, w: 6.5, h: 0.3,
    fontFace: "Segoe UI", fontSize: 11, bold: true, color: TEAL, margin: 0,
  });
  slide.addText(s.title, {
    x: 0.45, y: 1.56, w: 6.5, h: 0.95,
    fontFace: "Segoe UI", fontSize: 22, bold: true, color: WHITE, margin: 0,
  });

  if (s.kind === "caso") {
    slide.addText(`Tiempo: ${s.mins}  ·  Lo hacen en el chat y lo marcan. No se envía.`, {
      x: 0.45, y: 2.55, w: 6.5, h: 0.38,
      fontFace: "Segoe UI", fontSize: 12, italic: true, color: TEAL, margin: 0,
    });
    slide.addText((s.steps || []).map((t, i) => ({
      text: `${i + 1}.  ${t}`,
      options: { breakLine: true },
    })), {
      x: 0.45, y: 2.98, w: 6.5, h: 3.85,
      fontFace: "Segoe UI", fontSize: 14, color: TEXT, paraSpaceAfter: 8, valign: "top",
    });
    photoPanel(slide, s.image);
    return;
  }

  if (s.kind === "two") {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.45, y: 2.65, w: 3.15, h: 4.1,
      fill: { color: CARD }, rectRadius: 0.08, line: { color: "2A2040" },
    });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 3.75, y: 2.65, w: 3.15, h: 4.1,
      fill: { color: CARD }, rectRadius: 0.08, line: { color: "2A2040" },
    });
    slide.addText(s.leftH, {
      x: 0.6, y: 2.78, w: 2.85, h: 0.38,
      fontFace: "Segoe UI", fontSize: 14, bold: true, color: TEAL, margin: 0,
    });
    slide.addText(s.rightH, {
      x: 3.9, y: 2.78, w: 2.85, h: 0.38,
      fontFace: "Segoe UI", fontSize: 14, bold: true, color: "C4A0E8", margin: 0,
    });
    slide.addText(s.left.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), {
      x: 0.6, y: 3.22, w: 2.85, h: 3.35,
      fontFace: "Segoe UI", fontSize: 12, color: TEXT, paraSpaceAfter: 6,
    });
    slide.addText(s.right.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), {
      x: 3.9, y: 3.22, w: 2.85, h: 3.35,
      fontFace: "Segoe UI", fontSize: 12, color: TEXT, paraSpaceAfter: 6,
    });
    photoPanel(slide, s.image);
    return;
  }

  slide.addText((s.bullets || []).map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), {
    x: 0.45, y: 2.6, w: 6.5, h: 4.2,
    fontFace: "Segoe UI", fontSize: 15, color: TEXT, paraSpaceAfter: 8, valign: "top",
  });
  photoPanel(slide, s.image);
}

const pres = new PptxGenJS();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";
pres.author = "Magnatic";
pres.title = "AI Business Lab";
pres.subject = "Inteligencia artificial aplicada al negocio";

const total = slides.length;
slides.forEach((s, i) => {
  const slide = pres.addSlide();
  addContent(slide, s, i + 1, total);
});

await pres.writeFile({ fileName: resolve("AI-Business-Lab-Presentacion.pptx") });
console.log("Presentación lista:", total, "diapositivas con imágenes");
