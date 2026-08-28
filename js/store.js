const KEY = "aiBusinessLab.v1";

const empty = () => ({
  version: 1,
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

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (data.version !== 1) return empty();
    return data;
  } catch {
    return empty();
  }
}

let state = load();

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
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
  save();
  return state;
}

export function getModule(id) {
  if (!state.progress.modules[id]) {
    state.progress.modules[id] = {
      status: "in_progress",
      lessonsDone: [],
      score: 0,
      completedAt: null,
    };
  }
  return state.progress.modules[id];
}

export function getChallenge(id) {
  if (!state.progress.challenges[id]) {
    state.progress.challenges[id] = {
      status: "open",
      attempts: 0,
      score: 0,
      answers: null,
      feedbackSeenAt: null,
    };
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
