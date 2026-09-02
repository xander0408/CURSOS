// Genera varios documentos Word (.docx) del curso, sin dependencias externas.
// Motor Open XML reutilizable + mini-zip "stored".
import { writeFileSync, readFileSync, mkdirSync } from "fs";
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

function mdToBlocks(md) {
  const parseBold = (s) => {
    const parts = [];
    const re = /\*\*(.+?)\*\*/g;
    let last = 0;
    let m;
    let any = false;
    while ((m = re.exec(s))) {
      any = true;
      if (m.index > last) parts.push([s.slice(last, m.index), 0]);
      parts.push([m[1], 1]);
      last = m.index + m[0].length;
    }
    if (!any) return s;
    if (last < s.length) parts.push([s.slice(last), 0]);
    return parts;
  };
  const lines = String(md).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  const flushTable = (start) => {
    const rows = [];
    let j = start;
    while (j < lines.length && /^\s*\|/.test(lines[j])) {
      const cells = lines[j].split("|").slice(1, -1).map((c) => c.trim());
      if (!cells.every((c) => /^[-:]+$/.test(c))) rows.push(cells);
      j++;
    }
    if (rows.length >= 2) blocks.push({ table: { head: rows[0], rows: rows.slice(1) } });
    return j;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*\|/.test(line)) {
      i = flushTable(i);
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ title: line.slice(2).trim(), center: true });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ spacer: 280 });
      blocks.push({ h2: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ h3: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("---")) {
      i++;
      continue;
    }
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      blocks.push({ b: parseBold(line.replace(/^\s*[-*]\s+/, "")) });
      i++;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      blocks.push({ b: parseBold(line.replace(/^\s*\d+\.\s+/, "")) });
      i++;
      continue;
    }
    const buf = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#|---|\s*[-*]\s+|\s*\|)/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    const t = buf.join(" ");
    if (t) blocks.push({ p: parseBold(t) });
  }
  return blocks;
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
  try {
    writeFileSync(filename, zip);
    console.log(filename + ": " + zip.length + " bytes");
  } catch (e) {
    if (e && e.code === "EBUSY") {
      console.warn("Archivo abierto, no se pudo escribir: " + filename);
      return;
    }
    throw e;
  }
}

// ==================== CONTENIDO DE LOS 4 DOCUMENTOS ====================

// 1) Manual / Guia rapida del alumno
const manual = [
  { title: "Manual del Alumno — AI Business Lab" },
  { pi: "Guía rápida para usar el laboratorio. MagnaTic · Think Evolution." },
  { h2: "1. Cómo entrar" },
  { b: "Abre el enlace del instructor e inicia sesión con TU usuario y contraseña (no las compartas en voz alta)." },
  { b: "Úsalo en una ventana normal (no incógnito), para que se guarde tu avance." },
  { b: "El orden recomendado es Conocernos → Cuentas → Historia. El menú no te encierra: puedes abrir quiz, módulos y comparador." },
  { h2: "2. Antes de empezar, ten abiertas dos pestañas más" },
  { b: "ChatGPT: chat.openai.com (cuenta gratuita)." },
  { b: "Claude: claude.ai (cuenta gratuita)." },
  { p: "El laboratorio NO reemplaza a ChatGPT ni a Claude: es donde aprendes el método y practicas. La IA real la usas en esas pestañas." },
  { h2: "3. Qué hay en el menú" },
  { table: { head: ["Sección", "Para qué sirve"], rows: [
    ["Ruta", "Orden del curso y tu siguiente paso."],
    ["Conocernos", "Quién eres y tu caso de práctica (ficticio). No bloquea el resto del menú."],
    ["Cuentas gratis", "Hasta dónde llegan ChatGPT y Claude Free."],
    ["Módulos", "Historia de la IA + laboratorios. El siguiente se abre al terminar las lecciones del anterior."],
    ["Actividades", "Misiones cortas para no quedarte parado."],
    ["Manual prompts", "Casos de uso reales para copiar y pegar."],
    ["Quiz / Retos", "Repaso y ejercicios. Entra aunque no hayas cerrado Conocernos."],
    ["Comparador", "Mismo prompt; ejemplos típicos distintos o tus pegados reales."],
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

writeDocx("Manual-Aprendizaje-IA.docx", [
  { pi: "Documento para llevarse. En el aula practicamos; aquí queda el oficio." },
  ...mdToBlocks(readFileSync("docs/MANUAL-APRENDIZAJE-IA.md", "utf8")),
]);
writeDocx("Manual-del-Alumno.docx", manual);
writeDocx("Reglas-del-Laboratorio.docx", reglas);
writeDocx("Ficha-Proyecto-Final.docx", ficha);
writeDocx("Constancia-Participacion.docx", certificado);

writeDocx("Prerrequisitos.docx", [
  { title: "Prerrequisitos del curso" },
  { pi: "AI Business Lab — 16 horas. MagnaTic." },
  { h2: "Alumno" },
  { b: "Cuenta gratuita de ChatGPT y de Claude, creadas antes del primer viernes." },
  { b: "Computadora con Chrome, Edge o Firefox. No uses modo incognito." },
  { b: "Word, Excel y PowerPoint (o equivalentes)." },
  { b: "Usuario y contrasena del laboratorio (te las da el instructor en privado)." },
  { b: "Una tarea de tu cargo que te quite tiempo, descrita sin datos internos." },
  { h2: "Instructor" },
  { b: "Proyector, PPT actualizada, enlace del laboratorio probado." },
  { b: "Credenciales impresas o enviadas en privado." },
  { b: "Plan B si Claude se queda sin creditos: continuar en ChatGPT." },
]);

writeDocx("Cuentas-gratis.docx", [
  { title: "Cuentas gratuitas: hasta donde llegan" },
  { pi: "Orientacion de aula. Si la herramienta muestra otro aviso, gana lo que ves en pantalla. Agosto 2026." },
  { h2: "ChatGPT Free" },
  { p: "Chats de texto en el modelo gratuito que aparezca ese dia en ChatGPT Free. Archivos e imagenes tienen tope. No es un plan empresarial. Si la pantalla dice otra cosa, gana lo que ves." },
  { h2: "Claude Free" },
  { p: "Cupo de creditos que se renueva cada 5 horas aproximadamente. Textos largos gastan mas. Usa Claude para comparar entregables, no para 80 iteraciones seguidas." },
  { h2: "En clase" },
  { b: "Pega texto anonimo, no archivos pesados." },
  { b: "Si se acaba Claude, sigue en ChatGPT con el mismo prompt." },
]);

writeDocx("Manual-de-Prompts.docx", [
  { title: "Manual de prompts — casos de uso" },
  { p: "Un prompt es un encargo de trabajo, no un hechizo. Cinco piezas: Rol, Contexto, Objetivo, Formato, Restricciones." },
  { h2: "Casos para copiar (anonimos)" },
  { b: "Correo de queja: cliente Alfa, 3 dias, 10% proxima compra, sin reembolso, sin inventar causa." },
  { b: "Minuta de patio: fila de camiones, lote humedo, radio del jueves sin dueno." },
  { b: "Excel: =A2*B2 y tres celdas a mano. Si hay texto, Excel falla." },
  { b: "PPT a comite: 6 slides, [CIFRA OFICIAL], maximo 3 vinetas." },
  { h2: "Como se usa en clase" },
  { b: "Copia del laboratorio (Manual o Comparador), pega en ChatGPT y el mismo texto en Claude." },
  { b: "ChatGPT suele ir mas listo para enviar; Claude suele marcar huecos. Tu eliges por el caso." },
  { b: "Verifica cifras y normas fuera del chat. Plantillas largas: menu Manual prompts." },
]);

const roster = JSON.parse(readFileSync("content/students.json", "utf8"));
const tasksFile = JSON.parse(readFileSync("content/tasks.json", "utf8"));
mkdirSync("proyectos", { recursive: true });
for (const st of roster.students) {
  const task = tasksFile.items.find((t) => t.id === st.taskId);
  if (!task) continue;
  const body = [
    { title: "Proyecto final — caso de practica" },
    { pi: st.name + " · " + st.role },
    { h2: "Como usarlo" },
    { p: "Copia el prompt de abajo, pégalo en ChatGPT, luego el mismo texto en Claude. Los datos son ficticios (Planta Norte). No sustituyas con informacion real de tu empresa." },
    { h2: "Problema de partida" },
    { p: task.problem },
    { h2: "Entregable" },
    { p: task.deliverable },
    { h2: "Cuando en el cronograma" },
    { p: task.when },
    { h2: "Prompt para copiar y pegar" },
    ...String(task.pastePrompt || "").split("\n").map((line) => (line.trim() ? { p: line } : { spacer: 40 })),
  ];
  const fname = "proyectos/" + st.username + "-proyecto-final.docx";
  writeDocx(fname, body);
}
writeDocx("Guion-Instructor-Completo.docx", [
  { pi: "Leelo en voz alta. Asi hablo yo en el aula." },
  ...mdToBlocks(readFileSync("docs/GUION-INSTRUCTOR-COMPLETO.md", "utf8")),
]);
writeDocx("Guion-Instructor-Hablar.docx", [
  { pi: "Leelo en voz alta. Asi hablo yo en el aula." },
  ...mdToBlocks(readFileSync("docs/GUION-INSTRUCTOR-COMPLETO.md", "utf8")),
]);
writeDocx("Guia-Facilitacion-Aula.docx", [
  { title: "Guion de aula — ocupacion continua" },
  { pi: "Instructor MagnaTic. Version extensa: docs/GUIA-FACILITACION-AULA.md. Sitio: https://xander0408.github.io/CURSOS/ (barra final)." },
  { h2: "Como se empieza (07:40)" },
  { p: "Diles: Chrome o Edge normal, no incognito. URL con barra al final. Esperan el logo MagnaTic. Tres pestanas: laboratorio, ChatGPT, Claude. Claves en privado, nunca en el proyector." },
  { h2: "Que no confundir" },
  { b: "Ficha-Proyecto-Final.docx = plantilla vacia. Se ofrece viernes 1 al cierre o viernes 2; no es la entrega." },
  { b: "proyectos/USUARIO-proyecto-final.docx = caso lleno. Se reparte viernes 2 a las 14:20 para copiar al portal." },
  { b: "Entrega oficial: Proyecto final, 12 pasos, Guardar ficha. ChatGPT y Claude en vivo." },
  { h2: "Frases fijas" },
  { b: "La IA propone. Tu decides y verificas." },
  { b: "Nada de nomina, contratos, clientes con nombre ni cifras oficiales." },
  { b: "Si un modulo no abre: Continuar en cada leccion del anterior." },
  { b: "El examen es el viernes 2, 14:20-16:25. El viernes 1 no se cierra la ficha." },
  { h2: "Viernes 1 — reloj" },
  { table: { head: ["Hora", "Diles / ellos"], rows: [
    ["07:40-08:00", "URL, logo, 3 pestanas, login. Reserva: quiz calentamiento."],
    ["08:00-08:25", "Conocernos 3 min + quiz calentamiento. Reserva: leer Cuentas gratis."],
    ["08:25-08:50", "Cuentas gratis, entendido, a1-a2."],
    ["08:50-10:10", "M0 + quiz q0. Descanso 10 min. Reserva: repetir calentamiento."],
    ["10:20-12:00", "M1 + A.C.T.I.V.A. + q1. M2 + prompt pobre vs bueno (a3)."],
    ["12:00-13:00", "Almuerzo. Opcional calentamiento en parejas (no examen)."],
    ["13:00-15:00", "M3, 5 piezas de memoria, biblioteca a6, q3."],
    ["15:00-16:25", "M4 Word a7. Caso anonimo. NO Guardar ficha. NO repartir proyectos/."],
    ["16:25-17:00", "Quiz cierre 5 min. Una cosa que no pegaran. Exportar JSON."],
  ] } },
  { h2: "Viernes 2 — reloj" },
  { table: { head: ["Hora", "Diles / ellos"], rows: [
    ["08:00-08:20", "Sesion o importar JSON. Calentamiento. 3 errores tipicos."],
    ["08:20-10:00", "M5 Excel: 6 filas inventadas, 3 celdas a mano, q5."],
    ["10:10-12:00", "M6 PPT + Comparador mismo prompt, a9. Mini-votacion."],
    ["12:00-13:00", "Almuerzo."],
    ["13:00-14:20", "M7 caza de error + M8. q7 y q8. A las 14:20 cierra teoria."],
    ["14:20-16:25", "EXAMEN: su Word de proyectos/ + 12 pasos + Guardar ficha + a10-a12."],
    ["16:25-17:00", "Quiz qf. 3 exposiciones de 1 min. Insignias. Constancia."],
  ] } },
  { h2: "Ritmo del examen (dilo a las 14:20)" },
  { table: { head: ["Reloj", "Pasos"], rows: [
    ["14:20-14:40", "1-4 problema, hoy, tiempo, que hace la IA / el humano"],
    ["14:40-15:10", "5-7 prompt + ChatGPT + Claude de verdad"],
    ["15:10-15:40", "8-10 comparar, refinar, verificar fuera del chat"],
    ["15:40-16:10", "11-12 proceso, ahorro, Guardar ficha"],
    ["16:10-16:25", "Colchon o ensayar el minuto en voz alta"],
  ] } },
  { h2: "Quien termina antes" },
  { b: "Menu Actividades, otro calentamiento, biblioteca, segundo comparador, ayudar al de al lado sin copiarle la ficha." },
  { h2: "Quien va lento" },
  { p: "No lo dejes leyendo 40 minutos. Continuar, quiz, y el chat. El texto lo lee en el almuerzo." },
]);

writeDocx("Credenciales-Instructor.docx", [
  { title: "Credenciales (solo instructor — no proyectar)" },
  { p: "Admin: usuario instructor. Contrasena y PIN estan en CREDENCIALES-INSTRUCTOR.md." },
  { table: { head: ["Nombre", "Usuario", "Contrasena"], rows: roster.students.map((s) => [s.name, s.username, s.password]) } },
]);
console.log("Documentos del curso y proyectos por alumno generados.");
