/**
 * Word de los 4 casos para imprimir y entregar en mesa.
 * Uso: node build-casos-oficina.mjs
 */
import JSZip from "jszip";
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const pack = JSON.parse(readFileSync(join(ROOT, "content", "office-cases.json"), "utf8"));
const DEST = join(ROOT, "casos-oficina");
const WEB = join(ROOT, "recursos", "viernes2", "casos");

function xmlEsc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function saveZip(files, dest) {
  const zip = new JSZip();
  for (const [name, body] of Object.entries(files)) zip.file(name, body);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  writeFileSync(dest, buf);
}

async function writeDocx(dest, title, paragraphs) {
  const body = paragraphs
    .map((p) => {
      const bold = p.startsWith("# ");
      const text = bold ? p.slice(2) : p;
      const rPr = bold ? "<w:rPr><w:b/></w:rPr>" : "";
      return `<w:p><w:r>${rPr}<w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p>`;
    })
    .join("");
  await saveZip(
    {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
      "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
      "word/document.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${xmlEsc(title)}</w:t></w:r></w:p>
    ${body}
  </w:body>
</w:document>`,
    },
    dest
  );
}

function caseParas(c) {
  return [
    `Caso ${c.n} de 4  ·  ${c.area}`,
    "Esto es un ejercicio de MESA. No es el proyecto final. El proyecto de cada persona es otro Word, el de la carpeta proyectos.",
    "",
    c.hello,
    "",
    "# Qué pasó",
    c.story,
    "",
    "# Qué hacen (dos veces: 40 min a mano, luego con IA)",
    ...c.deliver,
    "",
    "# Esto no",
    c.dont,
    "",
    "# Cómo",
    "1. Lean esta hoja. Si no quedó claro, pregunten ahora.",
    "2. 40 minutos. Internet apagado. Sin ChatGPT ni Claude. Solo Word, Excel y PowerPoint en blanco.",
    "3. Luego lo mismo CON IA. Anoten minutos a mano, minutos con IA y tres diferencias.",
    "",
    "Datos de práctica: Planta Central, Lote Norte, Cliente Alfa. Nada de la empresa de verdad.",
  ];
}

mkdirSync(DEST, { recursive: true });
mkdirSync(WEB, { recursive: true });

const names = [];
for (const c of pack.cases) {
  const fname = c.file.split("/").pop();
  const dest = join(DEST, fname);
  await writeDocx(dest, `Caso ${c.n} · ${c.title}`, caseParas(c));
  copyFileSync(dest, join(WEB, fname));
  copyFileSync(dest, join(ROOT, fname));
  names.push(fname);
}

await writeDocx(join(DEST, "INSTRUCTOR-Como-correr-los-casos.docx"), "Cómo corro los 4 casos", [
  "Una hoja por mesa. No mezcle dos casos en la misma mesa.",
  "",
  "# Antes",
  "Mesas de 3 o 4. Uno mira el reloj, otro Word, otro Excel, otro PowerPoint.",
  "Dos minutos para leer. Pregunte: ¿qué van a entregar? Si tartamudean, léales la lista. Luego: internet abajo.",
  "",
  "# Los 40 minutos",
  "Archivos nuevos, en blanco. Sin red. Sin chat. Al minuto 40: «guardan lo que tengan».",
  "",
  "# Con IA",
  "Lo mismo: Word, Excel y 4 diapositivas. Ahora sí ChatGPT o Claude. Sigue sin datos reales.",
  "",
  "# Cierre, 5 minutos",
  "Cada mesa dice en voz alta: minutos a mano, minutos con IA, una cosa que la máquina inventó, una cosa que a mano quedó más honesta.",
  "",
  "# Esto no es el examen",
  "El proyecto final es otro: un Word por alumno en la carpeta proyectos. No lo mezcle con estas hojas.",
  "",
  names.map((n, i) => `${i + 1}. ${n}`).join("   "),
]);
copyFileSync(join(DEST, "INSTRUCTOR-Como-correr-los-casos.docx"), join(ROOT, "INSTRUCTOR-Como-correr-los-casos.docx"));

writeFileSync(
  join(DEST, "README.txt"),
  `Una hoja por mesa. Ábranlas en Word e imprímanlas.\n\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\nINSTRUCTOR-Como-correr-los-casos.docx\n\nEsto es de práctica. Nada de la empresa de verdad.\n`
);

console.log("Listo:", DEST);
