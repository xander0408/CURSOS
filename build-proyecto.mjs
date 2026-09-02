// Genera "Prepara-tu-Proyecto.docx": hoja para enviar al cliente ANTES del curso.
// Le da a cada gerente su caso (tema, problema, entregable) SIN el prompt resuelto,
// para que llegue pensando pero construya la solucion en clase.
// Une students.json (quien) + tasks.json (su caso por taskId).
import { writeFileSync, readFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

const TEAL = "16C6AD";
const PURPLE = "610A8B";

const students = JSON.parse(readFileSync("content/students.json", "utf8"));
const tasks = JSON.parse(readFileSync("content/tasks.json", "utf8"));
const taskById = Object.fromEntries(tasks.items.map((t) => [t.id, t]));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
  const sp = [];
  if (after != null) sp.push(`w:after="${after}"`);
  if (before) sp.push(`w:before="${before}"`);
  const ppr = [];
  if (sp.length) ppr.push(`<w:spacing ${sp.join(" ")}/>`);
  if (align) ppr.push(`<w:jc w:val="${align}"/>`);
  const pprXml = ppr.length ? `<w:pPr>${ppr.join("")}</w:pPr>` : "";
  return `<w:p>${pprXml}${runsXml}</w:p>`;
}
function bullet(runsXml) {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="60"/></w:pPr>${runsXml}</w:p>`;
}
function tableXml(t) {
  const border = '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="C9CFDA"/><w:left w:val="single" w:sz="4" w:color="C9CFDA"/><w:bottom w:val="single" w:sz="4" w:color="C9CFDA"/><w:right w:val="single" w:sz="4" w:color="C9CFDA"/><w:insideH w:val="single" w:sz="4" w:color="C9CFDA"/><w:insideV w:val="single" w:sz="4" w:color="C9CFDA"/></w:tblBorders>';
  const cell = (text, header) => {
    const shd = header ? `<w:shd w:val="clear" w:color="auto" w:fill="${PURPLE}"/>` : "";
    return `<w:tc><w:tcPr>${shd}<w:tcMar><w:top w:w="70" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(text, header ? { b: 1, color: "FFFFFF" } : {})}</w:p></w:tc>`;
  };
  const headRow = t.head ? `<w:tr>${t.head.map((h) => cell(h, true)).join("")}</w:tr>` : "";
  const bodyRows = t.rows.map((r) => `<w:tr>${r.map((c) => cell(c, false)).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${border}<w:tblLook w:val="04A0"/></w:tblPr>${headRow}${bodyRows}</w:tbl>`;
}
function card(rows) {
  const border = '<w:tblBorders><w:top w:val="single" w:sz="10" w:color="16C6AD"/><w:left w:val="single" w:sz="10" w:color="16C6AD"/><w:bottom w:val="single" w:sz="10" w:color="16C6AD"/><w:right w:val="single" w:sz="10" w:color="16C6AD"/></w:tblBorders>';
  const inner = rows.map((r) => para(r, { after: 80 })).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${border}<w:tblLook w:val="04A0"/></w:tblPr><w:tr><w:tc><w:tcPr><w:tcMar><w:top w:w="160" w:type="dxa"/><w:left w:w="200" w:type="dxa"/><w:bottom w:w="160" w:type="dxa"/><w:right w:w="200" w:type="dxa"/></w:tcMar></w:tcPr>${inner}</w:tc></w:tr></w:tbl>`;
}
function pageBreak() { return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`; }
function body(parts) {
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
    const dataB = Buffer.from(content, "utf8");
    const crc = zcrc(dataB) >>> 0; const size = dataB.length;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); local.writeUInt16LE(time, 10); local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14); local.writeUInt32LE(size, 18); local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26); local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, dataB);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0, 8); cen.writeUInt16LE(0, 10); cen.writeUInt16LE(time, 12); cen.writeUInt16LE(date, 14);
    cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(size, 20); cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt16LE(0, 30); cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34); cen.writeUInt16LE(0, 36); cen.writeUInt32LE(0, 38); cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);
    offset += local.length + nameBuf.length + dataB.length;
  }
  const centralStart = offset; let centralSize = 0; for (const c of central) centralSize += c.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  const count = Object.keys(fileMap).length;
  end.writeUInt16LE(count, 8); end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(centralStart, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, ...central, end]);
}
function writeDocx(filename, parts) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`,
    "word/document.xml": body(parts),
    "word/styles.xml": stylesXml,
    "word/numbering.xml": numberingXml,
  };
  writeFileSync(filename, makeZip(files));
  console.log(filename + " OK");
}

// ---- Documento general (para enviar al grupo) ----
const gen = [];
gen.push(para(run("Prepara tu Proyecto Final", { b: 1, color: TEAL, sz: 40 })));
gen.push(para(run("AI Business Lab · MagnaTic. Léelo antes del curso: NO hay que resolverlo, solo llegar pensando.", { i: 1, color: "666666" })));
gen.push(para(run("¿Qué es?", { b: 1, color: PURPLE, sz: 26 }), { before: 120 }));
gen.push(para(run("El último ejercicio del curso (Viernes 2) es resolver un caso real de tu área con IA, de punta a punta, y medir el tiempo que ahorras. Cada participante tiene un caso asignado según su cargo, pero puedes proponer otro problema real que te quite tiempo.")));
gen.push(para(run("Qué traer pensado", { b: 1, color: PURPLE, sz: 26 }), { before: 120 }));
gen.push(bullet(run("Una tarea repetitiva de tu trabajo que te quite tiempo.")));
gen.push(bullet(run("Qué resultado te gustaría obtener (un correo, un resumen, una tabla).")));
gen.push(bullet(run("Recuerda: en clase usaremos datos de ejemplo, nunca información confidencial real.")));
gen.push(para(run("Casos asignados por área", { b: 1, color: PURPLE, sz: 26 }), { before: 120 }));
gen.push(tableXml({
  head: ["Participante", "Cargo", "Tu caso", "Entregable"],
  rows: students.students.map((s) => {
    const t = taskById[s.taskId] || {};
    return [s.name, s.role, t.title || "—", t.deliverable || "—"];
  }),
}));
gen.push(para(run("En el curso construirás el pedido a la IA paso a paso; no necesitas prepararlo por adelantado.", { i: 1, color: "666666" }), { before: 120 }));
writeDocx("Prepara-tu-Proyecto.docx", gen);

// ---- Fichas individuales (una por gerente, para entrega personal) ----
const cards = [];
cards.push(para(run("Fichas: Prepara tu proyecto (individuales)", { b: 1, color: TEAL, sz: 34 })));
cards.push(para(run("Entrega a cada participante SOLO su ficha. No incluye la solución; es para que llegue pensando.", { i: 1, color: "666666" })));
students.students.forEach((s, idx) => {
  const t = taskById[s.taskId] || {};
  cards.push(para(run("", {}), { after: 80 }));
  cards.push(card([
    run("Prepara tu Proyecto Final — AI Business Lab", { b: 1, color: PURPLE, sz: 20 }),
    run(s.name, { b: 1, sz: 24 }),
    run(s.role, { color: "666666" }),
    run("Tu caso: ", { b: 1 }) + run(t.title || "—", { b: 1, color: PURPLE }),
    run("El reto de tu trabajo: ", { b: 1 }) + run(t.problem || "—", {}),
    run("Qué entregarás: ", { b: 1 }) + run(t.deliverable || "—", {}),
    run("Cuándo: ", { b: 1 }) + run(t.when || "Viernes 2 — proyecto final", {}),
    run("Antes del curso: solo ven pensando en este tipo de tarea. Lo resolveremos juntos, con datos de ejemplo.", { i: 1, color: "666666", sz: 16 }),
  ]));
  if (idx < students.students.length - 1) cards.push(pageBreak());
});
writeDocx("Prepara-tu-Proyecto-Individual.docx", cards);

console.log("2 documentos generados (" + students.students.length + " participantes).");
