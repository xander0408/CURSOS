/**
 * Genera Excel (.xlsx), PowerPoint (.pptx) y Word (.docx) de práctica para el Viernes 2.
 * Uso: node build-recursos-viernes2.mjs
 */
import PptxGenJS from "pptxgenjs";
import JSZip from "jszip";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "recursos", "viernes2");

const ROWS = [
  ["registro", "ubicacion", "fecha_turno", "producto_ficticio", "unidades", "costo_unitario_ficticio", "horas_retraso", "estado"],
  ["R-001", "Planta Central", "2026-09-01", "Producto A", 120, 4.5, 0.5, "Completado"],
  ["R-002", "Lote Norte", "2026-09-01", "Producto B", 85, 6.2, 1.0, "Completado"],
  ["R-003", "Planta Central", "2026-09-02", "Producto B", 95, 6.2, 0, "Completado"],
  ["R-004", "Lote Norte", "2026-09-02", "Producto A", 140, 4.5, 2.0, "En revisión"],
  ["R-005", "Planta Central", "2026-09-03", "Producto C", 60, 8.75, 1.5, "En revisión"],
  ["R-006", "Lote Norte", "2026-09-03", "Producto C", 72, 8.75, 0.5, "Completado"],
  ["R-007", "Planta Central", "2026-09-04", "Producto A", 110, 4.5, 0, "Completado"],
  ["R-008", "Lote Norte", "2026-09-04", "Producto B", 90, 6.2, 1.0, "Pendiente"],
  ["R-009", "Planta Central", "2026-09-05", "Producto C", 68, 8.75, 0.5, "Completado"],
  ["R-010", "Lote Norte", "2026-09-05", "Producto A", 130, 4.5, 1.5, "Completado"],
];

function xmlEsc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function colLetter(n) {
  let s = "";
  let x = n;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

async function saveZip(files, dest) {
  const zip = new JSZip();
  for (const [name, body] of Object.entries(files)) zip.file(name, body);
  const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  writeFileSync(dest, buf);
}

async function writeXlsx(dest) {
  const extra = ["costo_total_ficticio", "notas_de_verificacion"];
  const header = [...ROWS[0], ...extra];
  const rowsXml = [header, ...ROWS.slice(1).map((r) => [...r, "", ""])]
    .map((row, i) => {
      const cells = row
        .map((val, j) => {
          const ref = `${colLetter(j + 1)}${i + 1}`;
          if (typeof val === "number") return `<c r="${ref}"><v>${val}</v></c>`;
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEsc(val)}</t></is></c>`;
        })
        .join("");
      return `<row r="${i + 1}">${cells}</row>`;
    })
    .join("");
  const notes = [
    "Práctica Viernes 2 — Excel + IA en Acción",
    "Todos los datos son ficticios (Planta Central, Lote Norte). No pegue información real.",
    "1. Pida a ChatGPT o Claude una fórmula de costo total = unidades × costo unitario.",
    "2. Escriba la fórmula en la columna costo_total_ficticio y compruebe 3 filas a mano.",
    "3. Compare Planta Central y Lote Norte (unidades y retrasos) sin inventar cifras.",
    "4. Separe lo calculado de cualquier interpretación o recomendación.",
    "5. Marque [VERIFICAR] si la IA inventa un porcentaje, meta o responsable.",
  ];
  const noteRows = notes
    .map(
      (t, i) =>
        `<row r="${i + 1}"><c r="A${i + 1}" t="inlineStr"><is><t>${xmlEsc(t)}</t></is></c></row>`
    )
    .join("");

  await saveZip(
    {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
      "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Datos" sheetId="1" r:id="rId1"/>
    <sheet name="Instrucciones" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`,
      "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`,
      "xl/worksheets/sheet1.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowsXml}</sheetData>
</worksheet>`,
      "xl/worksheets/sheet2.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${noteRows}</sheetData>
</worksheet>`,
    },
    dest
  );
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

async function writePptx(dest) {
  const pptx = new PptxGenJS();
  pptx.author = "Magnatic";
  pptx.title = "Documento base ficticio — despachos (Viernes 2)";
  pptx.subject = "Práctica De Información a Presentación Ejecutiva";
  const bg = "0E0A18";
  const teal = "16C6AD";
  const white = "FFFFFF";
  const muted = "B7B3C7";

  const add = (kicker, title, bullets) => {
    const s = pptx.addSlide();
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: bg } });
    s.addText(kicker, { x: 0.5, y: 0.28, w: 9, h: 0.3, fontSize: 12, color: teal, bold: true });
    s.addText(title, { x: 0.5, y: 0.6, w: 9, h: 0.7, fontSize: 22, color: white, bold: true });
    s.addText(
      bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
      { x: 0.5, y: 1.45, w: 9, h: 3.7, fontSize: 16, color: muted, paraSpaceAfter: 10 }
    );
  };

  const cover = pptx.addSlide();
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.63, fill: { color: bg } });
  cover.addText("VIERNES 2 · PRÁCTICA", { x: 0.5, y: 1.4, w: 9, h: 0.35, fontSize: 14, color: teal, bold: true });
  cover.addText("Documento base: mejora del flujo de despachos", {
    x: 0.5,
    y: 1.9,
    w: 9,
    h: 1.2,
    fontSize: 28,
    color: white,
    bold: true,
  });
  cover.addText("Material ficticio para armar una presentación ejecutiva. Planta Central y Lote Norte. No use datos reales.", {
    x: 0.5,
    y: 3.4,
    w: 9,
    h: 0.8,
    fontSize: 16,
    color: muted,
  });

  add("AUDIENCIA Y PROPÓSITO", "Para un equipo directivo simulado", [
    "Preparar una presentación que discuta cómo reducir esperas en el despacho.",
    "No afirmar causas que todavía no han sido verificadas.",
    "La recomendación es una propuesta sujeta a decisión humana.",
  ]);
  add("SITUACIÓN OBSERVADA", "Lo que sí aparece en el caso", [
    "En varios turnos de práctica se registraron esperas antes del despacho.",
    "Los registros ficticios no usan una misma descripción para todos los estados.",
    "Algunas novedades llegan por mensajes separados y luego deben consolidarse.",
    "No hay en este documento una causa confirmada ni una persona responsable.",
  ]);
  add("EVIDENCIA DISPONIBLE", "Qué se puede usar y qué no", [
    "Hay un Excel ficticio de diez registros (Planta Central y Lote Norte).",
    "Incluye unidades, costo unitario ficticio, horas de retraso y estado.",
    "Sirve para cálculos de práctica, no representa resultados de una empresa.",
    "No hay metas oficiales, presupuesto aprobado ni fecha límite.",
  ]);
  add("OPCIONES PARA DISCUTIR", "Sin elegir ganador todavía", [
    "Estandarizar los estados usados en el registro.",
    "Crear una revisión breve antes de cada despacho.",
    "Consolidar novedades en una sola plantilla.",
    "Probar un tablero básico durante un periodo todavía no definido.",
  ]);
  add("RESTRICCIONES", "Antes de presentar", [
    "No afirmar que una opción resolverá el problema.",
    "No inventar ahorros, porcentajes, fechas, responsables ni metas.",
    "Marcar [VERIFICAR] cualquier dato que no aparezca aquí.",
    "Máximo cuatro viñetas por diapositiva en la versión ejecutiva final.",
  ]);

  await pptx.writeFile({ fileName: dest });
}

mkdirSync(OUT, { recursive: true });
await writeXlsx(join(OUT, "datos-practica-excel.xlsx"));
await writePptx(join(OUT, "documento-base-presentacion.pptx"));
await writeDocx(join(OUT, "dossier-investigacion.docx"), "Dossier ficticio para verificación cruzada", [
  "Todas las organizaciones, personas, documentos y enlaces son inventados. No describen hechos reales.",
  "# Caso",
  "Una organización simulada evalúa afirmaciones sobre un supuesto sistema de coordinación de despachos. El objetivo no es decidir si el sistema funciona, sino qué afirmaciones están respaldadas.",
  "# Afirmación A",
  "El sistema redujo a la mitad las esperas de despacho en Planta Central. Fuente: boletín Noticias de Operación, edición 14, 12 de agosto de 2026. Autoría: Equipo editorial, sin nombres. Evidencia: resultados del último trimestre, sin tabla ni metodología.",
  "# Afirmación B",
  "Nueve de cada diez usuarios prefieren el nuevo flujo. Fuente: resumen de encuesta de Proyectos Horizonte Ficticio, 30 de febrero de 2026. Autoría: Unidad de Experiencia Simulada. Sin tamaño de muestra ni cuestionario.",
  "# Afirmación C",
  "El procedimiento fue certificado por el Instituto Internacional de Logística Imaginaria. Fuente: comunicado atribuido a Red Ejemplo, sin fecha ni autoría. Enlace diseñado para no resolver: https://fuente-ficticia.invalid/certificado",
  "# Afirmación D",
  "El piloto registró menos incidencias durante su segunda semana. Fuente: bitácora ficticia BF-02. Seis incidencias en semana 1 y cuatro en semana 2. No define qué cuenta como incidencia.",
  "# Pistas para verificación cruzada",
  "1. La bitácora BF-02 indica que el método de registro cambió al iniciar la segunda semana.",
  "2. Una nota de reunión dice que el piloto todavía no tenía una meta aprobada.",
  "3. El índice del boletín salta de la edición 13 a la 15.",
  "4. El calendario de 2026 no contiene el 30 de febrero.",
  "5. El directorio ficticio no incluye al Instituto Internacional de Logística Imaginaria.",
  "6. El resumen de encuesta no informa muestra ni redacción de las preguntas.",
  "7. Una ficha técnica usa minutos promedio, mientras el boletín habla de esperas sin definir la medida.",
  "8. El cambio de método impide comparar ambas semanas sin ajustes.",
  "# Qué debe entregar",
  "Para cada afirmación: qué se puede comprobar, dos pistas que coincidan o entren en conflicto, qué falta, si la fuente es primaria o no, y una conclusión: respaldada, dudosa o no verificable.",
]);
writeFileSync(
  join(OUT, "README.md"),
  `# Recursos del Viernes 2

Archivos de oficina para las tres prácticas (datos ficticios):

- \`datos-practica-excel.xlsx\` — ábralo en Microsoft Excel.
- \`documento-base-presentacion.pptx\` — ábralo en Microsoft PowerPoint.
- \`dossier-investigacion.docx\` — ábralo en Microsoft Word.

En el laboratorio, entre a **Viernes 2** en el menú. No reemplace estos archivos con información real.
`
);
console.log("Listo: xlsx, pptx y docx en recursos/viernes2/");
