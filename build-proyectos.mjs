/**
 * Un Word por alumno en proyectos/.
 * Esto es el examen. No son los 4 casos de mesa.
 * Uso: node build-proyectos.mjs
 */
import JSZip from "jszip";
import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const students = JSON.parse(readFileSync(join(ROOT, "content", "students.json"), "utf8"));
const tasks = JSON.parse(readFileSync(join(ROOT, "content", "tasks.json"), "utf8"));
const byId = Object.fromEntries(tasks.items.map((t) => [t.id, t]));
const DEST = join(ROOT, "proyectos");

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
  writeFileSync(dest, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
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
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${xmlEsc(title)}</w:t></w:r></w:p>
    ${body}
  </w:body>
</w:document>`,
    },
    dest
  );
}

mkdirSync(DEST, { recursive: true });

const list = [];
for (const st of students.students) {
  const t = byId[st.taskId];
  if (!t) continue;
  const fname = `${st.username}-proyecto-final.docx`;
  const promptLines = String(t.pastePrompt || "")
    .split("\n")
    .map((line) => line || " ");
  await writeDocx(join(DEST, fname), `${st.name.split(" ")[0]}, este es tu proyecto`, [
    st.role,
    "",
    "Esto NO es el caso de mesa (el de los 40 minutos). Esto es TU examen.",
    "",
    t.hello || "",
    "",
    "# Qué te duele",
    t.problem || "",
    "",
    "# Qué pasó (de práctica)",
    t.story || "",
    "",
    "# Qué vas a entregar",
    t.doThis || t.deliverable || "",
    "",
    "# Esto no",
    t.dont || "Nada de la empresa de verdad. Si no sabes un dato, pon [COMPLETAR].",
    "",
    "# Cómo",
    "1. Copia el recuadro de abajo.",
    "2. Pégalo en ChatGPT.",
    "3. El mismo texto en Claude.",
    "4. En el laboratorio abre Proyecto final. Anota las dos respuestas, qué cambiaste y qué revisaste tú.",
    "",
    "# Texto para copiar",
    ...promptLines,
  ]);
  list.push(`${fname}  —  ${t.title}`);
}

writeFileSync(
  join(DEST, "README.txt"),
  `Un Word por alumno. Esto es el EXAMEN.\nNo son los 4 casos de mesa (esos están en casos-oficina).\n\n${list.join("\n")}\n`
);

console.log("Listo:", DEST);
