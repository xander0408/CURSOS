// Guion corto de aula (reloj + usted / ellos). No sustituye el temario de 94 slides.
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
  { kind: "cover", title: "Cómo llevar la clase", subtitle: "AI Business Lab · Central de Ingenios",
    foot: "11 y 25 de septiembre de 2026 · Proyecta ESTO. El temario de 94 slides es solo apoyo.", brand: "Magnatic · Think Evolution" },

  { kind: "steps", title: "La dinámica (no recorra 94 diapositivas)", steps: [
      "Usted proyecta esta PPT corta. El archivo de 94 slides es consulta si alguien pregunta un punto del temario.",
      "Tres pestañas todo el día: laboratorio (CURSOS/), ChatGPT, Claude. Si Claude se agota, el mismo texto en ChatGPT.",
      "En cada bloque: 2 minutos de idea, ellos hacen la tarea, usted recorre el aula.",
      "El laboratorio es el mapa. El chat es el taller. Word, Excel o PowerPoint es el original.",
    ] },

  { kind: "two", title: "Dos viernes · reloj",
    leftH: "Viernes 11 — M1 a M4", left: ["08:00 Entrar y Conocernos.", "08:25 Cuentas y primer chat.", "08:50 Historia en el lab y quiz.", "10:20 Fundamentos (trampa ISO).", "10:35 Pedido pobre vs bueno.", "13:00 Prompt Lab.", "15:00 Word. 16:25 cierre."],
    rightH: "Viernes 25 — M5 a M9", right: ["08:00 Repaso corto.", "08:20 Excel: validar a mano.", "10:10 PowerPoint.", "11:00 Comparador.", "13:00 Análisis y agenda.", "14:20 EXAMEN: proyecto en el lab.", "16:25 cierre."] },

  { kind: "bullets", title: "Reglas (dígala una vez, 08:05)",
    bullets: [
      "Chrome o Edge, no incógnito. Usuario individual. URL con barra final.",
      "Casos: Planta Central, Lote Norte, Cliente Alfa. Nada de zafra, nómina, contratos ni clientes reales.",
      "La IA propone. Ustedes deciden y verifican. Nadie envía desde el chat.",
    ] },

  { kind: "section", num: "1", title: "Viernes 11" },

  { kind: "two", title: "08:00–08:25 · Arranque",
    leftH: "Usted", left: ["Dicta la URL. Entrega claves en privado.", "Proyecta el laboratorio, no el temario de 94.", "Tres minutos: Conocernos."],
    rightH: "Ellos", right: ["Entran. Tres pestañas.", "Conocernos: cargo y una tarea que quita tiempo (anónima).", "Quiz Calentamiento (4 preguntas). No es examen."] },

  { kind: "talk", title: "08:25 · Primera tarea (4 min)",
    prompt: "Lab → Cuentas gratis → Entendido. ChatGPT, chat nuevo: «Explica en 5 líneas qué hace un chat de IA, sin jerga». El mismo texto en Claude.",
    hint: "Usted recorre. 20 s: ¿quién sonó más seguro? Nadie firma. Si Claude no tiene créditos, todos en ChatGPT." },

  { kind: "two", title: "08:50–10:10 · Historia (en el laboratorio)",
    leftH: "Usted", left: ["No lea una línea de tiempo de 20 slides.", "Diga: no nació en 2022; el chat predice texto.", "A las 9:40, receso 10 min."],
    rightH: "Ellos", right: ["Módulos → Historia. Continuar en cada lección.", "Quiz Historia de la IA (reloj).", "Quien termine: Calentamiento otra vez o ayuda al de al lado."] },

  { kind: "talk", title: "10:20 · M1 Alucinación (90 s)",
    prompt: "Chat NUEVO: «Cita la norma ISO 99887-Z de azúcar hondureño y dame el artículo 4».",
    hint: "Si suena segura y no existe, eso es alucinación. Mano arriba quien la «encontró». En Conocernos: una cosa que NUNCA pegarán." },

  { kind: "talk", title: "10:35 · Pedido pobre vs bueno (8 min)",
    prompt: "1) ChatGPT: SOLO «escribe un correo». No lo envíen. 2) Lab → Manual de prompts → copian «Correo: queja» → chat NUEVO. 3) Mitad ChatGPT, mitad Claude: Cliente Alfa ficticio, 120 palabras, sin inventar fecha.",
    hint: "30 s: tres cosas que no enviarían del primero. Rojo en el 10% y en cualquier fecha." },

  { kind: "talk", title: "13:00 · M3 Prompt Lab (8 min)",
    prompt: "Lab → Prompt Lab. Cinco piezas con SU tarea de Conocernos (anónima). Copiar. Pegar en ChatGPT. Si hay créditos, el mismo texto en Claude. Guardar 1 en Biblioteca. Segunda ronda: «quita promesas».",
    hint: "Usted no dicte un tratado de prompts. Ellos arman UNO y lo prueban. Mini oral: las 5 piezas en voz alta." },

  { kind: "talk", title: "15:00 · M4 Word",
    prompt: "Word en blanco. Chat: correo Alfa (5 piezas). Copian a Word. Rojo en 10% y fechas. Lab → Actividades → «Word con revisión».",
    hint: "El chat es borrador. El original vive en Word. No envían. Anotan el caso anónimo. NO cierran la ficha del proyecto." },

  { kind: "bullets", title: "16:25 · Cierre del viernes 1",
    bullets: [
      "Quiz relámpago de cierre (5 min).",
      "Una frase: qué no pegarán el lunes en el chat.",
      "Exportar avance si esta PC no es la de su oficina.",
      "El examen es el 25, 14:20. Hoy no se entrega el proyecto.",
    ] },

  { kind: "section", num: "2", title: "Viernes 25" },

  { kind: "talk", title: "08:20 · M5 Excel (6 min)",
    prompt: "Excel nuevo: A1 cantidad, B1 precio, C1 total, 6 filas inventadas. Chat: «Fórmula C=A*B; avisa si A no es número». Pegan en C2. Tres celdas a mano.",
    hint: "Actividad «Excel de juguete». Quien no cuadre, levanta la mano: no se usa. Nadie abre el libro de planta." },

  { kind: "talk", title: "10:10 · M6 PowerPoint (6 min)",
    prompt: "PowerPoint en blanco. Chat: «6 diapositivas, máx. 3 viñetas; [CIFRA OFICIAL] donde iría un número». Copian títulos. Tachan KPI inventado.",
    hint: "Actividad «Seis slides». Una pareja muestra 60 s. El chat no es el archivo del comité." },

  { kind: "talk", title: "11:00 · Comparador (5 min)",
    prompt: "Lab → Comparador. Mismo texto en ambos: fila de camiones 2 h, lote retenido, radio extra el jueves (no se sabe quién paga). Decisiones vs pendientes. Si falta dato: no especificado.",
    hint: "Votación: ChatGPT, Claude o mezcla. ¿Quién convirtió un «se habló» en un acuerdo cerrado?" },

  { kind: "talk", title: "13:00 · M8 Agenda (90 s)",
    prompt: "Chat: «Agenda de 30 minutos para revisar retraso Cliente Alfa (ficticio). Tres puntos. Sin inventar nombres de personas».",
    hint: "Mano arriba si inventó un nombre. A las 14:20 cierra teoría y entra el examen." },

  { kind: "steps", title: "14:20–16:25 · EXAMEN (M9)", steps: [
      "Lab → Proyecto final (12 pasos). Caso de SU cargo, anónimo.",
      "El mismo prompt en ChatGPT y en Claude. Comparan. Refinan. Verifican fuera del chat.",
      "Guardan la ficha. El ahorro lo estiman ellos. El chat no firma.",
      "16:25: quiz de cierre, 3 exposiciones de 1 min, insignias.",
    ] },

  { kind: "quote", quote: "La IA propone. Ustedes deciden y verifican." },

  { kind: "closing", title: "A trabajar", subtitle: "Tres pestañas. Una tarea. Usted recorre el aula.", brand: "Magnatic · Think Evolution" },
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
writeFileSync("AI-Business-Lab-Como-llevar-la-clase.pptx", zip);
console.log("Guion de aula: " + zip.length + " bytes, " + slides.length + " diapositivas");
