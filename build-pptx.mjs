// Genera una presentacion .pptx extensa para alumnos de nivel basico.
// Con narrativa, analogías y diseño (portada, separadores de sección, cierres).
// Sin dependencias externas: empaqueta un ZIP "stored" valido para PowerPoint.
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
  { kind: "cover", title: "AI Business Lab", subtitle: "Inteligencia Artificial Aplicada al Negocio",
    foot: "16 horas · 2 viernes · cuentas gratuitas", brand: "Magnatic · Think Evolution" },

  { kind: "section", num: "1", title: "El curso" },

  { kind: "two", title: "Dos viernes, un método",
    leftH: "Viernes 1", left: ["Login, Conocernos, cuentas Free.", "Historia de la IA y quiz.", "Fundamentos, 5 piezas, Word.", "Caso anónimo. No cierren la ficha."],
    rightH: "Viernes 2", right: ["Excel: validar números a mano.", "PowerPoint: estructura, no cifras inventadas.", "Comparador ChatGPT vs Claude.", "Examen: proyecto (14:20–16:25)."] },

  { kind: "bullets", title: "Reglas de aula (una sola vez)",
    bullets: [
      "Chrome o Edge, no incógnito. Tres pestañas: laboratorio, ChatGPT, Claude.",
      "Cuentas GRATIS. Si Claude se queda sin créditos, el mismo prompt en ChatGPT.",
      "Casos ficticios (Planta Norte, Cliente Alfa). Nada de nómina, contratos ni clientes reales.",
      "La IA propone. Ustedes deciden y verifican.",
    ] },

  { kind: "section", num: "2", title: "Qué es la IA" },

  { kind: "two", title: "Software tradicional vs inteligencia artificial",
    leftH: "Software tradicional", left: ["Reglas que alguien programó.", "Misma entrada, misma salida.", "Ej.: fórmula de Excel, ERP, un formulario.", "Si el caso no estaba previsto, se detiene."],
    rightH: "Inteligencia artificial", right: ["Aprende patrones de ejemplos o de texto.", "La misma pregunta puede salir distinta.", "Ej.: ChatGPT, detector de fraude.", "Puede sonar segura e inventar. Se verifica."] },

  { kind: "steps", title: "Niveles (para no sobreprometer)", steps: [
      "Estrecha (hoy): una familia de tareas. Un chat, un pronóstico. No cubre todo tu cargo.",
      "General (AGI): nivel humano en casi cualquier trabajo intelectual. No es la cuenta Free.",
      "Superinteligencia: hipótesis. No es un producto de este aula.",
    ] },

  { kind: "steps", title: "Cuatro pasos = el loop", steps: [
      "Encarga la tarea (correo, tabla, 6 slides).",
      "Contextualiza: hechos anónimos, tono, formato.",
      "Itera: el primer texto es borrador.",
      "Verifica y aplica (o descarta). Sin este giro, el loop no cierra.",
    ] },

  { kind: "two", title: "Qué sí y qué no",
    leftH: "Suele ayudar", left: ["Borradores de correo e informe.", "Resumir texto que TÚ pegas.", "Cambiar tono y ordenar ideas.", "Proponer estructura de PPT o fórmula."],
    rightH: "No sola", right: ["Cifras legales, precios oficiales.", "Contratar o despedir.", "Datos personales de terceros.", "Secretos o contratos reales."] },

  { kind: "analogy", title: "El riesgo número uno",
    big: "A veces inventa con total seguridad.",
    support: "Alucinación: una ley, una cifra o una cita que suena perfecta y es falsa. Por eso una persona verifica antes de enviar." },

  { kind: "section", num: "3", title: "De dónde viene" },

  { kind: "photo", title: "Línea de tiempo", image: "ppt-assets/timeline.png" },

  { kind: "photo", title: "Machine learning vs deep learning", image: "ppt-assets/ml-dl.png" },

  { kind: "two", title: "Tres capas, en una frase",
    leftH: "ML y deep learning", left: ["ML: aprende de ejemplos (fraude, pronóstico).", "Deep learning: redes profundas (visión, voz).", "No escriben tu correo solas."],
    rightH: "IA generativa", right: ["2017 transformers. 2022 chats masivos.", "ChatGPT y Claude generan texto.", "No firman. No son el ERP."] },

  { kind: "section", num: "4", title: "ChatGPT y Claude" },

  { kind: "talk", title: "Abran las dos pestañas", prompt: "chatgpt.com y claude.ai. Entran. Yo señalo en el proyector; ustedes marcan la misma pieza en su pantalla.",
    hint: "Chat de texto. No suban Excel ni Word de la empresa." },

  { kind: "hub", title: "En ChatGPT, estas piezas (señalen)", center: "ChatGPT",
    nodes: [
      { title: "Historial", text: "Izquierda: chats viejos. Hoy abren uno NUEVO." },
      { title: "Modelo", text: "Arriba: Luna, Terra, Sol, 5.2… Gana lo que vean hoy." },
      { title: "Caja de mensaje", text: "Abajo: aquí pegan el pedido de 5 piezas." },
      { title: "Clip / archivos", text: "Adjuntos. En aula, mejor pegar texto anónimo." },
      { title: "Copiar", text: "En la respuesta: copian y se van a Word o Excel." },
    ] },

  { kind: "hub", title: "En Claude, estas piezas (señalen)", center: "Claude",
    nodes: [
      { title: "Historial", text: "Chats anteriores. Hoy: conversación nueva." },
      { title: "Modelo / créditos", text: "Haiku, Sonnet u Opus. Free se agota (~5 h)." },
      { title: "Caja de mensaje", text: "El MISMO texto que pegaron en ChatGPT." },
      { title: "Artifacts", text: "A veces un panel a la derecha con el entregable." },
      { title: "Copiar", text: "Copian y pegan en Word o Excel. No firman aquí." },
    ] },

  { kind: "two", title: "Versiones (sep 2026): gana su pantalla",
    leftH: "ChatGPT", left: ["GPT-5.2: nombre que aún se oye.", "GPT-5.6 Luna: Free, volumen.", "Terra: equilibrio. Sol: más capaz (Plus)."],
    rightH: "Claude", right: ["Haiku: rápido.", "Sonnet: el de oficina.", "Opus: el más capaz; en Free casi no se elige."] },

  { kind: "section", num: "5", title: "Cómo pedir" },

  { kind: "photo", title: "Las 5 piezas de un pedido", image: "ppt-assets/cinco-piezas.png" },

  { kind: "two", title: "Pobre vs profesional",
    leftH: "Pedido pobre", left: ["«Hazme un correo para el cliente».", "Sale genérico. Sirve de poco."],
    rightH: "5 piezas", right: ["Rol + contexto + objetivo + formato + límites.", "Ej.: Cliente Alfa, 3 días, 10% ya aprobado, sin inventar fecha."] },

  { kind: "photo", title: "A.C.T.I.V.A. (el método del lab)", image: "ppt-assets/activa.png" },

  { kind: "section", num: "6", title: "Agentes del laboratorio" },

  { kind: "hub", title: "De qué está hecho un agente", image: "avatares/nova.svg", center: "Nova",
    nodes: [
      { title: "Rol", text: "Anfitriona del laboratorio. No es ChatGPT." },
      { title: "Objetivo", text: "Indicar el siguiente paso útil." },
      { title: "Herramientas", text: "Ruta, cuentas, lecciones del portal." },
      { title: "Reglas", text: "No firma. No ve datos internos." },
      { title: "Humano verifica", text: "Tú decides. El tutor no envía el correo." },
    ] },

  { kind: "two", title: "Nova y los demás tutores",
    leftH: "Qué son", left: ["Nova, Atlas, Spark, Guardian, Nexus, Commander.", "Orientan el método dentro del portal.", "No sustituyen la pestaña de ChatGPT o Claude."],
    rightH: "Qué no son", right: ["No son empleados en un servidor.", "No conocen CISA ni tu Excel real.", "Un agente = encargo con límites. Igual que tu prompt."] },

  { kind: "section", num: "7", title: "Word, Excel y PowerPoint" },

  { kind: "talk", title: "Ahora: abran Word", prompt: "Documento en blanco. El chat NO es Word: ahí solo nace el borrador.",
    hint: "Si tienen Copilot dentro de Word, igual: el original del curso es copiar y pegar, para que todos puedan con cuenta Free." },

  { kind: "steps", title: "Cómo integrar IA + Word", steps: [
      "En ChatGPT (y luego Claude) pegan el pedido de 5 piezas del correo Alfa.",
      "Copian la respuesta (botón copiar o Ctrl+C).",
      "Pegan en Word. Ahí vive el documento.",
      "Marcan en rojo lo que un humano debe autorizar (el 10%, fechas).",
      "Envían desde Word, nunca desde el chat.",
    ] },

  { kind: "talk", title: "Ahora: abran Excel", prompt: "Hoja nueva. Escriban A1=cantidad, B1=precio, C1=total. Seis filas inventadas. Nadie abre el libro de la planta.",
    hint: "Si el chat les da una fórmula, la pegan en C2. Luego comprueban tres celdas a mano." },

  { kind: "steps", title: "Cómo integrar IA + Excel", steps: [
      "Piden en el chat: fórmula C=A*B y un chequeo si A no es número.",
      "Copian la fórmula, no un archivo.",
      "La pegan en Excel. Arrastran si hace falta.",
      "Tres celdas a mano: calculadora o papel. Si no cuadra, no se usa.",
      "El chat no «arregla» el libro real de la empresa.",
    ] },

  { kind: "talk", title: "PowerPoint (misma lógica)", prompt: "Abran PowerPoint en blanco. El chat arma el esqueleto; ustedes ponen [CIFRA OFICIAL].",
    hint: "6 slides, máximo 3 viñetas. Si inventa un KPI, lo tachan." },

  { kind: "two", title: "Ejemplo de pedido (los tres)",
    leftH: "Qué pegan en el chat", left: ["Word: correo Alfa, 120 palabras, sin inventar fecha.", "Excel: A cantidad, B precio, C=A*B, 6 filas ficticias.", "PPT: 6 slides, hechos / huecos / pedido al comité."],
    rightH: "Dónde termina", right: ["El original: Word, Excel o PowerPoint.", "El chat es el taller de borrador.", "Ustedes firman lo que sale del Office."] },

  { kind: "section", num: "8", title: "Comparar y el examen" },

  { kind: "photo", title: "Mismo prompt, distinta utilidad", image: "ppt-assets/comparar.png" },

  { kind: "two", title: "Cómo elegir (este caso, no el mundial)",
    leftH: "ChatGPT, en oficina", left: ["Asunto y listas listos.", "Riesgo: plantilla y promesas de más."],
    rightH: "Claude, en oficina", right: ["Preguntas y «no especificado».", "Riesgo: texto largo para un correo corto."] },

  { kind: "steps", title: "Proyecto final (viernes 2, 14:20)", steps: [
      "Abres TU Word de proyectos/ (caso de tu cargo).",
      "12 pasos en el portal. El mismo prompt en ChatGPT y en Claude.",
      "Verificas fuera del chat. Guardas la ficha.",
    ] },

  { kind: "quote", quote: "La IA propone. Tú decides y verificas." },

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

  // Slides con barra superior + titulo
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
