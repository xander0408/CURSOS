// Estado y persistencia del laboratorio.
// - Guarda en localStorage en cada cambio.
// - Migra versiones antiguas sin perder el progreso del alumno.
// - Las lecturas (readModule/readChallenge) NO mutan el estado.
// - Si localStorage no esta disponible, la app sigue funcionando en memoria
//   y expone storageWorks() para avisar al usuario.

const KEY = "aiBusinessLab.v1";
const SCHEMA_VERSION = 2;

const emptyModule = () => ({
  status: "in_progress",
  lessonsDone: [],
  score: 0,
  completedAt: null,
});

const emptyChallenge = () => ({
  status: "open",
  attempts: 0,
  score: 0,
  answers: null,
  feedbackSeenAt: null,
});

const empty = () => ({
  version: SCHEMA_VERSION,
  profile: { displayName: "", createdAt: Date.now() },
  settings: { instructorUnlocked: false },
  progress: {
    modules: {},
    challenges: {},
    comparator: {
      caseId: "",
      chatgptNotes: "",
      claudeNotes: "",
      scoresGpt: {},
      scoresClaude: {},
      winner: "",
      why: "",
    },
    promptLab: { drafts: [], savedPrompts: [] },
    library: { savedIds: [], custom: [] },
    project: { step: 0, fields: {}, ficheReady: false },
    quizzes: { bestScores: {} },
    badges: {},
    totals: { xp: 0, challengesCompleted: 0, modulesCompleted: 0 },
    labs: {},
  },
});

// Combina el estado guardado con la forma vacia, para que si el esquema
// crece (nuevas claves) el progreso viejo se conserve y solo se rellenen
// las claves faltantes. Es una fusion superficial por seccion conocida.
function migrate(saved) {
  const base = empty();
  if (!saved || typeof saved !== "object") return base;

  base.profile = { ...base.profile, ...(saved.profile || {}) };
  base.settings = { ...base.settings, ...(saved.settings || {}) };

  const sp = saved.progress || {};
  const p = base.progress;
  p.modules = sp.modules || {};
  p.challenges = sp.challenges || {};
  p.comparator = { ...p.comparator, ...(sp.comparator || {}) };
  p.promptLab = { ...p.promptLab, ...(sp.promptLab || {}) };
  p.library = { ...p.library, ...(sp.library || {}) };
  p.project = { ...p.project, ...(sp.project || {}) };
  p.quizzes = { ...p.quizzes, ...(sp.quizzes || {}) };
  if (p.quizzes.bestScores == null) p.quizzes.bestScores = {};
  p.badges = sp.badges || {};
  p.totals = { ...p.totals, ...(sp.totals || {}) };
  p.labs = sp.labs || {};

  base.version = SCHEMA_VERSION;
  return base;
}

let storageOk = true;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    // Cualquier version se migra en vez de descartarse.
    return migrate(data);
  } catch {
    storageOk = false;
    return empty();
  }
}

let state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    storageOk = true;
  } catch {
    // Cuota llena o almacenamiento bloqueado (modo incognito estricto).
    storageOk = false;
  }
}

// Persistimos una vez al cargar para normalizar el esquema migrado.
save();

export function storageWorks() {
  return storageOk;
}

export function getState() {
  return state;
}

export function update(mutator) {
  mutator(state);
  save();
  return state;
}

export function resetAll() {
  state = empty();
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignorar */
  }
  save();
  return state;
}

// --- Lecturas sin mutar (para render y calculos de progreso) ---
export function readModule(id) {
  return state.progress.modules[id] || emptyModule();
}

export function readChallenge(id) {
  return state.progress.challenges[id] || emptyChallenge();
}

// --- Accesos que SI crean/persisten la entrada (para escritura) ---
export function getModule(id) {
  if (!state.progress.modules[id]) {
    state.progress.modules[id] = emptyModule();
    save();
  }
  return state.progress.modules[id];
}

export function getChallenge(id) {
  if (!state.progress.challenges[id]) {
    state.progress.challenges[id] = emptyChallenge();
    save();
  }
  return state.progress.challenges[id];
}

export function markLessonDone(moduleId, lessonId) {
  update(() => {
    const m = getModule(moduleId);
    if (!m.lessonsDone.includes(lessonId)) m.lessonsDone.push(lessonId);
  });
}

export function saveChallengeResult(id, { score, answers, xpDelta, completed }) {
  update((s) => {
    const c = getChallenge(id);
    c.attempts += 1;
    c.score = score;
    c.answers = answers;
    c.feedbackSeenAt = Date.now();
    c.status = completed ? "done" : "open";
    if (xpDelta) s.progress.totals.xp += xpDelta;
  });
  recountChallenges();
}

export function completeModule(moduleId, score) {
  update((s) => {
    const m = getModule(moduleId);
    const wasDone = m.status === "done";
    m.status = "done";
    m.score = score;
    m.completedAt = Date.now();
    if (!wasDone) s.progress.totals.modulesCompleted += 1;
  });
}

export function recountChallenges() {
  update((s) => {
    s.progress.totals.challengesCompleted = Object.values(s.progress.challenges).filter(
      (c) => c.status === "done"
    ).length;
  });
}

// Exporta el estado como objeto (para descargar respaldo).
export function exportState() {
  return JSON.parse(JSON.stringify(state));
}

// Importa un respaldo previamente exportado, migrandolo por seguridad.
export function importState(obj) {
  state = migrate(obj);
  save();
  return state;
}
