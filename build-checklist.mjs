// Genera "Requerimientos-Previos-Instructor.docx": lo que el cliente debe
// confirmar/enviar al instructor antes del curso. Sin dependencias externas.
import { writeFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

const TEAL = "16C6AD";
const PURPLE = "610A8B";

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
function checkPara(runsXml) {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="80"/></w:pPr>${run("\u2610  ", { b: 1, color: PURPLE })}${runsXml}</w:p>`;
}
function richRuns(v) { return Array.isArray(v) ? v.map(([t, b]) => run(t, { b })).join("") : run(v, {}); }
function tableXml(t) {
  const border = '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="C9CFDA"/><w:left w:val="single" w:sz="4" w:color="C9CFDA"/><w:bottom w:val="single" w:sz="4" w:color="C9CFDA"/><w:right w:val="single" w:sz="4" w:color="C9CFDA"/><w:insideH w:val="single" w:sz="4" w:color="C9CFDA"/><w:insideV w:val="single" w:sz="4" w:color="C9CFDA"/></w:tblBorders>';
  const cell = (text, header) => {
    const shd = header ? `<w:shd w:val="clear" w:color="auto" w:fill="${PURPLE}"/>` : "";
    return `<w:tc><w:tcPr>${shd}<w:tcMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(text, header ? { b: 1, color: "FFFFFF" } : {})}</w:p></w:tc>`;
  };
  const headRow = t.head ? `<w:tr>${t.head.map((h) => cell(h, true)).join("")}</w:tr>` : "";
  const bodyRows = t.rows.map((r) => `<w:tr>${r.map((c) => cell(c, false)).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${border}<w:tblLook w:val="04A0"/></w:tblPr>${headRow}${bodyRows}</w:tbl>`;
}
function blocksToBody(doc) {
  const parts = [];
  for (const b of doc) {
    if (b.title != null) parts.push(para(run(b.title, { b: 1, color: TEAL, sz: 40 })));
    else if (b.h2 != null) parts.push(para(run(b.h2, { b: 1, color: PURPLE, sz: 28 }), { before: 120 }));
    else if (b.pi != null) parts.push(para(run(b.pi, { i: 1, color: "666666" })));
    else if (b.note != null) parts.push(para(run(b.note, { color: "8A6D00" })));
    else if (b.check != null) parts.push(checkPara(richRuns(b.check)));
    else if (b.p != null) parts.push(para(richRuns(b.p)));
    else if (b.line != null) parts.push(para(run((b.label ? b.label + "  " : ""), { b: 1 }) + run("__________________________________________", { color: "999999" })));
    else if (b.spacer != null) parts.push(para(run("", {}), { after: b.spacer }));
    else if (b.table != null) { parts.push(tableXml(b.table)); parts.push(para(run("", {}), { after: 80 })); }
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
  writeFileSync(filename, makeZip(files));
  console.log(filename + " OK");
}

const doc = [
  { title: "Requerimientos Previos — Confirmación del Cliente" },
  { pi: "Curso de IA (ChatGPT y Claude), 16 horas. Por favor completa y devuelve este documento al instructor al menos 5 días antes." },
  { p: [["Objetivo: ", 1], ["confirmar la logística y las condiciones de la sala para que la clase se desarrolle sin contratiempos. Los puntos marcados como CRÍTICO deben confirmarse por escrito.", 0]] },

  { h2: "Datos de contacto" },
  { line: 1, label: "Empresa:" },
  { line: 1, label: "Contacto en sitio (nombre):" },
  { line: 1, label: "Teléfono / WhatsApp del contacto:" },
  { line: 1, label: "Correo del contacto:" },

  { h2: "1. Fechas y horario" },
  { line: 1, label: "Fecha del Día 1:" },
  { line: 1, label: "Fecha del Día 2:" },
  { line: 1, label: "Horario (inicio y fin):" },
  { line: 1, label: "Hora de acceso para montar equipo:" },

  { h2: "2. Lugar" },
  { line: 1, label: "Dirección exacta:" },
  { line: 1, label: "Sala / piso / referencia:" },
  { check: "¿Requiere gafete, inducción de seguridad o registro de acceso a planta? (indicar cuál)" },
  { line: 1, label: "Detalle de acceso:" },

  { h2: "3. Sala y equipo" },
  { check: [["Proyector o pantalla/TV disponible ", 1], ["(indicar tipo de conexión: HDMI / USB-C).", 0]] },
  { line: 1, label: "Tipo de conexión:" },
  { check: "Suficientes tomas de corriente para 10 laptops + la del instructor." },
  { check: "Pizarra o rotafolio disponible (opcional)." },
  { check: "Sonido/altavoces si se proyecta algún video (opcional)." },

  { h2: "4. Internet — CRÍTICO" },
  { check: [["Wifi con capacidad para 11 dispositivos ", 1], ["(10 participantes + instructor).", 0]] },
  { line: 1, label: "Nombre de la red (SSID):" },
  { line: 1, label: "Contraseña del wifi:" },
  { check: [["IT confirma que la red NO bloquea ", 1], ["chat.openai.com ni claude.ai (probar antes del curso).", 0]] },
  { note: "Si la red corporativa bloquea esos sitios, avísanos con anticipación: el curso los usa de forma central." },

  { h2: "5. Participantes" },
  { check: "Lista final de asistentes confirmada (10 personas)." },
  { check: "Cada participante creó sus cuentas gratuitas de ChatGPT y Claude." },
  { check: "Cada participante traerá laptop con cargador y Office (Word, Excel, PowerPoint)." },
  { check: "Se avisó de cualquier restricción de IT en las laptops (permisos, antivirus, bloqueos)." },
  { line: 1, label: "Número final de participantes:" },

  { h2: "6. Contexto para personalizar (opcional pero recomendado)" },
  { check: "Breve descripción de la empresa y sus áreas." },
  { check: "Ejemplos de tareas reales (anónimas) por área que quieran resolver con IA." },

  { h2: "7. Administrativo" },
  { check: "Orden de compra / contratación confirmada." },
  { check: "¿Requieren factura? Datos fiscales entregados." },
  { check: "¿Requieren constancias de participación? Confirmar nombres, logo y firmante." },
  { check: "¿Se requiere firmar acuerdo de confidencialidad (NDA)?" },

  { h2: "Los 2 puntos que más importan" },
  { p: [["1) Wifi funcional para 11 dispositivos con su contraseña.  2) Que la red no bloquee ChatGPT ni Claude. ", 1], ["Si ambos están confirmados por escrito, el resto es manejable.", 0]] },

  { spacer: 200 },
  { line: 1, label: "Confirmado por:" },
  { line: 1, label: "Fecha:" },
];

writeDocx("Requerimientos-Previos-Instructor.docx", doc);
console.log("Documento generado.");
