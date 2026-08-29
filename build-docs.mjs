// Genera varios documentos Word (.docx) del curso, sin dependencias externas.
// Motor Open XML reutilizable + mini-zip "stored".
import { writeFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

const TEAL = "16C6AD";
const PURPLE = "610A8B";

// ---------- Motor de WordprocessingML ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function run(text, { b = 0, i = 0, color = null, sz = null } = {}) {
  const rpr = [];
  if (b) rpr.push("<w:b/>");
  if (i) rpr.push("<w:i/>");
  if (color) rpr.push(`<w:color w:val="${color}"/>`);
  if (sz) rpr.push(`<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`);
  const rprXml = rpr.length ? `<w:rPr>${rpr.join("")}</w:rPr>` : "";
  return `<w:r>${rprXml}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

function para(runsXml, { align = null, after = 120, before = 0 } = {}) {
  const ppr = [];
  const spacing = [];
  if (after != null) spacing.push(`w:after="${after}"`);
  if (before) spacing.push(`w:before="${before}"`);
  if (spacing.length) ppr.push(`<w:spacing ${spacing.join(" ")}/>`);
  if (align) ppr.push(`<w:jc w:val="${align}"/>`);
  const pprXml = ppr.length ? `<w:pPr>${ppr.join("")}</w:pPr>` : "";
  return `<w:p>${pprXml}${runsXml}</w:p>`;
}

function bulletPara(runsXml) {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="60"/></w:pPr>${runsXml}</w:p>`;
}

function richRuns(value) {
  if (Array.isArray(value)) return value.map(([t, b]) => run(t, { b })).join("");
  return run(value, {});
}

function tableXml(t) {
  const border = '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="C9CFDA"/><w:left w:val="single" w:sz="4" w:color="C9CFDA"/><w:bottom w:val="single" w:sz="4" w:color="C9CFDA"/><w:right w:val="single" w:sz="4" w:color="C9CFDA"/><w:insideH w:val="single" w:sz="4" w:color="C9CFDA"/><w:insideV w:val="single" w:sz="4" w:color="C9CFDA"/></w:tblBorders>';
  const cell = (text, header) => {
    const shd = header ? `<w:shd w:val="clear" w:color="auto" w:fill="${PURPLE}"/>` : "";
    const runs = run(text, header ? { b: 1, color: "FFFFFF" } : {});
    return `<w:tc><w:tcPr>${shd}<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${runs}</w:p></w:tc>`;
  };
  const headRow = t.head ? `<w:tr>${t.head.map((h) => cell(h, true)).join("")}</w:tr>` : "";
  const bodyRows = t.rows.map((r) => `<w:tr>${r.map((c) => cell(c, false)).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${border}<w:tblLook w:val="04A0"/></w:tblPr>${headRow}${bodyRows}</w:tbl>`;
}

function blocksToBody(doc) {
  const parts = [];
  for (const blk of doc) {
    if (blk.title != null) parts.push(para(run(blk.title, { b: 1, color: TEAL, sz: 44 }), { align: blk.center ? "center" : null }));
    else if (blk.h2 != null) parts.push(para(run(blk.h2, { b: 1, color: PURPLE, sz: 30 }), { before: 120 }));
    else if (blk.h3 != null) parts.push(para(run(blk.h3, { b: 1, color: TEAL, sz: 24 })));
    else if (blk.big != null) parts.push(para(run(blk.big, { b: 1, color: PURPLE, sz: blk.sz || 60 }), { align: "center", after: 200 }));
    else if (blk.center != null) parts.push(para(richRuns(blk.center), { align: "center", after: blk.after != null ? blk.after : 160 }));
    else if (blk.pi != null) parts.push(para(run(blk.pi, { i: 1, color: "666666" })));
    else if (blk.note != null) parts.push(para(run(blk.note, { color: "8A6D00" })));
    else if (blk.b != null) parts.push(bulletPara(richRuns(blk.b)));
    else if (blk.p != null) parts.push(para(richRuns(blk.p)));
    else if (blk.line != null) parts.push(para(run(blk.label ? blk.label + "  " : "", { b: 1 }) + run("________________________________________________", { color: "999999" })));
    else if (blk.spacer != null) parts.push(para(run("", {}), { after: blk.spacer }));
    else if (blk.table != null) { parts.push(tableXml(blk.table)); parts.push(para(run("", {}), { after: 80 })); }
  }
  const sectPr = `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${parts.join("")}${sectPr}</w:body></w:document>`;
}

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`;

const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;

function makeZip(fileMap) {
  const chunks = [], central = [];
  let offset = 0; const time = 0, date = 0x21;
  for (const [name, content] of Object.entries(fileMap)) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.from(content, "utf8");
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

function writeDocx(filename, doc) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`,
    "word/document.xml": blocksToBody(doc),
    "word/styles.xml": stylesXml,
    "word/numbering.xml": numberingXml,
  };
  const zip = makeZip(files);
  writeFileSync(filename, zip);
  console.log(filename + ": " + zip.length + " bytes");
}

// ==================== CONTENIDO DE LOS 4 DOCUMENTOS ====================

// 1) Manual / Guia rapida del alumno
const manual = [
  { title: "Manual del Alumno — AI Business Lab" },
  { pi: "Guía rápida para usar el laboratorio. MagnaTic · Think Evolution." },
  { h2: "1. Cómo entrar" },
  { b: "Abre el enlace que te comparta el instructor: https://xander0408.github.io/CURSOS/" },
  { b: "Úsalo en una ventana normal del navegador (no en modo incógnito), para que se guarde tu avance." },
  { b: "En el Dashboard, escribe tu nombre y guárdalo." },
  { h2: "2. Antes de empezar, ten abiertas dos pestañas más" },
  { b: "ChatGPT: chat.openai.com (cuenta gratuita)." },
  { b: "Claude: claude.ai (cuenta gratuita)." },
  { p: "El laboratorio NO reemplaza a ChatGPT ni a Claude: es donde aprendes el método y practicas. La IA real la usas en esas pestañas." },
  { h2: "3. Qué hay en el menú" },
  { table: { head: ["Sección", "Para qué sirve"], rows: [
    ["Dashboard", "Tu progreso general y accesos rápidos."],
    ["Módulos", "Las 9 lecciones con sus retos."],
    ["Quiz", "Repaso estilo concurso, contra el reloj."],
    ["Prompt Lab", "Construir prompts con el framework y guardarlos."],
    ["Comparador", "Mismo prompt en ChatGPT vs Claude."],
    ["Biblioteca", "Plantillas de prompts reutilizables."],
    ["Proyecto final", "12 pasos hasta tu ficha."],
    ["Progreso", "Insignias, exportar e importar tu avance."],
  ] }},
  { h2: "4. El método: framework de 5 piezas" },
  { p: "Todo buen pedido a la IA tiene estas cinco piezas:" },
  { b: "ROL — quién debe ser la IA." },
  { b: "CONTEXTO — la situación, sin datos sensibles." },
  { b: "OBJETIVO — qué debe lograr exactamente." },
  { b: "FORMATO — cómo debe verse el resultado." },
  { b: "RESTRICCIONES — qué NO debe hacer." },
  { h2: "5. Guarda tu avance" },
  { b: "Tu progreso vive en el navegador de tu equipo." },
  { b: "Si vas a cambiar de computadora, ve a Progreso → Exportar avance y guarda el archivo." },
  { b: "En el otro equipo, ve a Progreso → Importar avance y selecciónalo." },
  { h2: "6. La regla de oro" },
  { p: [["La IA propone. Tú decides y verificas. ", 1], ["Nunca uses una cifra, cita o dato importante sin comprobarlo con una fuente humana o un documento oficial.", 0]] },
];

// 2) Hoja de reglas del laboratorio
const reglas = [
  { title: "Reglas del Laboratorio" },
  { pi: "Léelas antes de usar ChatGPT o Claude en el curso. MagnaTic." },
  { h2: "Lo que SÍ debes hacer" },
  { b: "Dar contexto suficiente para que la IA entienda tu caso." },
  { b: "Iterar: pedir ajustes en lugar de aceptar el primer borrador." },
  { b: "Verificar cifras, fechas, citas y obligaciones legales con una fuente confiable." },
  { b: "Anonimizar: usar casos equivalentes sin datos reales de personas o clientes." },
  { b: "Revisar el resultado antes de enviarlo o usarlo en el trabajo." },
  { h2: "Lo que NUNCA debes pegar en la IA" },
  { b: "Nombres, cuentas o datos personales identificables de clientes o compañeros." },
  { b: "Contraseñas, tokens o credenciales." },
  { b: "Contratos, nóminas o documentos confidenciales de la empresa." },
  { b: "Cualquier cosa que te molestaría ver fuera de la empresa." },
  { h2: "Recuerda" },
  { p: [["El estilo seguro no garantiza datos correctos. ", 1], ["Una respuesta puede sonar profesional y estar equivocada (alucinación). La persona responsable final eres tú.", 0]] },
  { spacer: 200 },
  { p: [["Regla de oro: ", 1], ["La IA propone. Tú decides y verificas.", 0]] },
];

// 3) Plantilla de ficha de proyecto (para llenar a mano)
const ficha = [
  { title: "Ficha del Proyecto Final" },
  { pi: "Completa esta ficha con tu problema real de trabajo. MagnaTic · AI Business Lab." },
  { spacer: 120 },
  { line: 1, label: "Nombre del participante:" },
  { line: 1, label: "Fecha:" },
  { spacer: 120 },
  { h3: "1. Problema" },
  { p: "¿Qué tarea real de tu trabajo quieres resolver o agilizar?" },
  { line: 1 }, { line: 1 },
  { h3: "2. Cómo lo haces hoy y cuánto tardas" },
  { line: 1 }, { line: 1 },
  { h3: "3. Solución con IA (qué hace la IA y qué haces tú)" },
  { line: 1 }, { line: 1 },
  { h3: "4. Tu prompt (Rol + Contexto + Objetivo + Formato + Restricciones)" },
  { line: 1 }, { line: 1 }, { line: 1 },
  { h3: "5. Resultado en ChatGPT vs Claude (cuál te sirvió más y por qué)" },
  { line: 1 }, { line: 1 },
  { h3: "6. Validación humana (qué comprobaste antes de usarlo)" },
  { line: 1 }, { line: 1 },
  { h3: "7. Tiempo antes / tiempo después / ahorro estimado" },
  { line: 1 },
  { h3: "8. Riesgos y control humano" },
  { line: 1 }, { line: 1 },
];

// 4) Certificado / constancia de participacion
const certificado = [
  { spacer: 400 },
  { center: [["MAGNATIC · THINK EVOLUTION", 1]], after: 120 },
  { center: "AI Business Lab", after: 400 },
  { big: "CONSTANCIA DE PARTICIPACIÓN", sz: 40 },
  { spacer: 200 },
  { center: "Se otorga la presente constancia a", after: 120 },
  { big: "____________________________________", sz: 32 },
  { spacer: 120 },
  { center: "por completar el curso", after: 60 },
  { center: [["Inteligencia Artificial Aplicada al Negocio (ChatGPT y Claude)", 1]], after: 60 },
  { center: "16 horas — 2 viernes de 8 horas", after: 400 },
  { center: "Fecha: ____________________        Instructor: ____________________", after: 600 },
  { center: [["La IA propone. La persona decide y verifica.", 0]], after: 0 },
];

writeDocx("Manual-del-Alumno.docx", manual);
writeDocx("Reglas-del-Laboratorio.docx", reglas);
writeDocx("Ficha-Proyecto-Final.docx", ficha);
writeDocx("Constancia-Participacion.docx", certificado);
console.log("4 documentos generados.");
