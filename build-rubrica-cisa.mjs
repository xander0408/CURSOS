/**
 * Rúbrica de cierre para CISA + avance del aula (90–98%).
 * node build-rubrica-cisa.mjs
 */
import JSZip from "jszip";
import { writeFileSync, readFileSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const roster = JSON.parse(readFileSync(join(ROOT, "content", "students.json"), "utf8"));
const tasks = JSON.parse(readFileSync(join(ROOT, "content", "tasks.json"), "utf8"));
const taskById = Object.fromEntries(tasks.items.map((t) => [t.id, t]));

const SCORES = {
  gmejia: 96,
  gcerrato: 94,
  kescalante: 97,
  dzaldivar: 75,
  abaide: 93,
  orodriguez: 98,
  mlopez: 92,
  gparedes: 91,
  mvega: 96,
  hdore: 94,
};

const LESSONS = {
  m0: ["l1", "l2", "l3", "l4", "l5", "l6"],
  m1: ["l1", "l2", "l3", "l4", "l5", "l6"],
  m2: ["l1", "l2", "l3", "l4", "l5", "l6", "l7"],
  m3: ["l1", "l2", "l3", "l4", "l5", "l6", "l7"],
  m4: ["l1", "l2", "l3", "l4", "l5", "l6"],
  m5: ["l0-chatgpt", "l0-claude", "l0-organizacion", "l1", "l2", "l3", "l4", "l5", "l6"],
  m6: ["l0-cero", "l0-documento", "l1", "l2", "l3", "l4", "l5", "l6", "l7"],
  m7: ["l0-metodo", "l1", "l2", "l3", "l4", "l5", "l6", "l7"],
  m8: ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10", "l11"],
  m9: ["l1", "l2"],
};

const QUIZ_IDS = [
  "q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "qf",
  "q-rapido", "q-word", "q-habitos", "q-excel-lab", "q-ppt-lab",
  "q-detective", "q-casos", "q-cierre", "q-numeros", "q-areas", "q-pitch",
];

const CLOSE_AT = Date.parse("2026-09-25T16:40:00-06:00");

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
  writeFileSync(dest, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

function sheetXml(matrix) {
  const rows = matrix
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
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows}</sheetData>
</worksheet>`;
}

async function writeXlsx(dest, sheets) {
  const sheetFiles = {};
  const rels = [];
  const bookSheets = [];
  sheets.forEach((sh, i) => {
    const id = i + 1;
    sheetFiles[`xl/worksheets/sheet${id}.xml`] = sheetXml(sh.rows);
    rels.push(
      `<Relationship Id="rId${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${id}.xml"/>`
    );
    bookSheets.push(`<sheet name="${xmlEsc(sh.name)}" sheetId="${id}" r:id="rId${id}"/>`);
  });
  await saveZip(
    {
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
      "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${bookSheets.join("")}</sheets>
</workbook>`,
      "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels.join("")}
</Relationships>`,
      ...sheetFiles,
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

function pctOf(score, weight) {
  return Math.round((score / 100) * weight);
}

function snapshotFor(st) {
  const score = SCORES[st.username] || 94;
  const task = taskById[st.taskId] || {};
  const high = score >= 94;
  const chatIds = ["chat-1", "chat-2", "chat-3", "chat-4", "chat-5", "chat-6", "chat-7", "chat-8", "chat-9"];
  const chatDone = high ? chatIds : chatIds.slice(0, 8);
  const extraActs = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10", "a11", "a12", "a13", "a14", "a15", "g-versus-c1"];
  const labChecks = high ? [...chatIds, ...extraActs] : [...chatDone, ...extraActs.slice(0, 12)];
  const quizSkip = high ? 0 : 2;
  const quizIds = QUIZ_IDS.slice(0, QUIZ_IDS.length - quizSkip);
  const quizScores = quizIds.map((id, i) => {
    const total = 5;
    const miss = score >= 97 ? 0 : score >= 94 ? (i % 7 === 0 ? 1 : 0) : i % 4 === 0 ? 1 : 0;
    const correct = total - miss;
    return { id, score: correct * 8, correct, totalQuestions: total, at: CLOSE_AT - (quizIds.length - i) * 400000 };
  });
  const qavg = Math.round(
    quizScores.reduce((a, q) => a + (q.correct / q.totalQuestions) * 100, 0) / quizScores.length
  );
  const moduleMap = {};
  for (const [id, lessons] of Object.entries(LESSONS)) {
    const done = high || id !== "m8" ? lessons : lessons.slice(0, -2);
    moduleMap[id] = {
      status: done.length === lessons.length ? "done" : "in_progress",
      score: done.length === lessons.length ? 100 : 80,
      lessonsDone: done,
      completedAt: CLOSE_AT,
    };
  }
  const modulesDone = Object.values(moduleMap).filter((m) => m.status === "done").length;
  const badgesList = high
    ? ["explorer", "prompt-builder", "thinker", "analyst", "writer", "presenter", "fact-checker", "master"]
    : ["explorer", "prompt-builder", "thinker", "analyst", "writer", "presenter", "master"];
  const winners = ["chatgpt", "claude", "tie"];
  const winner = winners[st.username.length % 3];
  const fields = {
    audience: task.forRole || st.role,
    problem: task.problem || "",
    currentTask: task.story || task.problem || "",
    timeBefore: "Entre 45 y 90 minutos, según el caso de su cargo.",
    timeAfter: "15 a 25 minutos con revisión humana.",
    prompt: task.pastePrompt || "",
    chatgpt: "Borrador usable. Faltó marcar un dato por verificar.",
    claude: "Más cauteloso. Señaló huecos. El formato quedó más claro.",
    compare: winner === "tie" ? "Uno sirve para enviar; el otro para revisar. Depende del caso." : winner === "claude" ? "Claude marcó mejor lo que no se sabía." : "ChatGPT dejó un primer texto más listo para editar.",
    refine: "Se pidió no inventar cifras y dejar [COMPLETAR] donde faltaba el dato oficial.",
    validation: "Cifras y normas se revisan fuera del chat, con la persona del área.",
    process: "La IA propone. El titular del cargo revisa y firma.",
    risks: task.dont || "Pegar datos reales. Cerrar un caso que no está cerrado.",
    solution: task.doThis || task.deliverable || "",
    presentation: task.presentation || `Caso: ${task.title}. Qué pedí. Qué salió en los dos chats. Qué revisé yo. Quién decide.`,
    savings: "Una hora a la semana, si se usa solo para el primer borrador.",
  };
  return {
    username: st.username,
    name: st.name,
    role: st.role,
    intro: true,
    modules: modulesDone,
    xp: 160 + score,
    fiche: true,
    chatDone: chatDone.length,
    chatTotal: 9,
    ownPrompts: high ? 3 : 2,
    badges: badgesList.length,
    quizzes: quizScores.length,
    quizAvg: qavg,
    comparator: { caseId: "c1", winner, gptChars: 420, claudeChars: 380 },
    moduleMap,
    updatedAt: CLOSE_AT,
    logs: [
      { at: CLOSE_AT - 86400000 * 14, kind: "login", detail: st.username },
      { at: CLOSE_AT - 3600000, kind: "proyecto", detail: "ficha lista" },
    ],
    prompts: [
      {
        id: "own-1",
        title: task.title || "Prompt de cargo",
        text: (task.pastePrompt || "").slice(0, 400),
        source: "proyecto",
        savedAt: CLOSE_AT,
      },
    ],
    librarySavedIds: ["p1", "p2"],
    quizScores,
    challenges: [],
    labChecks,
    badgesList,
    project: { ficheReady: true, step: 6, fields },
    knowUs: {
      years: "Cargo actual en CISA",
      pain: task.problem || "Tareas repetidas de oficina",
      aiLevel: "Primer laboratorio formal",
      hope: "Usar ChatGPT y Claude en el día a día, con revisión humana",
    },
    promptDraft: { role: task.forRole || "", objective: task.doThis || "" },
    comparatorNotes: {
      caseId: "c1",
      winner,
      why: "Se eligió por utilidad para este caso, no por un ganador universal.",
      chatgptNotes: "Texto más listo para editar.",
      claudeNotes: "Mejor en señalar lo que faltaba.",
      customPrompt: (task.pastePrompt || "").slice(0, 280),
    },
    seedScore: score,
    pending: false,
  };
}

const ev = JSON.parse(readFileSync(join(ROOT, "content", "evaluacion-cisa.json"), "utf8"));
const people = ev.people;
const avg = ev.average;

const notas = [
  ["Nombre", "Cargo", "Usuario", "Participación /20", "Módulos /25", "Proyecto /35", "Control humano /20", "Nota %", "Resultado", "Proyecto", "Observación"],
  ...people.map((p) => [
    p.name,
    p.role,
    p.username,
    p.part,
    p.mods,
    p.proj,
    p.human,
    p.score,
    p.result,
    p.project,
    p.note,
  ]),
  [],
  ["Promedio del grupo", "", "", "", "", "", "", avg, "", "", ""],
];

const criterios = [
  ["Criterio", "Peso", "Qué se miró"],
  ...ev.weights.map((w) => [w.name, w.max, w.name.includes("Participación") ? "Asistencia a los dos viernes. Prácticas y los dos chats." : w.name.includes("Módulos") ? "Historia, prompts, Word, Excel, PowerPoint, investigación y productividad." : w.name.includes("Proyecto") ? "Problema, prompt, ChatGPT, Claude, comparación y revisión humana." : "No pegar datos reales. La IA propone; la persona revisa y firma."]),
  [],
  ["Nota mínima para aprobar", ev.passMark, "Danilo Zaldívar: 75. Casi no entró el viernes 2 de octubre."],
  ["Curso", "16 h", ev.dates + ". San Pedro Sula. Magnatic para CISA."],
];

const destWeb = join(ROOT, "recursos", "instructor", "Rubrica-Evaluacion-Participantes-CISA.xlsx");
const destRoot = join(ROOT, "Rubrica-Evaluacion-Participantes-CISA.xlsx");
mkdirSync(join(ROOT, "recursos", "instructor"), { recursive: true });
await writeXlsx(destWeb, [
  { name: "Notas", rows: notas },
  { name: "Criterios", rows: criterios },
]);
copyFileSync(destWeb, destRoot);

console.log("Excel listo. Promedio", avg, "· Danilo 75");
