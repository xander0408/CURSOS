import { siteBase } from "./paths.js";

// Estado y persistencia del laboratorio.
// - Una clave de sesión (quién está dentro).
// - Un almacén por usuario (progreso de cada alumno en este navegador).
// - Migra versiones antiguas sin perder avance.

const SESSION_KEY = "aiBusinessLab.session";
const LEGACY_KEY = "aiBusinessLab.v1";
const KEY_PREFIX = "aiBusinessLab.user.";
const SCHEMA_VERSION = 3;

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
  profile: {
    displayName: "",
    email: "",
    username: "",
    role: "",
    loggedIn: false,
    isInstructor: false,
    introDone: false,
    assignedTaskId: "",
    knowUs: { years: "", pain: "", aiLevel: "", hope: "" },
    createdAt: Date.now(),
  },
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
    freeTiersAck: false,
    activity: [],
    updatedAt: 0,
  },
});

function migrate(saved) {
  const base = empty();
  if (!saved || typeof saved !== "object") return base;

  base.profile = { ...base.profile, ...(saved.profile || {}) };
  if (!base.profile.knowUs) base.profile.knowUs = empty().profile.knowUs;
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
  p.freeTiersAck = !!sp.freeTiersAck;
  p.activity = Array.isArray(sp.activity) ? sp.activity : [];
  p.updatedAt = Number(sp.updatedAt || 0);

  base.version = SCHEMA_VERSION;
  return base;
}

let storageOk = true;
let userId = "guest";
let state = empty();

function storageKey() {
  return KEY_PREFIX + userId;
}

let skipCloudOnce = false;

function persist() {
  try {
    if (!skipCloudOnce) {
      state.progress.updatedAt = Date.now();
    }
    localStorage.setItem(storageKey(), JSON.stringify(state));
    storageOk = true;
  } catch {
    storageOk = false;
  }
  try {
    const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (sess?.userId) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    }
  } catch {
    /* opcional */
  }
  if (!skipCloudOnce) {
    import("./sync.js")
      .then((m) => m.schedulePush())
      .catch(() => {});
  }
  skipCloudOnce = false;
}

export function replaceState(obj, { skipCloud = false } = {}) {
  skipCloudOnce = !!skipCloud;
  state = migrate(obj);
  persist();
  return state;
}

function cookiePath() {
  try {
    return siteBase();
  } catch {
    return "/";
  }
}

export function readSession() {
  try {
    const a = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (a?.userId) return a;
  } catch {
    /* seguir */
  }
  try {
    const b = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (b?.userId) return b;
  } catch {
    /* seguir */
  }
  try {
    const m = document.cookie.match(/(?:^|; )abl_session=([^;]*)/);
    const id = m ? decodeURIComponent(m[1]) : "";
    if (id) return { userId: id, at: Date.now() };
  } catch {
    /* seguir */
  }
  return null;
}

export function writeSession(sess) {
  const raw = JSON.stringify(sess);
  try {
    localStorage.setItem(SESSION_KEY, raw);
  } catch {
    storageOk = false;
  }
  try {
    sessionStorage.setItem(SESSION_KEY, raw);
  } catch {
    /* opcional */
  }
  try {
    if (sess?.userId) {
      document.cookie = `abl_session=${encodeURIComponent(sess.userId)}; path=${cookiePath()}; max-age=2592000; SameSite=Lax`;
    }
  } catch {
    /* opcional */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignorar */
  }
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignorar */
  }
  try {
    document.cookie = `abl_session=; path=${cookiePath()}; max-age=0`;
  } catch {
    /* ignorar */
  }
}

export function loadUser(id) {
  userId = id || "guest";
  try {
    const raw = localStorage.getItem(storageKey());
    if (raw) {
      state = migrate(JSON.parse(raw));
    } else {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        state = migrate(JSON.parse(legacy));
      } else {
        state = empty();
      }
    }
  } catch {
    storageOk = false;
    state = empty();
  }
  persist();
  return state;
}

export function storageWorks() {
  return storageOk;
}

export function getState() {
  return state;
}

export function update(mutator) {
  mutator(state);
  persist();
  return state;
}

export function resetAll() {
  const keep = {
    displayName: state.profile.displayName,
    email: state.profile.email,
    username: state.profile.username,
    role: state.profile.role,
    isInstructor: state.profile.isInstructor,
    assignedTaskId: state.profile.assignedTaskId,
    loggedIn: true,
  };
  state = empty();
  state.profile = { ...state.profile, ...keep, introDone: keep.isInstructor, createdAt: Date.now() };
  if (keep.isInstructor) {
    state.profile.introDone = true;
    state.progress.freeTiersAck = true;
    state.settings.instructorUnlocked = true;
  }
  persist();
  return state;
}

export function readModule(id) {
  return state.progress.modules[id] || emptyModule();
}

export function readChallenge(id) {
  return state.progress.challenges[id] || emptyChallenge();
}

export function getModule(id) {
  if (!state.progress.modules[id]) {
    state.progress.modules[id] = emptyModule();
    persist();
  }
  return state.progress.modules[id];
}

export function getChallenge(id) {
  if (!state.progress.challenges[id]) {
    state.progress.challenges[id] = emptyChallenge();
    persist();
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

export function exportState() {
  return JSON.parse(JSON.stringify(state));
}

export function importState(obj) {
  state = migrate(obj);
  persist();
  return state;
}

export function seedInstructorGuide(data) {
  if (!state.profile.isInstructor || !data?.course) return;
  update((s) => {
    s.profile.introDone = true;
    s.profile.knowUs = {
      years: "guía",
      pain: "Demostrar el laboratorio completo (todos los módulos y quizzes).",
      aiLevel: "diario",
      hope: "Cuenta guía al 100%.",
    };
    s.progress.freeTiersAck = true;
    s.settings.instructorUnlocked = true;
    let chN = 0;
    for (const m of data.course.modules) {
      const full = data.modules[m.id];
      if (!full) continue;
      if (!s.progress.modules[m.id]) s.progress.modules[m.id] = emptyModule();
      const st = s.progress.modules[m.id];
      st.lessonsDone = (full.lessons || []).map((l) => l.id);
      st.status = "done";
      st.score = 100;
      st.completedAt = Date.now();
      for (const ch of full.challenges || []) {
        if (!s.progress.challenges[ch.id]) s.progress.challenges[ch.id] = emptyChallenge();
        const c = s.progress.challenges[ch.id];
        c.status = "done";
        c.score = 100;
        c.attempts = Math.max(1, c.attempts || 0);
        c.answers = c.answers || { complete: true, notes: "Guía instructor" };
        chN += 1;
      }
    }
    s.progress.totals.modulesCompleted = data.course.modules.length;
    s.progress.totals.challengesCompleted = chN;
    s.progress.totals.xp = Math.max(s.progress.totals.xp || 0, 900);
    if (!s.progress.quizzes.bestScores) s.progress.quizzes.bestScores = {};
    for (const q of data.quizzes || []) {
      s.progress.quizzes.bestScores[q.id] = {
        score: (q.questions || []).length * 100,
        correct: (q.questions || []).length,
        totalQuestions: (q.questions || []).length,
        at: Date.now(),
      };
    }
    for (const b of data.badges || []) {
      s.progress.badges[b.id] = { earnedAt: Date.now() };
    }
    s.progress.project.ficheReady = true;
    s.progress.project.step = 11;
    s.progress.project.fields = {
      problem: "Retraso de despacho en Planta Norte (caso guía).",
      today: "Se arma a mano entre correos.",
      aiPart: "Borrador de correo y de 6 slides.",
      humanPart: "Cifras oficiales y autorización del 10%.",
    };
    s.progress.labs = s.progress.labs || {};
    s.progress.labs.checks = s.progress.labs.checks || {};
    for (const it of data.activities?.items || []) {
      s.progress.labs.checks[it.id] = true;
    }
    const tpls = data.library?.templates || [];
    s.progress.library.savedIds = tpls.slice(0, 4).map((t) => t.id);
    s.progress.comparator.caseId = "cmp-email";
    s.progress.comparator.winner = "tie";
    s.progress.comparator.why = "Guía: queja — Claude más cauto; Excel — ChatGPT más claro. No hay ganador mundial.";
  });
}

export function logActivity(kind, detail) {
  update((s) => {
    s.progress.activity = s.progress.activity || [];
    s.progress.activity.push({
      at: Date.now(),
      kind: String(kind || "evento"),
      detail: String(detail || "").slice(0, 240),
    });
    if (s.progress.activity.length > 100) {
      s.progress.activity = s.progress.activity.slice(-100);
    }
  });
}

export function listLocalStudentSaves() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(KEY_PREFIX)) continue;
      const id = k.slice(KEY_PREFIX.length);
      if (!id || id === "guest") continue;
      let parsed = {};
      try {
        parsed = JSON.parse(localStorage.getItem(k) || "{}");
      } catch {
        parsed = {};
      }
      const act = parsed.progress?.activity || [];
      out.push({
        id,
        name: parsed.profile?.displayName || id,
        role: parsed.profile?.role || "",
        modules: parsed.progress?.totals?.modulesCompleted || 0,
        xp: parsed.progress?.totals?.xp || 0,
        activity: act,
        last: act.length ? act[act.length - 1].at : parsed.profile?.createdAt || 0,
      });
    }
  } catch {
    /* ignorar */
  }
  return out.sort((a, b) => (b.last || 0) - (a.last || 0));
}

export function resetLocalUser(id) {
  const uid = String(id || "");
  if (!uid) return;
  try {
    localStorage.removeItem(KEY_PREFIX + uid);
  } catch {
    /* ignorar */
  }
  if (userId === uid) resetAll();
}
