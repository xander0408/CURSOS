// Genera la Guia del Instructor en Word (.docx), sin dependencias externas.
// Un .docx es un ZIP Open XML; reutilizamos un mini-zip "stored".
import { writeFileSync } from "fs";
import { crc32 as zcrc } from "zlib";

const TEAL = "16C6AD";
const PURPLE = "610A8B";

// ---------- Modelo del documento ----------
// Cada bloque: {h1|h2|h3|p|b|note}, o {table:{head:[],rows:[[]]}}
const doc = [
  { h1: "Guía del Instructor — AI Business Lab" },
  { p: [["Curso: ", 1], ["Inteligencia Artificial Aplicada al Negocio (basado en ChatGPT y Claude)", 0]] },
  { p: [["Duración: ", 1], ["16 horas — 2 viernes de 8 horas cada uno", 0]] },
  { p: [["Modalidad: ", 1], ["Presencial o remota, con el laboratorio web abierto en el navegador de cada alumno", 0]] },
  { p: [["Cupo sugerido: ", 1], ["hasta 50 alumnos", 0]] },
  { pi: "Esta guía es para el facilitador. El alumno no la necesita." },

  { h2: "1. Qué es este laboratorio y cómo funciona" },
  { p: "El AI Business Lab es un sitio web educativo que corre en el navegador. No reemplaza a ChatGPT ni a Claude: es el entorno donde el alumno aprende el método, practica con retos, juega quizzes de repaso y arma su proyecto final. El uso real de la IA se hace en otra pestaña (ChatGPT o Claude en su versión gratuita)." },
  { p: "Puntos clave que debes comunicar el primer día:" },
  { b: "El progreso de cada alumno se guarda en su propio navegador (no en un servidor). Si cambia de equipo o borra los datos del navegador, empieza de nuevo." },
  { b: "No hay un panel central donde tú veas el avance de todos. El seguimiento en clase es presencial." },
  { b: "La metodología del curso es A.C.T.I.V.A.: Analizar, Contextualizar, Transformar, Iterar, Verificar, Aplicar." },
  { b: "La regla de oro, repetida en todo el curso: la IA propone, la persona decide y verifica." },
  { h3: "Modo instructor" },
  { p: "En el menú lateral, botón \"Instructor\" → PIN 1234. Desbloquea notas de facilitación dentro de las lecciones y retos. El PIN se puede cambiar editando content/instructor-notes.json." },
  { note: "Nota de seguridad: si el sitio es público, el PIN es visible en el código. No lo uses para nada sensible; solo protege las notas de facilitación." },

  { h2: "2. Requisitos del alumno" },
  { p: "Antes de la primera sesión, cada alumno debe tener:" },
  { h3: "Cuentas (todas gratuitas)" },
  { b: "Cuenta de ChatGPT (chat.openai.com) — versión gratuita." },
  { b: "Cuenta de Claude (claude.ai) — versión gratuita." },
  { b: "Un correo electrónico funcional para crear las cuentas." },
  { h3: "Equipo" },
  { b: "Computadora (Windows, Mac o Linux) con navegador moderno (Chrome, Edge o Firefox actualizados)." },
  { b: "Conexión a internet estable." },
  { b: "Microsoft Office (Word, Excel, PowerPoint) o equivalente (Google Docs/Sheets/Slides)." },
  { h3: "Conocimientos previos" },
  { b: "Nivel usuario básico de computadora (abrir navegador, copiar y pegar, guardar archivos)." },
  { b: "No se requiere experiencia previa con IA ni programación." },
  { h3: "Actitud" },
  { b: "Traer un problema real de su trabajo que quiera resolver o agilizar. Es la base del proyecto final." },
  { b: "Disposición a no pegar datos confidenciales. Se trabaja con casos anonimizados." },

  { h2: "3. Material que se le entrega al alumno" },
  { p: "Al inicio del curso, comparte:" },
  { b: "El enlace al laboratorio (GitHub Pages: https://xander0408.github.io/CURSOS/)." },
  { b: "Guía rápida de acceso: cómo entrar, escribir su nombre, navegar módulos y quizzes." },
  { b: "Recordatorio de cuentas: cómo crear ChatGPT y Claude gratis." },
  { b: "Hoja de reglas del laboratorio: qué NO pegar y la regla de verificación humana." },
  { b: "Plantilla de la ficha de proyecto." },
  { p: [["Material que el alumno produce y se lleva:", 1]] },
  { b: "Su biblioteca de prompts (construida en el Prompt Lab)." },
  { b: "Su ficha de proyecto final (problema, solución, prompt, validación, tiempo ahorrado)." },
  { b: "Su respaldo de progreso (botón Exportar avance en la sección Progreso)." },

  { h2: "4. Estructura del curso (mapa de módulos)" },
  { table: {
    head: ["#", "Módulo", "Enfoque", "Sesión"],
    rows: [
      ["1", "Fundamentos de IA generativa", "Qué es, límites, alucinaciones, verificación", "Viernes 1"],
      ["2", "Cómo hablar con una IA", "Contexto, objetivo, tono, ejemplos, iteración", "Viernes 1"],
      ["3", "Ingeniería de prompts", "Framework de 5 piezas, prompt maestro, biblioteca", "Viernes 1"],
      ["4", "IA + Word", "Documentos, tono, revisión humana", "Viernes 1"],
      ["5", "IA + Excel", "Fórmulas y validación de números", "Viernes 2"],
      ["6", "IA + PowerPoint", "Estructura, storytelling, guion", "Viernes 2"],
      ["7", "Análisis e investigación", "Resumir, comparar, verificar fuentes", "Viernes 2"],
      ["8", "Productividad diaria", "Correos, minutas, decisiones", "Viernes 2"],
      ["9", "Proyecto final", "Un problema real, de punta a punta", "Viernes 2"],
    ],
  }},
  { p: [["Herramientas transversales (siempre en el menú):", 1]] },
  { b: "Quiz: repaso estilo concurso, cronometrado, con puntos por rapidez." },
  { b: "Prompt Lab: construir prompts con el framework y guardarlos." },
  { b: "Comparador: mismo prompt en ChatGPT vs Claude." },
  { b: "Biblioteca: plantillas de prompts reutilizables." },
  { b: "Proyecto final: 12 pasos guiados hasta la ficha." },

  { h2: "5. Paso a paso por sesión" },
  { p: "El curso son 2 viernes de 8 horas cada uno. Cada jornada incluye una pausa de comida (~1 h) y dos pausas cortas (~15 min). Tiempo efectivo por día: ~6 h 30 min. Los tiempos son sugeridos; ajústalos al ritmo del grupo." },

  { h3: "Viernes 1 — Fundamentos, conversación, prompts y Word (Módulos 1 a 4)" },
  { p: [["Apertura (20 min): ", 1], ["entren al laboratorio, ChatGPT y Claude abiertos, escriban su nombre. Explica la regla de oro y la de privacidad.", 0]] },
  { p: [["Bloque 1 — Módulo 1: Fundamentos (75 min): ", 1], ["lecciones proyectadas, deteniéndote en cada callout. Pregunta qué tarea repetitiva odian (candidatas al proyecto). Retos del Módulo 1 + Quiz 1.", 0]] },
  { p: [["Bloque 2 — Módulo 2 (75 min): ", 1], ["dar contexto e iterar. Ejercicio en vivo mejorando un pedido pobre. Retos + Quiz 2.", 0]] },
  { p: [["Pausa corta (15 min).", 1]] },
  { p: [["Bloque 3 — Módulo 3: Prompts (90 min): ", 1], ["el corazón del curso. Framework de 5 piezas hasta memorizarlo. Prompt maestro en el Prompt Lab. Retos + Quiz 3.", 0]] },
  { p: [["Pausa de comida (~60 min).", 1]] },
  { p: [["Bloque 4 — Módulo 4: Word (90 min): ", 1], ["tipos de documento, tono y revisión humana. Práctica con caso anonimizado. Retos + Quiz 4.", 0]] },
  { p: [["Cierre del día 1 (25 min): ", 1], ["compartir una tarea real. Recuérdales exportar su avance por si el día 2 usan otro equipo.", 0]] },

  { h3: "Viernes 2 — Excel, PowerPoint, Análisis, Productividad y Proyecto final (Módulos 5 a 9)" },
  { p: [["Repaso de apertura (20 min): ", 1], ["juega el Quiz 3. Si alguien cambió de equipo, que importe su avance.", 0]] },
  { p: [["Bloque 1 — Módulo 5: Excel (70 min): ", 1], ["el número siempre se valida con un caso conocido. Práctica con archivo de ejemplo. Retos + Quiz 5.", 0]] },
  { p: [["Bloque 2 — Módulo 6: PowerPoint (70 min): ", 1], ["estructura + storytelling + guion. Convertir un texto largo en diapositivas. Retos + Quiz 6.", 0]] },
  { p: [["Pausa corta (15 min).", 1]] },
  { p: [["Bloque 3 — Módulo 7: Análisis (70 min): ", 1], ["resumir, comparar, verificar fuentes. Reto \"Caza las alucinaciones\" en grupo. Retos + Quiz 7.", 0]] },
  { p: [["Pausa de comida (~60 min).", 1]] },
  { p: [["Bloque 4 — Módulo 8: Productividad (50 min): ", 1], ["correos, minutas, decisiones asistidas. Retos + Quiz 8.", 0]] },
  { p: [["Bloque 5 — Módulo 9: Proyecto final (110 min): ", 1], ["cada alumno elige un problema real y recorre los 12 pasos hasta generar su ficha.", 0]] },
  { p: [["Cierre del curso (30 min): ", 1], ["presentaciones de fichas, Reto final \"AI Business Master\" y entrega de constancias.", 0]] },

  { h2: "6. Consejos de facilitación" },
  { b: "Proyecta los quizzes en modo concurso. Genera energía y sirve de repaso." },
  { b: "No corras las lecciones. El valor está en que piensen." },
  { b: "Insiste en la verificación y la privacidad en cada módulo." },
  { b: "Ancla todo a casos reales del trabajo de los alumnos." },
  { b: "Ten cuentas de respaldo de ChatGPT/Claude o empareja alumnos si alguien se atasca." },
  { b: "Recuérdales exportar su progreso al final de cada sesión." },

  { h2: "7. Resolución de problemas frecuentes" },
  { table: {
    head: ["Problema", "Causa probable", "Solución"],
    rows: [
      ["Pantalla en blanco", "Abrió el archivo con doble clic", "Entrar por el enlace web (GitHub Pages), no el HTML local"],
      ["Mi progreso no se guarda", "Modo incógnito o almacenamiento bloqueado", "Usar ventana normal; el laboratorio avisa con un mensaje"],
      ["Perdí mi avance", "Cambió de navegador/equipo o borró datos", "Progreso local por navegador; usar Exportar/Importar avance"],
      ["El quiz no avanza", "Se acabó el tiempo o no eligió opción", "Es normal: pasa a la explicación y a la siguiente pregunta"],
      ["No veo las notas del instructor", "Falta desbloquear modo instructor", "Botón Instructor → PIN 1234"],
    ],
  }},

  { h2: "8. Resultado esperado" },
  { p: "Al finalizar, el alumno es capaz de usar ChatGPT y Claude (versiones gratuitas) como asistentes de productividad para redactar, analizar, investigar, estructurar información, trabajar con documentos y datos, preparar presentaciones y resolver tareas laborales habituales, comprendiendo sus límites y validando los resultados antes de usarlos. Cada alumno se lleva su biblioteca de prompts y una ficha de proyecto con un ahorro de tiempo estimado y control humano." },
];

// ---------- Generacion de WordprocessingML ----------
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function run(text, { b = 0, color = null, sz = null } = {}) {
  const rpr = [];
  if (b) rpr.push("<w:b/>");
  if (color) rpr.push(`<w:color w:val="${color}"/>`);
  if (sz) rpr.push(`<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>`);
  const rprXml = rpr.length ? `<w:rPr>${rpr.join("")}</w:rPr>` : "";
  return `<w:r>${rprXml}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
}

function para(runsXml, { style = null, spacing = true } = {}) {
  const ppr = [];
  if (style) ppr.push(`<w:pStyle w:val="${style}"/>`);
  if (spacing) ppr.push('<w:spacing w:after="120"/>');
  const pprXml = ppr.length ? `<w:pPr>${ppr.join("")}</w:pPr>` : "";
  return `<w:p>${pprXml}${runsXml}</w:p>`;
}

function bulletPara(runsXml) {
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:spacing w:after="60"/></w:pPr>${runsXml}</w:p>`;
}

function richRuns(value) {
  // value puede ser string o array de [texto, boldFlag]
  if (Array.isArray(value)) {
    return value.map(([t, b]) => run(t, { b })).join("");
  }
  return run(value, {});
}

function tableXml(t) {
  const border = '<w:tblBorders><w:top w:val="single" w:sz="4" w:color="243049"/><w:left w:val="single" w:sz="4" w:color="243049"/><w:bottom w:val="single" w:sz="4" w:color="243049"/><w:right w:val="single" w:sz="4" w:color="243049"/><w:insideH w:val="single" w:sz="4" w:color="243049"/><w:insideV w:val="single" w:sz="4" w:color="243049"/></w:tblBorders>';
  const cell = (text, header) => {
    const shd = header ? `<w:shd w:val="clear" w:color="auto" w:fill="${PURPLE}"/>` : "";
    const runs = run(text, header ? { b: 1, color: "FFFFFF" } : {});
    return `<w:tc><w:tcPr>${shd}<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${runs}</w:p></w:tc>`;
  };
  const headRow = `<w:tr>${t.head.map((h) => cell(h, true)).join("")}</w:tr>`;
  const bodyRows = t.rows.map((r) => `<w:tr>${r.map((c) => cell(c, false)).join("")}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${border}<w:tblLook w:val="04A0"/></w:tblPr>${headRow}${bodyRows}</w:tbl>`;
}

const bodyParts = [];
for (const blk of doc) {
  if (blk.h1 != null) bodyParts.push(para(run(blk.h1, { b: 1, color: TEAL, sz: 44 }), { style: "Heading1" }));
  else if (blk.h2 != null) bodyParts.push(para(run(blk.h2, { b: 1, color: PURPLE, sz: 32 }), { style: "Heading2" }));
  else if (blk.h3 != null) bodyParts.push(para(run(blk.h3, { b: 1, color: TEAL, sz: 26 }), { style: "Heading3" }));
  else if (blk.pi != null) bodyParts.push(para(run(blk.pi, { color: "666666" })));
  else if (blk.note != null) bodyParts.push(para(run(blk.note, { color: "8A6D00" })));
  else if (blk.b != null) bodyParts.push(bulletPara(richRuns(blk.b)));
  else if (blk.p != null) bodyParts.push(para(richRuns(blk.p)));
  else if (blk.table != null) { bodyParts.push(tableXml(blk.table)); bodyParts.push(para(run("", {}), { spacing: false })); }
}

const sectPr = `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyParts.join("")}${sectPr}</w:body></w:document>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/></w:style></w:styles>`;

const numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>`;

const files = {
  "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>`,
  "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>`,
  "word/document.xml": documentXml,
  "word/styles.xml": stylesXml,
  "word/numbering.xml": numberingXml,
};

// ---------- Mini ZIP (store) ----------
function makeZip(fileMap) {
  const chunks = [], central = [];
  let offset = 0;
  const time = 0, date = 0x21;
  for (const [name, content] of Object.entries(fileMap)) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.from(content, "utf8");
    const crc = zcrc(data) >>> 0;
    const size = data.length;
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
  const centralStart = offset;
  let centralSize = 0; for (const c of central) centralSize += c.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
  const count = Object.keys(fileMap).length;
  end.writeUInt16LE(count, 8); end.writeUInt16LE(count, 10);
  end.writeUInt32LE(centralSize, 12); end.writeUInt32LE(centralStart, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...chunks, ...central, end]);
}

const zip = makeZip(files);
writeFileSync("GUIA-INSTRUCTOR.docx", zip);
console.log("DOCX generado: " + zip.length + " bytes");
