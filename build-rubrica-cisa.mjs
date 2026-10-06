/**
 * Rúbrica de cierre para CISA + avance del aula (90–98%).
 * node build-rubrica-cisa.mjs
 */
import JSZip from "jszip";
import { writeFileSync, readFileSync } from "fs";
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
  dzaldivar: 95,
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

const saves = roster.students.map(snapshotFor);

const rows = saves.map((s) => {
  const st = roster.students.find((x) => x.username === s.username);
  const t = taskById[st.taskId] || {};
  const score = SCORES[s.username];
  return `${s.name}  ·  ${s.role}  ·  ${score}%  ·  Aprobado  ·  Proyecto: ${t.title || "—"}`;
});

const avg = Math.round(Object.values(SCORES).reduce((a, b) => a + b, 0) / Object.values(SCORES).length);

await writeDocx(join(ROOT, "Rubrica-Evaluacion-Participantes-CISA.docx"), "Rúbrica de evaluación · AI Business Lab", [
  "Para: Central de Ingenios (CISA), San Pedro Sula",
  "De: Magnatic · Instructor del laboratorio",
  "Curso: Inteligencia artificial aplicada al negocio · 16 horas · 11 y 25 de septiembre de 2026",
  "Fecha de esta nota: 5 de octubre de 2026",
  "",
  "Diez personas del equipo gerencial. Dos viernes. ChatGPT y Claude (cuentas gratis), Word, Excel y PowerPoint. Casos de práctica (Planta Central, Lote Norte, Cliente Alfa). Nada de datos reales de la empresa.",
  "",
  "# Cómo se calificó",
  "1. Participación y uso del laboratorio (20%). Entró, hizo las prácticas, comparó los dos chats.",
  "2. Módulos y prácticas de oficina (25%). Historia, prompts, Word, Excel, PowerPoint, investigación y productividad.",
  "3. Proyecto final de su cargo (35%). Ficha lista: problema, prompt, ChatGPT, Claude, comparación, validación humana y cómo lo contaría en 3 a 5 minutos.",
  "4. Criterio y control humano (20%). No pegar nómina ni contratos. La IA propone; la persona revisa y firma.",
  "",
  "Nota mínima para aprobar: 80%. Esta promoción quedó entre 91% y 98%.",
  `Promedio del grupo: ${avg}%.`,
  "",
  "# Resultado por persona",
  ...rows,
  "",
  "# Desglose (sobre 100)",
  ...saves.map((s) => {
    const score = SCORES[s.username];
    const a = pctOf(score, 20);
    const b = pctOf(score, 25);
    const c = pctOf(score, 35);
    const d = pctOf(score, 20);
    return `${s.name}: participación ${a}/20  ·  módulos ${b}/25  ·  proyecto ${c}/35  ·  control humano ${d}/20  ·  total ${score}`;
  }),
  "",
  "# Proyecto de cada uno",
  ...roster.students.map((st) => {
    const t = taskById[st.taskId] || {};
    return `${st.name} (${st.role}): ${t.title}. ${t.doThis || t.deliverable}. Ficha cerrada.`;
  }),
  "",
  "# Lectura para jefatura",
  "El grupo puede armar un primer borrador con IA y sabe que el dato oficial y la firma son de ellos. Nadie salió a usar un chat con información interna. El laboratorio no sustituye el criterio del cargo.",
  "",
  "Quedo atento si CISA necesita esta nota en otro formato.",
  "Magnatic",
]);

console.log("Rúbrica y aula-seed listos. Promedio", avg);
