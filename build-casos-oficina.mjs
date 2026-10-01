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

const commonClose = [
  "# Cómo se corre (las dos fases)",
  "Fase A — 40 minutos. Reloj en la mesa. Cierren internet (modo avión o Wi-Fi apagado). Prohibido ChatGPT, Claude, Copilot, Gemini y el celular como chat. Solo Word, Excel y PowerPoint en blanco. Piensen ustedes. Inventen solo datos de práctica (Planta Central, Lote Norte, Cliente Alfa). Nada de CISA real.",
  "Fase B — La misma entrega. Ahora sí pueden usar ChatGPT o Claude. Cronometren de nuevo. Anoten minutos A, minutos B y tres diferencias (velocidad, calidad, huecos, riesgos).",
  "# Proyecto final (cada persona, no el grupo)",
  "Después, cada integrante abre Proyecto final en el laboratorio, elige ESTE caso y completa los 7 pasos. La mesa ensayó; la ficha es individual. Presentación de 3 a 5 minutos.",
];

function caseParas(c) {
  return [
    `Caso ${c.n} de 4 · ${c.area} · Oficina + IA · Magnatic`,
    pack.rule,
    "# Situación",
    c.problem,
    "# Cómo se hace hoy",
    c.currentTask,
    "# Entrega (idéntica en Fase A y Fase B)",
    `${c.framework.objective} ${c.framework.format}`,
    "# Restricciones",
    c.framework.restrictions,
    "# Riesgos típicos",
    c.risks,
    "# Quién controla",
    c.process,
    ...commonClose,
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

await writeDocx(join(DEST, "INSTRUCTOR-Como-correr-los-casos.docx"), "Instructor · Cómo correr los 4 casos", [
  "Imprima un caso por mesa. No mezcle dos casos en la misma mesa.",
  "# Antes de empezar",
  "Mesas de 3 o 4. Roles: Reloj, Word, Excel, PowerPoint. Un celular puede ser SOLO cronómetro, no chat.",
  "Lean juntos la hoja del caso (2 minutos). Pregunte: ¿entendieron la entrega? Luego diga: internet abajo.",
  "# Fase A (40:00)",
  "Sin red. Sin IA. Archivos nuevos en blanco. Al minuto 40: «manos arriba, guardan lo que tengan».",
  "# Fase B (cronometrada, suele ser más corta)",
  "Mismo paquete Word + Excel + 4 slides. Pueden usar ChatGPT y Claude. Siguen prohibidos datos reales.",
  "# Cierre de mesa (5 minutos)",
  "Cada mesa dice en voz alta: minutos A, minutos B, una cosa que la IA inventó, una cosa que a mano quedó más honesta.",
  "# Proyecto final",
  "Cada alumno entra a Proyecto final, elige el mismo caso de su mesa y llena la ficha. No hay un PowerPoint colectivo como examen.",
  "# Archivos",
  names.map((n, i) => `${i + 1}. ${n}`).join(" · "),
  "Copias para el aula web: recursos/viernes2/casos/",
  "Copias en la raíz del repo, junto a las guías PDF, para imprimir.",
]);
copyFileSync(join(DEST, "INSTRUCTOR-Como-correr-los-casos.docx"), join(ROOT, "INSTRUCTOR-Como-correr-los-casos.docx"));

writeFileSync(
  join(DEST, "README.txt"),
  `Casos para imprimir y entregar (Oficina + IA)\n\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\nINSTRUCTOR-Como-correr-los-casos.docx\n\nÁbralos en Microsoft Word. No use datos reales de CISA.\n`
);

console.log("Listo:", DEST);
