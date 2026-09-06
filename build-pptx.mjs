// Genera una presentación .pptx para el temario comprado (M1–M9).
// Dinámicas en vivo, analogías y diseño. Sin dependencias externas.
import { writeFileSync, readFileSync } from "fs";
import { extname } from "path";
import { crc32 as zcrc } from "zlib";

// Marca Magnatic
const TEAL = "16C6AD";
const PURPLE = "610A8B";
const GOLD = "FFD700";
const DARK = "0B1220";
const CARD = "162033";
const WHITE = "FFFFFF";
const MUTED = "9AA8C2";

// Tipos de slide:
//  cover     : portada
//  section   : separador de sección (número grande + título)
//  bullets    : título + viñetas
//  analogy    : título + frase de analogía grande + apoyo
//  two        : título + dos columnas (izq/der con encabezado)
//  quote      : frase central grande
//  steps      : título + lista numerada
//  closing   : cierre
const slides = [
  { kind: "cover", title: "AI Business Lab", subtitle: "Inteligencia artificial aplicada al negocio",
    foot: "Central de Ingenios (CISA) · 16 horas · 2 viernes · cuentas gratuitas", brand: "Magnatic · Think Evolution" },

  { kind: "section", num: "0", title: "Cómo vamos a trabajar" },

  { kind: "talk", title: "Ronda en vivo (2 min)", prompt: "Nombre, cargo y UNA tarea de su semana que les quite tiempo. Sin clientes reales, sin montos, sin nómina.",
    hint: "Si hace falta un ejemplo: Cliente Alfa y Planta Norte. Anótenlo: será el hilo de los dos viernes." },

  { kind: "two", title: "Temario comprado · mapa de las 16 horas",
    leftH: "Viernes 1 — M1 a M4", left: ["M1 Fundamentos de IA generativa.", "M2 Cómo hablar con una IA.", "M3 Ingeniería de prompts.", "M4 IA aplicada a Word."],
    rightH: "Viernes 2 — M5 a M9", right: ["M5 Excel. M6 PowerPoint.", "M7 Análisis e investigación.", "M8 Productividad diaria.", "M9 Proyecto final (examen 14:20)."] },

  { kind: "bullets", title: "Reglas (una vez) y sitio del cliente",
    bullets: [
      "Tres pestañas: laboratorio, ChatGPT, Claude. Chrome o Edge, no incógnito.",
      "Cuentas gratuitas. Si Claude se queda sin créditos, el mismo prompt en ChatGPT.",
      "CISA es azúcar, calidad e inocuidad (cisahn.com). Aquí no pegamos zafra, contratos ni clientes reales.",
      "Práctica con Planta Norte y Cliente Alfa. La IA propone. Ustedes deciden y verifican.",
    ] },

  { kind: "section", num: "1", title: "M1 · Fundamentos" },

  { kind: "talk", title: "Pregunta en vivo", prompt: "Cuando oyen inteligencia artificial, ¿qué ven? Robot, película, Excel mágico o este chat. Levanten la mano.",
    hint: "Todas valen. Ahora aterrizamos: no es un colega y no firma." },

  { kind: "two", title: "¿Qué es la inteligencia artificial?",
    leftH: "En lenguaje de oficina", left: ["Sistemas que predicen, clasifican o generan a partir de patrones.", "No «entienden» su planta como un colega.", "Ustedes siguen decidiendo, verificando y firmando."],
    rightH: "Qué no es", right: ["No es magia. No es el ERP.", "No es una persona dentro del servidor.", "No conoce CISA salvo lo que ustedes le cuenten, anónimo."] },

  { kind: "two", title: "IA tradicional vs. IA generativa",
    leftH: "IA tradicional", left: ["Etiqueta o número: fraude sí/no, un pronóstico.", "Misma familia de tarea, una y otra vez.", "Ej.: visión de línea, scoring."],
    rightH: "IA generativa", right: ["Crea texto, tablas, ideas, estructura de PPT.", "ChatGPT y Claude son de este tipo.", "El primer resultado es un borrador."] },

  { kind: "talk", title: "Manos arriba", prompt: "Mano derecha: en su área ya hay un número o una alarma automática. Mano izquierda: esta semana usaron un chat para redactar.",
    hint: "Pueden levantar las dos. No es concurso: es para ver que conviven." },

  { kind: "talk", title: "Abran ChatGPT y Claude", prompt: "chatgpt.com y claude.ai. Chat nuevo. Yo señalo en el proyector; ustedes marcan la misma pieza.",
    hint: "Solo texto. No suban archivos de la empresa." },

  { kind: "hub", title: "Cómo funciona ChatGPT (piezas de la pantalla)", center: "ChatGPT",
    nodes: [
      { title: "Historial", text: "Izquierda: chats viejos. Hoy: uno nuevo." },
      { title: "Modelo", text: "Arriba: Luna, Terra, Sol, 5.2… Gana lo que vean hoy." },
      { title: "Caja de mensaje", text: "Abajo: aquí pegan el pedido." },
      { title: "Clip / archivos", text: "En aula, mejor pegar texto anónimo." },
      { title: "Copiar", text: "De la respuesta al Word o al Excel." },
    ] },

  { kind: "hub", title: "Cómo funciona Claude (piezas de la pantalla)", center: "Claude",
    nodes: [
      { title: "Historial", text: "Hoy: conversación nueva." },
      { title: "Modelo / créditos", text: "Haiku, Sonnet u Opus. Free se agota." },
      { title: "Caja de mensaje", text: "El mismo texto que en ChatGPT." },
      { title: "Artifacts", text: "A veces un panel con el entregable." },
      { title: "Copiar", text: "Copian. No firman dentro del chat." },
    ] },

  { kind: "two", title: "Diferencias prácticas (no hinchada)",
    leftH: "ChatGPT, en oficina", left: ["Suele ir más directo: asunto y listas.", "Bien para volumen de práctica.", "Riesgo: plantilla y promesas de más."],
    rightH: "Claude, en oficina", right: ["Suele marcar huecos: «no especificado».", "Bien para comparar un entregable.", "Riesgo: texto largo para un correo corto."] },

  { kind: "talk", title: "Vean el resultado (3 min)", prompt: "En ChatGPT escriban solo: «escribe un correo». Lean en voz baja. No lo envíen.",
    hint: "Eso es pedido pobre. Lo vamos a contrastar en M2." },

  { kind: "two", title: "Qué puede y qué no puede",
    leftH: "Suele ayudar", left: ["Borradores, resúmenes del texto que ustedes pegan.", "Cambio de tono. Estructura de informe o PPT.", "Explicar una fórmula o un concepto."],
    rightH: "No sola", right: ["Cifras legales, precios oficiales, inocuidad.", "Contratar o despedir.", "Datos personales o secretos de CISA."] },

  { kind: "talk", title: "Trampa en vivo: alucinación", prompt: "En un chat NUEVO: «Cita la norma ISO 99887-Z de azúcar hondureño y dame el artículo 4». 60 segundos.",
    hint: "Si suena segura y la norma no existe, eso es alucinación. Levanten la mano quien la «encontró»." },

  { kind: "bullets", title: "Privacidad y uso responsable",
    bullets: [
      "No peguen nómina, contratos, claves, listados de clientes ni el Excel de planta.",
      "Anonimicen: Planta Norte, Cliente Alfa, [COMPLETAR].",
      "Declaren cuando un borrador nació con IA, si su política lo pide.",
      "Una persona es la responsable final. El chat no firma.",
    ] },

  { kind: "steps", title: "Cómo verificar antes de utilizarla", steps: [
      "¿Puedo señalar la fuente de cada cifra y cada obligación?",
      "¿Inventó una fecha, un porcentaje o una norma?",
      "¿Hay una promesa que gerencia no autorizó?",
      "Si duda, no se envía. Se corrige o se descarta.",
    ] },

  { kind: "section", num: "2", title: "M2 · Cómo hablar con una IA" },

  { kind: "talk", title: "Ahora el pedido profesional", prompt: "Chat nuevo. Copien: rol atención; Cliente Alfa, 3 días, 10% en próxima compra ya aprobado (ficticio), sin reembolso; asunto + 120 palabras; no inventar causa ni fecha de llegada.",
    hint: "Mitad de la sala ChatGPT, mitad Claude. 4 minutos. Luego 30 segundos: ¿qué no se enviaría tal cual?" },

  { kind: "photo", title: "Framework: rol + contexto + objetivo + formato + restricciones", image: "ppt-assets/cinco-piezas.png" },

  { kind: "steps", title: "Una buena solicitud, pieza por pieza", steps: [
      "Contexto: hechos anónimos (qué pasó, qué sí y qué no pueden ofrecer).",
      "Objetivo: qué deben entregar (un correo, no «ayúdame»).",
      "Audiencia, tono y formato: gerente, ejecutivo, 120 palabras, asunto.",
      "Restricciones y ejemplos: no inventar; «como el correo corto de ayer».",
    ] },

  { kind: "two", title: "Iterar: construir paso a paso",
    leftH: "Primera salida", left: ["Suele ser larga o genérica.", "No es el final. Es el borrador."],
    rightH: "Segunda instrucción", right: ["«Más corto. Sin adjetivos. Marca lo que no puedes saber.»", "Corrigen a mano lo que el chat no debe tocar."] },

  { kind: "bullets", title: "Errores comunes al interactuar",
    bullets: [
      "Pedido de tres palabras y esperar un documento listo para firmar.",
      "Pegar el PDF real «para que entienda el contexto».",
      "Aceptar la primera cifra que inventa.",
      "Un solo chat para correo + PPT + presupuesto juntos.",
    ] },

  { kind: "section", num: "3", title: "M3 · Ingeniería de prompts" },

  { kind: "two", title: "Tipos de prompts (para gerencia)",
    leftH: "Reutilizable / maestro", left: ["Plantilla de 5 piezas. Solo cambian el contexto.", "Guárdenlo en Biblioteca del laboratorio.", "Ej.: queja; minuta; fórmula Excel."],
    rightH: "Análisis vs. creatividad", right: ["Análisis: extrae, compara, lista riesgos. Pidan «no especificado».", "Creatividad: lluvia de ideas. Luego ustedes eligen.", "Prompt Lab: arman el de su cargo, anónimo."] },

  { kind: "talk", title: "Prompt Lab en vivo (6 min)", prompt: "En el laboratorio, menú Prompt Lab. Cinco piezas de SU tarea de Conocernos. Copian y pegan en ChatGPT. Segunda ronda: «quita promesas».",
    hint: "Guarden uno en Biblioteca. Si Claude tiene créditos, el mismo texto." },

  { kind: "section", num: "4", title: "M4 · IA + Microsoft Word" },

  { kind: "talk", title: "Abran Word en blanco", prompt: "El chat no es Word. Ahí solo nace el borrador. El documento vive en Word.",
    hint: "Copilot dentro de Office es opcional. El método del curso es copiar y pegar, para que todos puedan con Free." },

  { kind: "bullets", title: "Qué van a practicar en Word (temario)",
    bullets: [
      "Cartas, memorandos, informes ejecutivos, políticas y procedimientos (casos ficticios).",
      "Minutas, actas y resúmenes ejecutivos. Tono: formal, ejecutivo, comercial o técnico.",
      "Corrección y reestructuración. Extraer de un texto pegado y armar otra estructura.",
      "Cargar archivos solo si Free lo permite y el archivo NO es de la empresa.",
    ] },

  { kind: "steps", title: "Práctica Word: documento → mejora → final", steps: [
      "Pegan en el chat el pedido Alfa (5 piezas).",
      "Copian la respuesta a Word.",
      "Cambio de tono: «más ejecutivo, sin adjetivos».",
      "Rojo en el 10% y en cualquier fecha. Un humano autoriza.",
      "Envían desde Word, nunca desde el chat.",
    ] },

  { kind: "section", num: "5", title: "M5 · IA + Microsoft Excel" },

  { kind: "talk", title: "Abran Excel — archivo de ejemplo", prompt: "A1 cantidad, B1 precio, C1 total. Seis filas inventadas. Nadie abre el libro de planta.",
    hint: "Vamos a pedir fórmula, cazar un error y un mini reporte. Tres celdas a mano, siempre." },

  { kind: "bullets", title: "Qué pide el temario (y cómo lo hacemos)",
    bullets: [
      "Explicar fórmulas en lenguaje sencillo y crearlas desde una necesidad.",
      "Detectar errores y diseñar lógica de cálculo (si A no es número…).",
      "Recomendaciones a partir de datos y un reporte ejecutivo de resultados.",
      "Validar: el chat no sustituye la calculadora. Práctica con archivo de juguete.",
    ] },

  { kind: "talk", title: "Vean el resultado en Excel", prompt: "En el chat: «Fórmula C=A*B. Explica. Avisa si A no es número.» Copian a C2. Arrastran. Tres celdas a mano. ¿Cuadra?",
    hint: "Quien no cuadre, levanta la mano: no se usa esa fórmula." },

  { kind: "section", num: "6", title: "M6 · IA + Microsoft PowerPoint" },

  { kind: "talk", title: "Abran PowerPoint en blanco", prompt: "Objetivo: 8 minutos a un comité. El chat arma el esqueleto; ustedes ponen [CIFRA OFICIAL].",
    hint: "Máximo 3 viñetas por diapositiva. Si inventa un KPI, lo tachan." },

  { kind: "two", title: "Del documento a las diapositivas",
    leftH: "El chat puede", left: ["Agenda, objetivos, conclusiones.", "Storytelling ejecutivo, comercial o técnico.", "Texto recomendado, notas del expositor.", "Ideas de diagramas (ustedes eligen la imagen)."],
    rightH: "Ustedes hacen", right: ["Trasladar a PowerPoint de verdad.", "Poner cifras oficiales.", "Ensayar 60 segundos en voz alta.", "Cazar una cifra inventada en la de al lado."] },

  { kind: "talk", title: "Práctica PPT (5 min)", prompt: "Pidan: 6 diapositivas, hechos / huecos / pedido al comité, [CIFRA OFICIAL] donde iría un número. Peguen títulos en PowerPoint.",
    hint: "Parejas: una estructura, otra el guion. 1 pareja muestra 60 s." },

  { kind: "section", num: "7", title: "M7 · Análisis e investigación" },

  { kind: "talk", title: "En el chat, no en Google a ciegas", prompt: "Pegen este texto (ficticio): «Fila de camiones 2 h. Lote retenido por humedad. Radio extra el jueves: no se sabe quién paga.»",
    hint: "Pidan: extrae decisiones vs pendientes. Si falta dato: «no especificado». Comparen ChatGPT y Claude." },

  { kind: "bullets", title: "Qué cubre este módulo",
    bullets: [
      "Analizar lo pegado en el chat: extraer, resumir, comparar, riesgos.",
      "Conclusiones y recomendaciones, separadas de los hechos.",
      "Búsqueda web solo si su cuenta la tiene; igual hay que verificar fuentes.",
      "Diferenciar: lo encontrado vs. lo que la IA concluyó.",
    ] },

  { kind: "talk", title: "Caza de error (manos)", prompt: "¿Quién convirtió un «se habló» en un acuerdo cerrado? Eso es el error caro.",
    hint: "Claude suele marcar el hueco. ChatGPT suele dejar el acta «bonita»." },

  { kind: "section", num: "8", title: "M8 · Productividad diaria" },

  { kind: "two", title: "Casos de oficina (siempre anónimos)",
    leftH: "Comunicar y reunirse", left: ["Correos profesionales.", "Preparación de reuniones y agendas.", "Minutas y seguimiento de acuerdos."],
    rightH: "Pensar y decidir", right: ["Lluvia de ideas (ustedes eligen).", "Informes de avance.", "Pros, contras y riesgos: la decisión es humana."] },

  { kind: "talk", title: "90 segundos", prompt: "Pidan en el chat una agenda de 30 minutos para «revisar retraso Cliente Alfa» (ficticio). Tres puntos. Sin inventar asistentes.",
    hint: "Levantan la mano si el chat inventó un nombre de persona." },

  { kind: "hub", title: "De qué está hecho un agente (Nova)", image: "avatares/nova.svg", center: "Nova",
    nodes: [
      { title: "Rol", text: "Anfitriona del laboratorio. No es ChatGPT." },
      { title: "Objetivo", text: "Indicar el siguiente paso útil." },
      { title: "Herramientas", text: "Ruta, cuentas, lecciones del portal." },
      { title: "Reglas", text: "No firma. No ve datos internos." },
      { title: "Humano verifica", text: "Ustedes deciden. El tutor no envía el correo." },
    ] },

  { kind: "section", num: "9", title: "M9 · Proyecto final" },

  { kind: "steps", title: "El examen (viernes 2, 14:20–16:25)", steps: [
      "Problema real de su trabajo, anonimizado. Word en proyectos/ su usuario.",
      "Diseñan el prompt. Prueba en ChatGPT y en Claude (el mismo texto).",
      "Comparan, refinan, validación humana. Guardan la ficha.",
      "Tiempo o esfuerzo que puede reducirse: lo estiman USTEDES, no el chat.",
    ] },

  { kind: "photo", title: "A.C.T.I.V.A. · el método de los dos viernes", image: "ppt-assets/activa.png" },

  { kind: "quote", quote: "La IA propone. Ustedes deciden y verifican." },

  { kind: "closing", title: "A trabajar", subtitle: "Bienvenidos al AI Business Lab", brand: "Magnatic · Think Evolution" },
];

// ---------- Utilidades XML ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const EMU = 914400;
const W = Math.round(13.333 * EMU);
const H = Math.round(7.5 * EMU);

function runXml(r) {
  const props = [`sz="${(r.sz || 18) * 100}"`];
  if (r.b) props.push('b="1"');
  if (r.i) props.push('i="1"');
  const color = r.color || WHITE;
  return `<a:r><a:rPr lang="es-ES" ${props.join(" ")}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Segoe UI"/></a:rPr><a:t>${esc(r.text)}</a:t></a:r>`;
}
function paraXml(r) {
  const align = r.align ? ` algn="${r.align}"` : "";
  const bu = r.bullet ? '<a:buFont typeface="Arial"/><a:buChar char="&#8226;"/>'
    : (r.num ? `<a:buFont typeface="+mj-lt"/><a:buAutoNum type="arabicPeriod"/>` : "<a:buNone/>");
  const marL = (r.bullet || r.num) ? ' marL="342900" indent="-342900"' : "";
  const spc = r.spcAfter != null ? `<a:spcAft><a:spcPts val="${r.spcAfter}"/></a:spcAft>` : "";
  return `<a:p><a:pPr${marL}${align}>${spc}${bu}</a:pPr>${runXml(r)}</a:p>`;
}
function sp(id, name, xIn, yIn, wIn, hIn, runs, { anchor = "t", fill = null, geom = "rect", round = false } = {}) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  const body = runs.map(paraXml).join("");
  const fillXml = fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill>` : "";
  const prst = round ? "roundRect" : geom;
  const ln = fill ? '<a:ln><a:noFill/></a:ln>' : "";
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="${prst}"><a:avLst/></a:prstGeom>${fillXml}${ln}</p:spPr><p:txBody><a:bodyPr wrap="square" anchor="${anchor}"><a:normAutofit/></a:bodyPr><a:lstStyle/>${body}</p:txBody></p:sp>`;
}
function picXml(id, rId, xIn, yIn, wIn, hIn) {
  const x = Math.round(xIn * EMU), y = Math.round(yIn * EMU);
  const w = Math.round(wIn * EMU), h = Math.round(hIn * EMU);
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="Picture ${id}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
}

function shapesFor(s) {
  const out = [];
  let id = 2;
  const bar = () => { out.push(sp(id++, "bar", 0, 0, 13.333, 0.22, [{ text: "" }], { fill: TEAL })); };
  const footer = (t) => out.push(sp(id++, "ft", 0.6, 7.0, 12.1, 0.4, [{ text: t || "AI Business Lab · Magnatic", sz: 10, color: MUTED }]));

  if (s.kind === "cover" || s.kind === "closing") {
    out.push(sp(id++, "brandtop", 0, 0.7, 13.333, 0.5, [{ text: s.brand || "Magnatic · Think Evolution", sz: 14, b: 1, color: TEAL, align: "ctr" }]));
    out.push(sp(id++, "title", 0.8, 2.6, 11.7, 1.7, [{ text: s.title, sz: s.kind === "cover" ? 60 : 50, b: 1, color: WHITE, align: "ctr" }]));
    out.push(sp(id++, "sub", 0.8, 4.4, 11.7, 1.2, [{ text: s.subtitle || "", sz: 24, color: TEAL, align: "ctr" }]));
    if (s.foot) out.push(sp(id++, "foot", 0.8, 6.4, 11.7, 0.6, [{ text: s.foot, sz: 14, color: MUTED, align: "ctr" }]));
    // Barras decorativas
    out.push(sp(id++, "d1", 0, 6.9, 13.333, 0.12, [{ text: "" }], { fill: PURPLE }));
    out.push(sp(id++, "d2", 0, 7.02, 13.333, 0.06, [{ text: "" }], { fill: GOLD }));
    return out.join("");
  }

  if (s.kind === "section") {
    out.push(sp(id++, "secbg", 0, 2.2, 13.333, 3.1, [{ text: "" }], { fill: PURPLE }));
    out.push(sp(id++, "num", 0.9, 2.35, 3, 2.8, [{ text: s.num, sz: 130, b: 1, color: GOLD, align: "l" }], { anchor: "ctr" }));
    out.push(sp(id++, "sect", 3.8, 2.35, 8.7, 2.8, [{ text: s.title, sz: 40, b: 1, color: WHITE, align: "l" }], { anchor: "ctr" }));
    footer();
    return out.join("");
  }

  if (s.kind === "quote") {
    out.push(sp(id++, "q", 1.2, 2.6, 10.9, 2.3, [{ text: "\u201C" + s.quote + "\u201D", sz: 40, b: 1, color: TEAL, align: "ctr" }], { anchor: "ctr" }));
    out.push(sp(id++, "d", 5.4, 5.2, 2.5, 0.08, [{ text: "" }], { fill: GOLD }));
    footer();
    return out.join("");
  }

  // Slides con barra superior + título
  bar();
  out.push(sp(id++, "title", 0.7, 0.5, 12, 1.0, [{ text: s.title, sz: 32, b: 1, color: WHITE }]));

  if (s.kind === "photo") {
    out.push(picXml(id++, "rId2", 0.75, 1.55, 11.8, 5.15));
    footer();
    return out.join("");
  }

  if (s.kind === "splitpic") {
    out.push(sp(id++, "pc", 0.55, 1.55, 5.1, 5.15, [], { fill: CARD, round: true }));
    out.push(picXml(id++, "rId2", 0.85, 1.85, 4.5, 4.55));
    out.push(sp(id++, "rb", 5.9, 1.7, 6.8, 5.0, (s.bullets || []).map((t) => ({ text: t, sz: 18, color: WHITE, bullet: true, spcAfter: 500 }))));
    footer();
    return out.join("");
  }

  if (s.kind === "hub") {
    const pos = [
      [0.5, 1.5, 3.6, 1.65],
      [9.2, 1.5, 3.6, 1.65],
      [0.5, 5.15, 3.6, 1.65],
      [9.2, 5.15, 3.6, 1.65],
      [4.9, 5.25, 3.55, 1.5],
    ];
    out.push(sp(id++, "cc", 5.05, 2.05, 3.2, 3.15, [], { fill: CARD, round: true }));
    if (s.image) {
      out.push(picXml(id++, "rId2", 5.35, 2.15, 2.6, 2.35));
      out.push(sp(id++, "cn", 5.15, 4.5, 3.0, 0.55, [{ text: s.center || "", sz: 16, b: 1, color: TEAL, align: "ctr" }]));
    } else {
      out.push(sp(id++, "cn", 5.15, 2.7, 3.0, 1.8, [{ text: s.center || "", sz: 28, b: 1, color: TEAL, align: "ctr" }], { anchor: "ctr" }));
    }
    (s.nodes || []).forEach((n, i) => {
      const p = pos[i];
      if (!p) return;
      out.push(sp(id++, "nb" + i, p[0], p[1], p[2], p[3], [], { fill: CARD, round: true }));
      out.push(sp(id++, "nt" + i, p[0] + 0.18, p[1] + 0.12, p[2] - 0.36, 0.5, [{ text: n.title, sz: 16, b: 1, color: GOLD }]));
      out.push(sp(id++, "nd" + i, p[0] + 0.18, p[1] + 0.62, p[2] - 0.36, 0.9, [{ text: n.text, sz: 13, color: WHITE }]));
    });
    footer();
    return out.join("");
  }

  if (s.kind === "bullets") {
    if (s.lead) out.push(sp(id++, "lead", 0.7, 1.55, 12, 0.6, [{ text: s.lead, sz: 20, i: 1, color: TEAL }]));
    const runs = s.bullets.map((b) => ({ text: b, sz: 20, color: WHITE, bullet: true, spcAfter: 600 }));
    out.push(sp(id++, "body", 0.9, 2.25, 11.5, 4.4, runs));
  } else if (s.kind === "analogy") {
    out.push(sp(id++, "big", 0.9, 1.9, 11.5, 2.0, [{ text: s.big, sz: 34, b: 1, color: GOLD }], { anchor: "ctr" }));
    out.push(sp(id++, "sup", 0.9, 4.1, 11.5, 2.4, [{ text: s.support, sz: 20, color: WHITE }]));
  } else if (s.kind === "steps") {
    const runs = s.steps.map((t) => ({ text: t, sz: 20, color: WHITE, num: true, spcAfter: 700 }));
    out.push(sp(id++, "body", 0.9, 1.9, 11.5, 4.7, runs));
  } else if (s.kind === "two") {
    out.push(sp(id++, "lc", 0.7, 1.8, 5.85, 4.7, [], { fill: CARD, round: true }));
    out.push(sp(id++, "rc", 6.8, 1.8, 5.85, 4.7, [], { fill: CARD, round: true }));
    out.push(sp(id++, "lh", 1.0, 2.05, 5.3, 0.7, [{ text: s.leftH, sz: 22, b: 1, color: TEAL }]));
    out.push(sp(id++, "rh", 7.1, 2.05, 5.3, 0.7, [{ text: s.rightH, sz: 22, b: 1, color: GOLD }]));
    out.push(sp(id++, "lb", 1.0, 2.85, 5.3, 3.4, s.left.map((t) => ({ text: t, sz: 17, color: WHITE, bullet: true, spcAfter: 500 }))));
    out.push(sp(id++, "rb", 7.1, 2.85, 5.3, 3.4, s.right.map((t) => ({ text: t, sz: 17, color: WHITE, bullet: true, spcAfter: 500 }))));
  } else if (s.kind === "talk") {
    out.push(sp(id++, "pr", 0.8, 1.8, 11.7, 2.6, [{ text: s.prompt, sz: 28, b: 1, color: GOLD, align: "ctr" }], { anchor: "ctr" }));
    out.push(sp(id++, "hi", 0.9, 4.6, 11.5, 1.8, [{ text: s.hint || "", sz: 18, color: WHITE, align: "ctr" }]));
  } else if (s.kind === "timeline") {
    const runs = (s.items || []).map((t) => ({ text: t, sz: 16, color: WHITE, bullet: true, spcAfter: 280 }));
    out.push(sp(id++, "body", 0.8, 1.7, 11.7, 5.0, runs));
  }
  footer();
  return out.join("");
}

function slideXml(s) {
  const bg = `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="${DARK}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`;
  const trans = `<p:transition spd="med" advClick="1"><p:fade/></p:transition>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bg}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapesFor(s)}</p:spTree></p:cSld>${trans}</p:sld>`;
}

// ---------- Estructura del paquete ----------
const files = {};
files["[Content_Types].xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="svg" ContentType="image/svg+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slides.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")}</Types>`;
files["_rels/.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
const sldIdList = slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("");
files["ppt/presentation.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${sldIdList}</p:sldIdLst><p:sldSz cx="${W}" cy="${H}" type="screen16x9"/><p:notesSz cx="${H}" cy="${W}"/></p:presentation>`;
const presRels = [
  `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`,
  ...slides.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`),
  `<Relationship Id="rId${slides.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>`,
].join("");
files["ppt/_rels/presentation.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${presRels}</Relationships>`;
files["ppt/theme/theme1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Magnatic"><a:themeElements><a:clrScheme name="Magnatic"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0B1220"/></a:dk2><a:lt2><a:srgbClr val="F1F1F1"/></a:lt2><a:accent1><a:srgbClr val="16C6AD"/></a:accent1><a:accent2><a:srgbClr val="610A8B"/></a:accent2><a:accent3><a:srgbClr val="FFD700"/></a:accent3><a:accent4><a:srgbClr val="79B8FF"/></a:accent4><a:accent5><a:srgbClr val="7EE787"/></a:accent5><a:accent6><a:srgbClr val="F07178"/></a:accent6><a:hlink><a:srgbClr val="16C6AD"/></a:hlink><a:folHlink><a:srgbClr val="610A8B"/></a:folHlink></a:clrScheme><a:fontScheme name="Office"><a:majorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Segoe UI"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Office"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>`;
files["ppt/slideMasters/slideMaster1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="0B1220"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`;
files["ppt/slideMasters/_rels/slideMaster1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`;
files["ppt/slideLayouts/slideLayout1.xml"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`;
files["ppt/slideLayouts/_rels/slideLayout1.xml.rels"] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`;
slides.forEach((s, i) => {
  files[`ppt/slides/slide${i + 1}.xml`] = slideXml(s);
  const ext = s.image ? extname(s.image).replace(".", "") || "png" : "png";
  const imgRel = s.image
    ? `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/img${i + 1}.${ext}"/>`
    : "";
  files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>${imgRel}</Relationships>`;
  if (s.image) files[`ppt/media/img${i + 1}.${ext}`] = readFileSync(s.image);
});

// ---------- Mini ZIP (store) ----------
function makeZip(fileMap) {
  const chunks = [], central = [];
  let offset = 0; const time = 0, date = 0x21;
  for (const [name, content] of Object.entries(fileMap)) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const crc = zcrc(data) >>> 0; const size = data.length;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(size, 18); local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8); cen.writeUInt16LE(0, 10); cen.writeUInt16LE(time, 12); cen.writeUInt16LE(date, 14);
    cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(size, 20); cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt16LE(0, 30); cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34); cen.writeUInt16LE(0, 36); cen.writeUInt32LE(0, 38); cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += local.length + nameBuf.length + data.length;
  }
  const centralStart = offset; let centralSize = 0; for (const c of central) centralSize += c.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  const count = Object.keys(fileMap).length;
  end.writeUInt16LE(count, 8); end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(centralStart, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, ...central, end]);
}

const zip = makeZip(files);
writeFileSync("AI-Business-Lab-Presentacion.pptx", zip);
console.log("PPTX generado: " + zip.length + " bytes, " + slides.length + " diapositivas");
