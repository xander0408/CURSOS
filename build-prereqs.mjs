// Genera documentos Word para enviar al cliente ANTES del curso, sin dependencias.
//  - Prerequisitos-del-Curso.docx  (checklist para enviar a todos)
//  - Correo-de-Bienvenida.docx      (texto para acompanar el envio)
//  - Guia-Crear-Cuentas.docx        (paso a paso ChatGPT y Claude)
import { writeFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

const TEAL = "16C6AD";
const PURPLE = "610A8B";

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
function bulletPara(runsXml, checkbox) {
  const lead = checkbox ? run("\u2610  ", { b: 1, color: PURPLE }) : "";
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="80"/></w:pPr>${lead}${runsXml}</w:p>`;
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
    if (blk.title != null) parts.push(para(run(blk.title, { b: 1, color: TEAL, sz: 40 })));
    else if (blk.h2 != null) parts.push(para(run(blk.h2, { b: 1, color: PURPLE, sz: 28 }), { before: 120 }));
    else if (blk.h3 != null) parts.push(para(run(blk.h3, { b: 1, color: TEAL, sz: 24 })));
    else if (blk.pi != null) parts.push(para(run(blk.pi, { i: 1, color: "666666" })));
    else if (blk.note != null) parts.push(para(run(blk.note, { color: "8A6D00" })));
    else if (blk.check != null) parts.push(bulletPara(richRuns(blk.check), true));
    else if (blk.b != null) parts.push(bulletPara(richRuns(blk.b), false));
    else if (blk.p != null) parts.push(para(richRuns(blk.p)));
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
  writeFileSync(filename, makeZip(files));
  console.log(filename + " OK");
}

// ==================== CONTENIDO ====================
const LINK = "https://xander0408.github.io/CURSOS/";

const prereqs = [
  { title: "Prerequisitos — Curso de IA Aplicada al Negocio" },
  { pi: "ChatGPT y Claude · 16 horas (2 viernes) · Presencial · MagnaTic para Central de Ingenios." },
  { p: [["Para aprovechar el curso al máximo, cada participante debe tener listo lo siguiente ANTES del primer día. Es sencillo y no requiere conocimientos técnicos.", 0]] },

  { h2: "1. Cuentas gratuitas (obligatorio)" },
  { p: "Crea estas dos cuentas gratuitas. En el documento adjunto \"Guía para crear cuentas\" están los pasos con detalle." },
  { check: [["Cuenta de ChatGPT — ", 1], ["chat.openai.com (gratuita)", 0]] },
  { check: [["Cuenta de Claude — ", 1], ["claude.ai (gratuita)", 0]] },
  { check: "Deja anotado el correo y la contraseña de cada cuenta, en un lugar seguro." },
  { note: "Sugerencia: usa tu correo corporativo o uno personal. No necesitas pagar ni poner tarjeta." },

  { h2: "2. Equipo y conexión" },
  { check: "Computadora portátil (Windows o Mac). La tablet solo sirve para leer, no para el proyecto." },
  { check: [["Navegador actualizado: ", 1], ["Google Chrome o Microsoft Edge (recomendados).", 0]] },
  { check: "Cargador de la laptop (trabajaremos 8 horas)." },
  { check: "Acceso a internet estable (habrá wifi en el salón; ten un plan de datos por si acaso)." },

  { h2: "3. Programas" },
  { check: "Microsoft Office instalado: Word, Excel y PowerPoint (o acceso a Google Docs, Sheets y Slides)." },

  { h2: "4. Tu acceso al laboratorio" },
  { p: [["Enlace del laboratorio: ", 1], [LINK, 0]] },
  { check: "Cada participante recibirá su usuario y contraseña personal por separado (correo aparte del instructor)." },
  { check: "Prueba entrar una vez antes del curso para confirmar que abre y que tu clave funciona." },
  { note: "Tus credenciales son personales. Guárdalas; con ellas se guarda tu avance del curso." },

  { h2: "5. Lo más importante que debes traer" },
  { p: [["Un problema o tarea real de tu trabajo ", 1], ["que te quite tiempo y que quieras resolver o agilizar con IA. Será la base de tu proyecto final.", 0]] },
  { p: "Ejemplos por área:" },
  { table: { head: ["Área", "Ejemplo de tarea para el proyecto"], rows: [
    ["Dirección / Regional", "Resumir informes largos para decidir más rápido."],
    ["Recursos Humanos", "Redactar comunicados o descripciones de puesto."],
    ["Ventas", "Preparar propuestas y correos a clientes."],
    ["Compras / Logística", "Comparar cotizaciones y detectar riesgos."],
    ["Producción / Calidad", "Ordenar reportes y hallazgos en un resumen claro."],
    ["Auditoría", "Sintetizar hallazgos y redactar observaciones."],
    ["Sistemas / Digital", "Explicar temas técnicos en lenguaje de negocio."],
  ] }},

  { h2: "6. Regla importante desde el día 1" },
  { p: [["Por seguridad, NUNCA pegaremos en la IA datos confidenciales reales ", 1], ["(nombres de clientes, cifras internas, contraseñas, contratos). Trabajaremos siempre con casos anonimizados. La IA propone; la persona decide y verifica.", 0]] },

  { h2: "Checklist rápido (marca antes del curso)" },
  { check: "Cuenta de ChatGPT creada y probada." },
  { check: "Cuenta de Claude creada y probada." },
  { check: "Laptop con cargador, Chrome/Edge y Office." },
  { check: "Entré una vez al laboratorio con mi usuario y contraseña." },
  { check: "Tengo en mente un problema real de mi trabajo." },
];

const correo = [
  { title: "Correo de Bienvenida (para enviar al grupo)" },
  { pi: "Copia y pega este texto en tu correo. Ajusta fecha, hora y lugar." },
  { spacer: 120 },
  { p: [["Asunto: ", 1], ["Prepárate para tu curso de IA (ChatGPT y Claude) — pasos previos", 0]] },
  { spacer: 120 },
  { p: "Estimado equipo de Central de Ingenios:" },
  { p: "Nos alegra acompañarlos en el curso de Inteligencia Artificial Aplicada al Negocio (ChatGPT y Claude), de 16 horas, que se realizará los días [FECHAS] en [LUGAR], en horario de [HORA]." },
  { p: [["Para aprovecharlo al máximo, por favor completen estos pasos ANTES del primer día ", 1], ["(toma unos 15 minutos):", 0]] },
  { b: "Crear una cuenta gratuita de ChatGPT (chat.openai.com) y una de Claude (claude.ai)." },
  { b: "Traer laptop con cargador, navegador Chrome o Edge, y Office (Word, Excel, PowerPoint)." },
  { b: "Entrar una vez al laboratorio del curso con el usuario y contraseña que recibirán por separado." },
  { b: "Pensar en un problema real de su trabajo que quieran resolver o agilizar con IA." },
  { p: "Adjuntamos dos documentos: (1) Prerequisitos del curso y (2) Guía paso a paso para crear las cuentas. No se necesita experiencia previa con IA ni conocimientos técnicos." },
  { p: "Cualquier duda con las cuentas o el acceso, escríbannos y con gusto les ayudamos antes del curso." },
  { spacer: 120 },
  { p: "Saludos cordiales," },
  { p: [["Equipo MagnaTic · Think Evolution", 1]] },
];

const cuentas = [
  { title: "Guía para crear tus cuentas (ChatGPT y Claude)" },
  { pi: "Paso a paso, sin conocimientos técnicos. Ambas son gratuitas." },

  { h2: "Parte A — Crear cuenta de ChatGPT" },
  { b: "Abre tu navegador y entra a: chat.openai.com" },
  { b: "Haz clic en \"Sign up\" (Registrarse)." },
  { b: "Escribe tu correo y una contraseña, o usa \"Continuar con Google/Microsoft\" si prefieres." },
  { b: "Revisa tu correo y confirma la cuenta (haz clic en el enlace que te envían)." },
  { b: "Completa tu nombre y fecha de nacimiento si te lo pide." },
  { b: "Listo. Ya puedes escribirle en el recuadro de abajo. Prueba: \"Hola, ¿en qué me puedes ayudar?\"." },
  { note: "No necesitas la versión de pago. La cuenta gratuita es suficiente para el curso." },

  { h2: "Parte B — Crear cuenta de Claude" },
  { b: "Abre tu navegador y entra a: claude.ai" },
  { b: "Haz clic en \"Sign up\" (Registrarse)." },
  { b: "Ingresa tu correo o usa \"Continuar con Google\"." },
  { b: "Te llegará un código a tu correo: escríbelo para verificar." },
  { b: "Completa tu nombre. Acepta los términos." },
  { b: "Listo. Prueba escribiendo: \"Hola, resúmeme en 3 puntos qué puedes hacer\"." },
  { note: "Igual que ChatGPT, la versión gratuita es suficiente." },

  { h2: "Consejos" },
  { b: "Anota el correo y la contraseña de cada cuenta en un lugar seguro." },
  { b: "Puedes usar el mismo correo para ambas." },
  { b: "Si algo no funciona el día del registro, no te preocupes: lo resolvemos al inicio del curso." },

  { h2: "¿Problemas frecuentes?" },
  { table: { head: ["Situación", "Qué hacer"], rows: [
    ["No llega el correo de verificación", "Revisa la carpeta de spam o correo no deseado."],
    ["Pide número de teléfono", "Es normal en ChatGPT; ingresa tu número para recibir un código."],
    ["La página está en inglés", "Puedes cambiar el idioma en los ajustes, o continuar: el curso te guía."],
    ["No puedo crear la cuenta", "Trae tus datos al curso; te ayudamos a crearla al inicio."],
  ] }},
];

writeDocx("Prerequisitos-del-Curso.docx", prereqs);
writeDocx("Correo-de-Bienvenida.docx", correo);
writeDocx("Guia-Crear-Cuentas.docx", cuentas);
console.log("3 documentos generados.");
