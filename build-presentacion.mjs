/**
 * PPT del curso (~60 slides): paleta magna-tic.com, fondo blanco, logo sin estirar.
 * Uso: node build-presentacion.mjs
 */
import { writeFileSync, readFileSync } from "fs";
import { basename } from "path";
import { crc32 as zcrc } from "zlib";

const TEAL = "16C6AD";
const PURPLE = "610A8B";
const NAVY = "1A0F2E";
const MUTED = "5B6475";
const LINE = "E6EBF3";
const CARD = "F4F7FB";
const WHITE = "FFFFFF";

const EMU = 914400;
const W = Math.round(13.333 * EMU);
const H = Math.round(7.5 * EMU);
const LOGO = "ppt-assets/logo-magnatic-blanco.png";

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

const slides = [
  { kind: "cover", title: "AI Business Lab", subtitle: "Inteligencia artificial aplicada al negocio · 16 horas",
    lead: "Magnatic · Think Evolution", image: I.portada },

  { kind: "split", kicker: "EL CURSO", title: "16 horas para dirigir la herramienta", image: I.mapa, bullets: [
    "2 viernes. Laboratorio + ChatGPT + Claude (tres pestañas).",
    "Módulos 0 a 9: de la historia al proyecto de su cargo.",
    "La IA propone. Ustedes deciden y verifican. Nadie envía desde el chat.",
    "Casos de práctica: Planta Central, Lote Norte, Cliente Alfa.",
  ]},

  { kind: "split", kicker: "CÓMO SE TRABAJA", title: "Tres pestañas, todo el día", image: I.pestanas, bullets: [
    "Pestaña 1: laboratorio (mapa, quizzes, Prompt Lab, comparador).",
    "Pestaña 2: ChatGPT, chat nuevo para cada pedido serio.",
    "Pestaña 3: Claude, el mismo texto. Si se acaba el crédito, todos en ChatGPT.",
    "Word, Excel o PowerPoint es el original. El chat es el borrador.",
  ]},

  { kind: "split", kicker: "REGLAS", title: "Dígala una vez. Se cumple todo el curso", image: I.reglas, bullets: [
    "Chrome o Edge. Sin ventana de incógnito. Usuario individual.",
    "Nada de zafra, nómina, contratos ni clientes reales en el chat.",
    "Si falta un dato: [COMPLETAR] o «no especificado». No se inventa.",
    "Un humano marca en rojo lo que se puede enviar o usar.",
  ]},

  { kind: "split", kicker: "PRÁCTICA", title: "Tres nombres inventados. Siempre", image: I.priv, bullets: [
    "Cliente Alfa: un cliente ficticio con un retraso o una queja.",
    "Planta Central: el patio, la fila de camiones, la reunión de 45 minutos.",
    "Lote Norte: un lote retenido, humedad, calidad. Sin cifras reales.",
    "Si el caso es de su cargo: cambie nombres y quite números internos.",
  ]},

  { kind: "split", kicker: "ARRANQUE", title: "Cuentas gratis, listas para chatear", image: I.cuentas, bullets: [
    "ChatGPT y Claude con correo verificado. Plan gratuito alcanza.",
    "No suban archivos de la empresa. El contexto se describe, no se pega el libro.",
    "Límites de uso cambian: por eso el mismo pedido se prueba en los dos.",
    "Lab → Cuentas gratis → Entendido. Luego el primer chat de 5 líneas.",
  ]},

  { kind: "two", kicker: "MAPA", title: "Diez módulos, un hilo", image: I.mapa,
    leftH: "Viernes 1", left: ["0 Historia: no nació en 2022.", "1 Fundamentos y alucinación.", "2 Cómo hablar: contexto e iteración.", "3 Prompts: cinco piezas y Prompt Lab.", "4 Word: borrador + revisión en rojo."],
    rightH: "Viernes 2", right: ["5 Excel: fórmula y 3 celdas a mano.", "6 PowerPoint: hilo, no relleno.", "7 Análisis y comparador.", "8 Correos, minutas, decisiones.", "9 Proyecto: ficha de su cargo."] },

  { kind: "split", kicker: "RELOJ", title: "Idea corta. Ellos hacen. Usted recorre", image: I.pestanas, bullets: [
    "Esta PPT es el hilo del curso: una idea, un caso visible, a trabajar.",
    "No se recorren 90 diapositivas de teoría. Si alguien pregunta un detalle, el laboratorio lo tiene.",
    "Quizzes con reloj. Quien termina ayuda al de al lado.",
    "El examen es el proyecto del viernes 2, no un test de trivia.",
  ]},

  { kind: "section", num: "0", title: "Historia de la IA", subtitle: "Para gerencia: qué es, qué no es, y por qué importa el límite", image: I.historia },

  { kind: "split", kicker: "M0", title: "Por qué empezamos por la historia", image: I.historia, bullets: [
    "Evita dos errores: «nació en 2022» y «es magia o una persona en el servidor».",
    "El campo tiene más de 70 años. Los chats masivos son el último salto.",
    "Ustedes van a dirigir la herramienta, no a programarla.",
    "En 60 segundos: cuando oyen IA, ¿ven robot, película, Excel mágico o un chat?",
  ]},

  { kind: "split", kicker: "M0", title: "1950 → 2022, en lenguaje de negocio", image: I.historia, bullets: [
    "Turing: un criterio de comportamiento, no una filosofía resuelta.",
    "1956 Dartmouth: McCarthy nombra el campo. La ambición fue enorme; los resultados, a trompicones.",
    "Hubo inviernos: se prometió de más y se cortó la inversión.",
    "2022 hizo masivo el chat. El modelo predice texto plausible. No firma, no tiene cargo, no entra a sus carpetas.",
  ]},

  { kind: "split", kicker: "M0", title: "Machine learning no es lo mismo que un chat", image: I.ml, bullets: [
    "ML clásico: aprende de ejemplos y suelta una etiqueta o un número (fraude / no fraude).",
    "Deep learning: muchas capas; ganó en visión y luego en lenguaje.",
    "2017 transformers: leen contexto largo. Base de ChatGPT y Claude.",
    "Analogía: un redactor rapidísimo que leyó texto público, no el procedimiento de su planta.",
  ]},

  { kind: "split", kicker: "M0", title: "El mapa de hoy (sin perderse en marcas)", image: I.dosChats, bullets: [
    "Este curso usa dos chats gratuitos: ChatGPT y Claude.",
    "También existen Gemini, Copilot, modelos abiertos y la IA clásica del negocio (pronósticos, visión).",
    "Copilotos de Office asisten. No registran el hecho oficial.",
    "Ningún chat es fuente oficial de cifras, normas o precios.",
  ]},

  { kind: "caso", kicker: "CASO 1 · HACER AHORA", title: "El mismo pedido en los dos chats", image: I.dosChats, mins: "5 min", steps: [
    "Chat nuevo en ChatGPT y chat nuevo en Claude.",
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

  { kind: "two", kicker: "M1", title: "Tradicional vs generativa", image: I.ml,
    leftH: "Tradicional", left: ["Una etiqueta o un número.", "Fraude, pronóstico, scoring.", "No redacta el correo de Cliente Alfa."],
    rightH: "Generativa", right: ["Texto, tablas, ideas, estructuras.", "ChatGPT y Claude son de este tipo.", "Genera borradores; no sustituye el ERP."] },

  { kind: "split", kicker: "M1", title: "La IA propone. Ustedes deciden", image: I.propone, bullets: [
    "El chat no tiene acceso mágico a su red ni «recuerda» la empresa sola.",
    "Si el contexto es pobre, el texto se oye seguro… y puede estar mal.",
    "Uno puede ser más corto; el otro más largo. Eligen por utilidad, no por marca.",
    "Suele ayudar: borradores, tono, checklists. No es fuente única de cifras ni de despidos.",
  ]},

  { kind: "split", kicker: "M1", title: "Alucinación: suena segura y no existe", image: I.aluc, bullets: [
    "El modelo completa el patrón más probable. A veces el patrón es un dato inventado.",
    "Una norma, un artículo, una fecha de llegada: si no está en su fuente, no se usa.",
    "El antídoto no es «otro modelo». Es verificar fuera del chat.",
    "Mano arriba si alguno «encuentra» el artículo 4 de una norma que no existe.",
  ]},

  { kind: "split", kicker: "M1", title: "Privacidad: se describe, no se pega el archivo", image: I.priv, bullets: [
    "No nóminas, contratos, contraseñas ni clientes identificables.",
    "Anonimice: Cliente Alfa, Planta Central, Lote Norte, cargos genéricos.",
    "Cargar un archivo al plan gratis no lo hace seguro.",
    "En Conocernos: una cosa que NUNCA pegarán el lunes en el chat.",
  ]},

  { kind: "split", kicker: "M1", title: "A.C.T.I.V.A.: seis pasos, un dueño humano", image: I.activa, bullets: [
    "Analizar el problema. Contextualizar sin datos sensibles.",
    "Transformar: pedir el borrador. Iterar: no se queda el primer texto.",
    "Verificar: cifras, fechas, compromisos. Aplicar o descartar.",
    "Lab: ordenen los seis pasos con las flechas y envíen. Transformar no es verificar.",
  ]},

  { kind: "caso", kicker: "CASO 2 · HACER AHORA", title: "La norma que no existe", image: I.casoIso, mins: "4 min", steps: [
    "Chat NUEVO en ChatGPT y chat NUEVO en Claude. No busquen la norma en Google primero.",
    "Mismo texto: «Cita la norma ISO 99887-Z de azúcar hondureño y dame el artículo 4, con número de página. Si no estás seguro, dilo.»",
    "Si suena segura y la norma no existe: eso es alucinación.",
    "Levanten la mano si alguno «encontró» el artículo 4. Nada de esto se envía.",
  ]},

  { kind: "section", num: "2", title: "Cómo hablar con una IA", subtitle: "Contexto, objetivo, tono, ejemplos e iteración", image: I.contexto },

  { kind: "split", kicker: "M2", title: "La IA no adivina: usted da el contexto", image: I.contexto, bullets: [
    "Pedirle a un colega nuevo «hazme un correo» sin el caso produce relleno.",
    "Igual aquí: audiencia, qué pasó, qué está aprobado, qué no se sabe.",
    "Objetivo y tono cambian el texto entero (dirección vs cliente enojado).",
    "Ejemplos: muéstrele el estilo. No asuma que «lo profesional» es obvio.",
  ]},

  { kind: "split", kicker: "M2", title: "Pedido pobre vs pedido profesional", image: I.correo, bullets: [
    "Pobre: «escribe un correo». Suena a plantilla. Inventa fechas y causas.",
    "Bueno: rol, contexto, objetivo, formato, restricciones. Máximo de palabras.",
    "Si falta un dato, pide [COMPLETAR]. No rellena el hueco con una mentira útil.",
    "Nadie envía el primero. 30 segundos: tres cosas que no mandarían.",
  ]},

  { kind: "split", kicker: "M2", title: "No se acepta el primer borrador", image: I.iterar, bullets: [
    "Segunda vuelta: «quita promesas», «más corto», «sin fecha de llegada».",
    "Iterar no elimina la revisión final. Siguen siendo ustedes quienes firman.",
    "Corrija sobre lo que ya tiene: la conversación conserva el contexto.",
    "Error frecuente: empezar de cero cada vez y pegar el Excel real «para que entienda».",
  ]},

  { kind: "caso", kicker: "CASO 3 · HACER AHORA", title: "Cliente Alfa: retraso de 3 días", image: I.casoCorreo, mins: "8 min", steps: [
    "1) ChatGPT, SOLO: «escribe un correo». Léanlo. No lo envíen.",
    "2) Chats nuevos. Peguen el prompt largo (rol + contexto Alfa + 10% aprobado + 120 palabras). El mismo texto en Claude.",
    "3) 30 segundos: tres cosas del primero que no enviarían.",
    "4) En el segundo: rojo en el 10% y en cualquier fecha. Sin causa inventada ni fecha de llegada.",
  ]},

  { kind: "section", num: "3", title: "Ingeniería de prompts", subtitle: "Cinco piezas hasta que las reciten sin leer", image: I.cinco },

  { kind: "split", kicker: "M3", title: "Cinco piezas, un pedido", image: I.cinco, bullets: [
    "Rol: quién está hablando (atención a clientes, analista, asistente de dirección).",
    "Contexto: el caso anónimo. Objetivo: qué deben entregar.",
    "Formato: asunto + párrafos, viñetas, tabla, 6 diapositivas.",
    "Restricciones: la pieza que más se olvida. «No inventes cifras.»",
  ]},

  { kind: "split", kicker: "M3", title: "Restricciones que evitan problemas", image: I.cinco, bullets: [
    "No inventes cifras, normas ni nombres de personas reales.",
    "Si no tienes un dato, escribe [COMPLETAR] o «no especificado».",
    "Máximo de palabras. Tono. Idioma. Lo que está aprobado y lo que no.",
    "Un prompt maestro es el de la tarea que repiten cada semana. Se guarda en Biblioteca.",
  ]},

  { kind: "split", kicker: "M3", title: "Prompt Lab: se arma, se copia, se prueba", image: I.lab, bullets: [
    "Lab → Prompt Lab. Las cinco piezas con SU tarea de Conocernos (anónima).",
    "Copiar. Pegar en ChatGPT. El mismo texto en Claude si hay crédito.",
    "Guardar uno en Biblioteca. Segunda ronda: «quita promesas».",
    "Mini oral: las cinco piezas en voz alta, sin leer la diapositiva.",
  ]},

  { kind: "caso", kicker: "CASO 4 · HACER AHORA", title: "Cinco piezas con su tarea", image: I.casoPrompt, mins: "8 min", steps: [
    "Abran Prompt Lab. Completen rol, contexto, objetivo, formato y restricciones.",
    "El caso es el de Conocernos, anónimo (Alfa / Planta / Lote).",
    "Copien el bloque y péguenlo en los dos chats (chats nuevos).",
    "Si falta un dato, debe decir [COMPLETAR]. No se inventa. Guardan 1 en Biblioteca.",
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
    "Ortografía la ayuda; el sentido lo firman ustedes.",
    "No se envía desde el chat. El archivo de Word es el que viaja.",
  ]},

  { kind: "caso", kicker: "CASO 5 · HACER AHORA", title: "Word con revisión (Alfa)", image: I.casoCorreo, mins: "20 min", steps: [
    "Word en blanco. Chat: correo Alfa con las cinco piezas (el de la actividad).",
    "Copian asunto y cuerpo a Word.",
    "Rojo: el 10%, cualquier fecha, cualquier causa del retraso.",
    "Lab → Actividades → «Word con revisión». No envían. No cierran la ficha del proyecto hoy.",
  ]},

  { kind: "split", kicker: "CIERRE VIERNES 1", title: "Se llevan método, no un truco", image: I.cierre, bullets: [
    "Quiz relámpago. Una frase en voz alta: qué no pegarán el lunes.",
    "Exportar avance si esta PC no es la de la oficina.",
    "El examen es el viernes 2. Hoy no se entrega el proyecto.",
    "Mañana de trabajo: Excel, PPT, comparador, ficha.",
  ]},

  { kind: "split", kicker: "VIERNES 2", title: "Mismo método, herramientas de oficina", image: I.mapa, bullets: [
    "Confirmen sesión. Si cambiaron de PC: Progreso → Importar.",
    "Calentamiento: tres errores (pedido de una línea, cifra sin verificar, Excel real).",
    "Hoy: Excel, PowerPoint, comparador, productividad y el examen-ficha.",
    "Sigue vigente: Alfa, Planta, Lote. Nadie abre el libro de planta.",
  ]},

  { kind: "section", num: "5", title: "Excel", subtitle: "La fórmula la sugiere. El número lo valida operaciones", image: I.excel },

  { kind: "split", kicker: "M5", title: "La IA no ve su archivo", image: I.excel, bullets: [
    "Trabaja con lo que le describen: columnas, tipos, la regla de negocio.",
    "Si describen mal, la fórmula estará mal con mucha seguridad en el tono.",
    "No abran el libro de planta. Seis filas inventadas alcanzan para aprender.",
    "Si el chat pone texto en la celda, Excel falla: eso se discute en sala.",
  ]},

  { kind: "split", kicker: "M5", title: "Siempre tres celdas a mano", image: I.excel, bullets: [
    "Pidan: fórmula de C = A×B y qué hacer si A no es número.",
    "Pegan en C2. Copian hacia abajo.",
    "Comprueban 3 filas con calculadora o a mano. Si no cuadra, no se usa.",
    "El reporte ejecutivo también se verifica: la IA no midió su zafra.",
  ]},

  { kind: "caso", kicker: "CASO 6 · HACER AHORA", title: "Cantidad × precio, 6 filas", image: I.casoExcel, mins: "12 min", steps: [
    "Excel nuevo: A1 cantidad, B1 precio, C1 total. 6 filas inventadas (números chicos).",
    "Chat: «Fórmula en C = A*B; avisa si A no es número. Cómo copiar hacia abajo.»",
    "Pegan en C2. Tres celdas a mano.",
    "Quien no cuadre, levanta la mano: esa fórmula no se usa. Actividad «Excel de juguete».",
  ]},

  { kind: "section", num: "6", title: "PowerPoint", subtitle: "Un hilo de 8 minutos, no 20 láminas de relleno", image: I.ppt },

  { kind: "split", kicker: "M6", title: "Estructura antes del diseño", image: I.ppt, bullets: [
    "Pidan 6 diapositivas, máximo 3 viñetas, una línea de guion por slide.",
    "Descarten 2 ideas flojas antes de abrir el archivo.",
    "El chat no es el PPT del comité. Ustedes copian títulos y escriben.",
    "Una pareja muestra 60 segundos. El resto marca un KPI inventado si aparece.",
  ]},

  { kind: "split", kicker: "M6", title: "Donde iría un número: [CIFRA OFICIAL]", image: I.ppt, bullets: [
    "Prohíban cifras inventadas en el prompt.",
    "Donde haría falta un KPI: el texto [CIFRA OFICIAL].",
    "Storytelling: problema → qué se hizo → qué falta decisión humana.",
    "Notas del expositor: las pide aparte. No las lee en voz alta todas.",
  ]},

  { kind: "caso", kicker: "CASO 7 · HACER AHORA", title: "Ocho minutos ante comité", image: I.casoPpt, mins: "12 min", steps: [
    "PowerPoint en blanco. Chat: 6 diapositivas, máx. 3 viñetas, [CIFRA OFICIAL] donde iría un número.",
    "Tema ficticio: retraso Cliente Alfa o fila de camiones en Planta Central.",
    "Copian títulos. Tachan cualquier KPI inventado.",
    "Actividad «Seis slides». El archivo del comité no nace en el chat.",
  ]},

  { kind: "section", num: "7", title: "Análisis e investigación", subtitle: "Extraer, resumir, comparar. Fuentes vs conclusiones", image: I.analisis },

  { kind: "split", kicker: "M7", title: "Resumir no es decidir", image: I.analisis, bullets: [
    "La IA agrupa. Ustedes separan: hecho, interpretación, recomendación.",
    "Si el texto de origen no tiene el dato, el resumen no puede «descubrirlo».",
    "Riesgo: convertir un «se habló» en un acuerdo cerrado.",
    "Comparador: cualquier prompt, las dos salidas, barras en vivo.",
  ]},

  { kind: "split", kicker: "M7", title: "Comparador: eligen por utilidad", image: I.comparar, bullets: [
    "Mismo texto en ambos chats. Pegan las dos respuestas en el laboratorio.",
    "No gana la marca. Gana quién respetó «no especificado».",
    "Votación: ChatGPT, Claude o mezcla.",
    "Caza el error: un reto del lab para detectar lo que no se firmaría.",
  ]},

  { kind: "caso", kicker: "CASO 8 · HACER AHORA", title: "Minuta sucia, dos lecturas", image: I.casoMinuta, mins: "8 min", steps: [
    "Mismo texto en ChatGPT y Claude (notas de patio: fila 2 h, lote húmedo, radio extra, priorizar Alfa).",
    "Objetivo: (1) decisiones (2) pendientes. Si falta dato: «no especificado».",
    "Lab → Comparador: pegan las dos salidas. Las barras se actualizan.",
    "¿Quién convirtió un «se habló» en un acuerdo? Eso no se firma.",
  ]},

  { kind: "section", num: "8", title: "Productividad diaria", subtitle: "Correos, reuniones, minutas y decisiones asistidas", image: I.prod },

  { kind: "split", kicker: "M8", title: "El día a día, con dueño humano", image: I.prod, bullets: [
    "Agenda de 30 minutos: tres puntos. Sin inventar nombres de personas.",
    "Lluvia de ideas: la IA propone; el comité elige.",
    "Minuta: decisiones vs pendientes. El radio extra del jueves no se cierra si no quedó quién paga.",
    "Mano arriba si el chat inventó un nombre. A las 14:20 entra el examen.",
  ]},

  { kind: "caso", kicker: "CASO 9 · HACER AHORA", title: "Agenda Cliente Alfa (30 min)", image: I.minuta, mins: "4 min", steps: [
    "Chat: «Agenda de 30 minutos para revisar retraso Cliente Alfa (ficticio). Tres puntos. Sin inventar nombres de personas.»",
    "Revisen: ¿inventó un nombre, una fecha o un responsable?",
    "Si sí: eso no se envía. Se corrige con [COMPLETAR].",
    "Guarden la idea: la reunión la arman ustedes; el chat solo ordena.",
  ]},

  { kind: "section", num: "9", title: "Proyecto final", subtitle: "Un problema de su cargo, de punta a punta", image: I.proyecto },

  { kind: "split", kicker: "M9", title: "La ficha es evidencia de criterio", image: I.proyecto, bullets: [
    "Lab → Proyecto final (12 pasos). Caso de SU cargo, anónimo.",
    "El ahorro lo estiman ustedes. El chat no mide su tiempo.",
    "Riesgos: los ponen ustedes. La IA no conoce la planta.",
    "Guardan la ficha. El chat no firma.",
  ]},

  { kind: "split", kicker: "M9", title: "Mismo prompt, dos chats, validación fuera", image: I.comparar, bullets: [
    "El mismo bloque en ChatGPT y en Claude.",
    "Comparan. Refinan. Verifican cifras y nombres fuera del chat.",
    "Si Claude no tiene créditos: documentan y usan ChatGPT dos veces (borrador + crítica).",
    "16:25: quiz de cierre, exposiciones de 1 minuto, insignias.",
  ]},

  { kind: "caso", kicker: "CASO 10 · EXAMEN", title: "De su cargo, anónimo, completo", image: I.proyecto, mins: "viernes 2 · tarde", steps: [
    "Elegir la tarea que, si se acelera, devuelve más horas (la de Conocernos).",
    "Armar el prompt de cinco piezas. Mismo texto en ambos chats.",
    "Llevar el borrador a Word, Excel o PPT según el caso. Rojo en lo dudoso.",
    "Completar la ficha. Marcar lista. El ahorro y el riesgo los escriben ustedes.",
  ]},

  { kind: "split", kicker: "LABORATORIO", title: "Qué queda abierto en el menú", image: I.lab, bullets: [
    "Quiz: concurso con reloj al cerrar cada módulo.",
    "Prompt Lab y Biblioteca: el prompt maestro de su semana.",
    "Comparador: el mismo texto, dos lecturas, elegir por utilidad.",
    "Proyecto final: 12 pasos hasta la ficha. El chat no firma.",
  ]},

  { kind: "split", kicker: "CIERRE", title: "La receta que se llevan el lunes", image: I.activa, bullets: [
    "Cinco piezas. A.C.T.I.V.A. Mismo pedido en dos chats cuando importe.",
    "Tres celdas a mano. Rojo en Word. [CIFRA OFICIAL] en el PPT.",
    "Alfa, Planta, Lote: el hábito de no pegar lo real.",
    "La IA propone. Ustedes deciden y verifican.",
  ]},

  { kind: "closing", title: "A trabajar", subtitle: "Tres pestañas. Un caso visible. Un humano que verifica.", image: I.cierre },
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function fit(iw, ih, bw, bh) {
  const ar = iw / ih;
  const box = bw / bh;
  let w, h;
  if (ar > box) {
    w = bw;
    h = bw / ar;
  } else {
    h = bh;
    w = bh * ar;
  }
  return { w, h, ox: (bw - w) / 2, oy: (bh - h) / 2 };
}

function runXml(r) {
  const props = [`sz="${(r.sz || 18) * 100}"`];
  if (r.b) props.push('b="1"');
  if (r.i) props.push('i="1"');
  return `<a:r><a:rPr lang="es-ES" ${props.join(" ")}><a:solidFill><a:srgbClr val="${r.color || NAVY}"/></a:solidFill><a:latin typeface="Segoe UI"/><a:ea typeface="Segoe UI"/></a:rPr><a:t>${esc(r.text)}</a:t></a:r>`;
}

function paraXml(r) {
  const align = r.align ? ` algn="${r.align}"` : "";
  const bu = r.bullet
    ? '<a:buFont typeface="Arial"/><a:buChar char="•"/>'
    : r.num
      ? `<a:buFont typeface="Segoe UI"/><a:buAutoNum type="arabicPeriod"/>`
      : "<a:buNone/>";
  const marL = r.bullet || r.num ? ' marL="320040" indent="-320040"' : "";
  const spc = r.spcAfter != null ? `<a:spcAft><a:spcPts val="${r.spcAfter}"/></a:spcAft>` : "";
  return `<a:p><a:pPr${marL}${align}>${spc}${bu}</a:pPr>${runXml(r)}</a:p>`;
}

function sp(id, name, xIn, yIn, wIn, hIn, runs, { anchor = "t", fill = null, round = false } = {}) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  const body = (runs || []).map(paraXml).join("");
  const fillXml = fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>` : "<a:noFill/>";
  const prst = round ? "roundRect" : "rect";
  const av = round ? '<a:avLst><a:gd name="adj" fmla="val 6000"/></a:avLst>' : "<a:avLst/>";
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="${prst}">${av}</a:prstGeom>${fillXml}<a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="${anchor}"><a:normAutofit/></a:bodyPr><a:lstStyle/>${body || "<a:p/>"}</p:txBody></p:sp>`;
}

function pic(id, rId, xIn, yIn, wIn, hIn) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Pic${id}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
}

const logoBuf = readFileSync(LOGO);
const logoPx = pngSize(logoBuf);

function placeLogo(id, x, y, maxW, maxH) {
  const f = fit(logoPx.w, logoPx.h, maxW, maxH);
  return pic(id, "rId2", x + f.ox, y + f.oy, f.w, f.h);
}

function placeImg(id, rId, path, x, y, maxW, maxH) {
  const px = pngSize(readFileSync(path));
  const f = fit(px.w, px.h, maxW, maxH);
  return pic(id, rId, x + f.ox, y + f.oy, f.w, f.h);
}

function chrome(out, idRef, page, total, { bigLogo = false } = {}) {
  let id = idRef;
  out.push(sp(id++, "bg", 0, 0, 13.333, 7.5, [], { fill: WHITE }));
  out.push(sp(id++, "top", 0, 0, 13.333, 0.08, [], { fill: TEAL }));
  if (!bigLogo) {
    out.push(placeLogo(id++, 0.35, 0.18, 2.35, 0.95));
    out.push(sp(id++, "brand", 2.85, 0.38, 7.2, 0.55, [{ text: "MAGNATIC  ·  THINK EVOLUTION", sz: 11, b: 1, color: PURPLE }]));
    out.push(sp(id++, "pg", 10.4, 0.4, 2.5, 0.45, [{ text: `${page} / ${total}`, sz: 12, color: MUTED, align: "r" }]));
    out.push(sp(id++, "rule", 0, 1.22, 13.333, 0.03, [], { fill: LINE }));
  }
  out.push(sp(id++, "bot", 0, 7.38, 13.333, 0.12, [], { fill: PURPLE }));
  out.push(sp(id++, "ft", 0.4, 7.08, 12.5, 0.28, [{ text: "AI Business Lab  ·  magna-tic.com  ·  La IA propone, ustedes verifican", sz: 10, color: MUTED }]));
  return id;
}

function shapesFor(s, page, total) {
  const out = [];
  let id = 2;

  if (s.kind === "cover") {
    id = chrome(out, id, page, total, { bigLogo: true });
    out.push(placeLogo(id++, 0.55, 0.35, 5.4, 2.15));
    out.push(sp(id++, "k", 0.55, 2.55, 6.3, 0.4, [{ text: s.lead, sz: 13, b: 1, color: TEAL }]));
    out.push(sp(id++, "t", 0.55, 2.95, 6.4, 1.5, [{ text: s.title, sz: 36, b: 1, color: NAVY }]));
    out.push(sp(id++, "s", 0.55, 4.5, 6.4, 1.1, [{ text: s.subtitle, sz: 16, color: MUTED }]));
    out.push(sp(id++, "frame", 7.15, 0.45, 5.7, 6.35, [], { fill: CARD, round: true }));
    out.push(placeImg(id++, "rId3", s.image, 7.3, 0.6, 5.4, 6.05));
    return out.join("");
  }

  if (s.kind === "closing") {
    id = chrome(out, id, page, total);
    out.push(placeLogo(id++, 0.55, 1.5, 4.8, 1.7));
    out.push(sp(id++, "t", 0.55, 3.35, 6.2, 1.1, [{ text: s.title, sz: 40, b: 1, color: NAVY }]));
    out.push(sp(id++, "s", 0.55, 4.5, 6.2, 1.4, [{ text: s.subtitle, sz: 18, color: MUTED }]));
    out.push(sp(id++, "frame", 7.15, 1.5, 5.7, 5.2, [], { fill: CARD, round: true }));
    out.push(placeImg(id++, "rId3", s.image, 7.3, 1.65, 5.4, 4.9));
    return out.join("");
  }

  if (s.kind === "section") {
    id = chrome(out, id, page, total);
    out.push(sp(id++, "num", 0.5, 1.55, 2.4, 1.5, [{ text: s.num, sz: 72, b: 1, color: TEAL }]));
    out.push(sp(id++, "t", 3.0, 1.7, 4.4, 1.3, [{ text: s.title, sz: 32, b: 1, color: NAVY }]));
    out.push(sp(id++, "sub", 3.0, 3.05, 4.4, 1.5, [{ text: s.subtitle || "", sz: 16, color: MUTED }]));
    out.push(sp(id++, "bar", 0.5, 4.7, 2.2, 0.08, [], { fill: PURPLE }));
    out.push(sp(id++, "frame", 7.15, 1.5, 5.7, 5.2, [], { fill: CARD, round: true }));
    out.push(placeImg(id++, "rId3", s.image, 7.3, 1.65, 5.4, 4.9));
    return out.join("");
  }

  id = chrome(out, id, page, total);
  out.push(sp(id++, "kick", 0.5, 1.38, 6.4, 0.32, [{ text: s.kicker || "", sz: 11, b: 1, color: TEAL }]));
  out.push(sp(id++, "t", 0.5, 1.68, 6.5, 1.05, [{ text: s.title, sz: 24, b: 1, color: NAVY }]));

  if (s.kind === "caso") {
    out.push(sp(id++, "mins", 0.5, 2.7, 6.5, 0.32, [{ text: "Tiempo: " + (s.mins || "") + "  ·  Lo hacen en el chat y lo marcan. No se envía.", sz: 12, i: 1, color: PURPLE }]));
    out.push(sp(id++, "steps", 0.5, 3.05, 6.5, 3.85, (s.steps || []).map((t) => ({ text: t, sz: 14, color: NAVY, num: true, spcAfter: 500 }))));
    out.push(sp(id++, "frame", 7.15, 1.45, 5.7, 5.35, [], { fill: CARD, round: true }));
    out.push(placeImg(id++, "rId3", s.image, 7.3, 1.6, 5.4, 5.05));
    return out.join("");
  }

  if (s.kind === "two") {
    out.push(sp(id++, "lc", 0.5, 2.85, 3.15, 3.95, [], { fill: CARD, round: true }));
    out.push(sp(id++, "rc", 3.8, 2.85, 3.15, 3.95, [], { fill: CARD, round: true }));
    out.push(sp(id++, "lh", 0.65, 3.0, 2.85, 0.4, [{ text: s.leftH, sz: 14, b: 1, color: TEAL }]));
    out.push(sp(id++, "rh", 3.95, 3.0, 2.85, 0.4, [{ text: s.rightH, sz: 14, b: 1, color: PURPLE }]));
    out.push(sp(id++, "lb", 0.65, 3.45, 2.85, 3.2, s.left.map((t) => ({ text: t, sz: 12, color: NAVY, bullet: true, spcAfter: 280 }))));
    out.push(sp(id++, "rb", 3.95, 3.45, 2.85, 3.2, s.right.map((t) => ({ text: t, sz: 12, color: NAVY, bullet: true, spcAfter: 280 }))));
    out.push(sp(id++, "frame", 7.15, 1.45, 5.7, 5.35, [], { fill: CARD, round: true }));
    out.push(placeImg(id++, "rId3", s.image, 7.3, 1.6, 5.4, 5.05));
    return out.join("");
  }

  out.push(sp(id++, "body", 0.5, 2.8, 6.5, 4.1, (s.bullets || []).map((t) => ({ text: t, sz: 15, color: NAVY, bullet: true, spcAfter: 420 }))));
  out.push(sp(id++, "frame", 7.15, 1.45, 5.7, 5.35, [], { fill: CARD, round: true }));
  out.push(placeImg(id++, "rId3", s.image, 7.3, 1.6, 5.4, 5.05));
  return out.join("");
}

function slideXml(s, page, total) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapesFor(s, page, total)}</p:spTree></p:cSld></p:sld>`;
}

const files = {};
const mediaNames = new Map();
function mediaTarget(abs) {
  const base = basename(abs);
  const key = `ppt/media/${base}`;
  if (!mediaNames.has(abs)) {
    files[key] = readFileSync(abs);
    mediaNames.set(abs, base);
  }
  return `../media/${base}`;
}

files["[Content_Types].xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")}</Types>`;
files["_rels/.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
files["ppt/presentation.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("")}</p:sldIdLst><p:sldSz cx="${W}" cy="${H}" type="screen16x9"/><p:notesSz cx="${H}" cy="${W}"/></p:presentation>`;
files["ppt/_rels/presentation.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>${slides.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("")}<Relationship Id="rId${slides.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>`;
files["ppt/theme/theme1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Magnatic"><a:themeElements><a:clrScheme name="Magnatic"><a:dk1><a:srgbClr val="1A0F2E"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="1A0F2E"/></a:dk2><a:lt2><a:srgbClr val="F4F7FB"/></a:lt2><a:accent1><a:srgbClr val="16C6AD"/></a:accent1><a:accent2><a:srgbClr val="610A8B"/></a:accent2><a:accent3><a:srgbClr val="10B981"/></a:accent3><a:accent4><a:srgbClr val="16C6AD"/></a:accent4><a:accent5><a:srgbClr val="610A8B"/></a:accent5><a:accent6><a:srgbClr val="10B981"/></a:accent6><a:hlink><a:srgbClr val="16C6AD"/></a:hlink><a:folHlink><a:srgbClr val="610A8B"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
files["ppt/slideMasters/slideMaster1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`;
files["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
files["ppt/slideLayouts/slideLayout1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
files["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;

const total = slides.length;
slides.forEach((s, i) => {
  files[`ppt/slides/slide${i + 1}.xml`] = slideXml(s, i + 1, total);
  const logoRel = `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${mediaTarget(LOGO)}"/>`;
  const imgRel = s.image
    ? `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${mediaTarget(s.image)}"/>`
    : "";
  files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>${logoRel}${imgRel}</Relationships>`;
});

function makeZip(fileMap) {
  const chunks = [], central = [];
  let offset = 0;
  const time = 0, date = 0x21;
  const names = Object.keys(fileMap).sort((a, b) => {
    if (a === "[Content_Types].xml") return -1;
    if (b === "[Content_Types].xml") return 1;
    if (a === "_rels/.rels") return -1;
    if (b === "_rels/.rels") return 1;
    return a.localeCompare(b);
  });
  for (const name of names) {
    const content = fileMap[name];
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const crc = zcrc(data) >>> 0;
    const size = data.length;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(size, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    chunks.push(local, nameBuf, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(size, 20);
    cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + size;
  }
  const centralStart = offset;
  let centralSize = 0;
  for (const c of central) centralSize += c.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  const count = names.length;
  end.writeUInt16LE(count, 8);
  end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(centralStart, 16);
  return Buffer.concat([...chunks, ...central, end]);
}

writeFileSync("AI-Business-Lab-Presentacion.pptx", makeZip(files));
console.log("Presentación:", slides.length, "diapositivas");
