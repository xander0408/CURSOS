function chatIds() {
  return ["chat-1", "chat-2", "chat-3", "chat-4", "chat-5", "chat-6", "chat-7", "chat-8", "chat-9"];
}

function asObject(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function collectedFromState(st) {
  const p = st?.progress || {};
  const quizzes = asObject(p.quizzes?.bestScores);
  const cmp = asObject(p.comparator);
  const ku = asObject(st?.profile?.knowUs);
  const proj = asObject(p.project);
  const draft = Array.isArray(p.promptLab?.drafts) ? p.promptLab.drafts[0] : null;
  const checks = asObject(p.labs?.checks);
  return {
    logs: Array.isArray(p.activity) ? p.activity.slice() : [],
    prompts: (p.library?.custom || []).map((t) => ({
      id: t.id || "",
      title: String(t.title || "Prompt"),
      text: String(t.text || ""),
      source: String(t.source || ""),
      savedAt: Number(t.savedAt || 0),
    })),
    librarySavedIds: Array.isArray(p.library?.savedIds) ? p.library.savedIds.slice() : [],
    quizScores: Object.entries(quizzes).map(([id, q]) => ({
      id,
      score: Number(q?.score || 0),
      correct: Number(q?.correct || 0),
      totalQuestions: Number(q?.totalQuestions || 0),
      at: Number(q?.at || 0),
    })),
    challenges: Object.entries(asObject(p.challenges)).map(([id, c]) => ({
      id,
      status: c?.status || "open",
      score: Number(c?.score || 0),
      attempts: Number(c?.attempts || 0),
      answers: c?.answers ?? null,
    })),
    labChecks: Object.keys(checks).filter((id) => checks[id]),
    badgesList: Object.keys(asObject(p.badges)),
    project: {
      ficheReady: !!proj.ficheReady,
      step: Number(proj.step || 0),
      fields: asObject(proj.fields),
    },
    knowUs: {
      years: String(ku.years || ""),
      pain: String(ku.pain || ""),
      aiLevel: String(ku.aiLevel || ""),
      hope: String(ku.hope || ""),
    },
    promptDraft: draft && typeof draft === "object" ? draft : {},
    comparatorNotes: {
      caseId: String(cmp.caseId || ""),
      winner: String(cmp.winner || ""),
      why: String(cmp.why || ""),
      chatgptNotes: String(cmp.chatgptNotes || ""),
      claudeNotes: String(cmp.claudeNotes || ""),
      customPrompt: String(cmp.customPrompt || ""),
    },
  };
}

export function snapshotFromState(st, username) {
  const p = st?.progress || {};
  const mods = p.modules || {};
  const checks = p.labs?.checks || {};
  const badges = p.badges || {};
  const quizzes = p.quizzes?.bestScores || {};
  const qList = Object.values(quizzes);
  const qn = qList.length;
  const qavg = qn
    ? Math.round(
        qList.reduce((a, q) => a + ((q.correct || 0) / Math.max(q.totalQuestions || 1, 1)) * 100, 0) / qn
      )
    : 0;
  const cmp = p.comparator || {};
  const moduleMap = {};
  for (const [id, m] of Object.entries(mods)) {
    moduleMap[id] = {
      status: m.status || "open",
      score: Number(m.score || 0),
      lessonsDone: Array.isArray(m.lessonsDone) ? m.lessonsDone.slice() : [],
      completedAt: m.completedAt || null,
    };
  }
  return {
    username: username || st?.profile?.username || "",
    name: st?.profile?.displayName || username || "Alumno",
    role: st?.profile?.role || "",
    intro: !!st?.profile?.introDone,
    modules: Number(p.totals?.modulesCompleted || Object.values(mods).filter((m) => m.status === "done").length),
    xp: Number(p.totals?.xp || 0),
    fiche: !!p.project?.ficheReady,
    chatDone: chatIds().filter((id) => checks[id]).length,
    chatTotal: chatIds().length,
    ownPrompts: (p.library?.custom || []).length,
    badges: Object.keys(badges).length,
    quizzes: qn,
    quizAvg: qavg,
    comparator: {
      caseId: cmp.caseId || "",
      winner: cmp.winner || "",
      gptChars: String(cmp.chatgptNotes || "").trim().length,
      claudeChars: String(cmp.claudeNotes || "").trim().length,
    },
    moduleMap,
    updatedAt: Number(p.updatedAt || 0),
    ...collectedFromState(st),
  };
}

function arrLen(a) {
  return Array.isArray(a) ? a.length : 0;
}

function textLen(v) {
  return String(v || "").trim().length;
}

export function mergeTwoSaves(a, b) {
  if (!a) return b;
  if (!b) return a;
  const newer = (Number(a.updatedAt) || 0) >= (Number(b.updatedAt) || 0) ? a : b;
  const older = newer === a ? b : a;
  const takeArr = (k) => (arrLen(newer[k]) >= arrLen(older[k]) ? newer[k] || [] : older[k] || []);
  const knowNewer = newer.knowUs || {};
  const knowOlder = older.knowUs || {};
  const knowUs = Object.values(knowNewer).some((v) => String(v || "").trim()) ? knowNewer : knowOlder;
  const fieldsN = newer.project?.fields || {};
  const fieldsO = older.project?.fields || {};
  const comparatorNotes = {
    ...(older.comparatorNotes || {}),
    ...(newer.comparatorNotes || {}),
    chatgptNotes:
      textLen(newer.comparatorNotes?.chatgptNotes) >= textLen(older.comparatorNotes?.chatgptNotes)
        ? newer.comparatorNotes?.chatgptNotes || ""
        : older.comparatorNotes?.chatgptNotes || "",
    claudeNotes:
      textLen(newer.comparatorNotes?.claudeNotes) >= textLen(older.comparatorNotes?.claudeNotes)
        ? newer.comparatorNotes?.claudeNotes || ""
        : older.comparatorNotes?.claudeNotes || "",
    why:
      textLen(newer.comparatorNotes?.why) >= textLen(older.comparatorNotes?.why)
        ? newer.comparatorNotes?.why || ""
        : older.comparatorNotes?.why || "",
    customPrompt:
      textLen(newer.comparatorNotes?.customPrompt) >= textLen(older.comparatorNotes?.customPrompt)
        ? newer.comparatorNotes?.customPrompt || ""
        : older.comparatorNotes?.customPrompt || "",
  };
  const draftN = newer.promptDraft && Object.keys(newer.promptDraft).length ? newer.promptDraft : null;
  return {
    ...older,
    ...newer,
    logs: takeArr("logs"),
    prompts: takeArr("prompts"),
    quizScores: takeArr("quizScores"),
    challenges: takeArr("challenges"),
    labChecks: [...new Set([...(older.labChecks || []), ...(newer.labChecks || [])])],
    badgesList: [...new Set([...(older.badgesList || []), ...(newer.badgesList || [])])],
    librarySavedIds: [...new Set([...(older.librarySavedIds || []), ...(newer.librarySavedIds || [])])],
    knowUs,
    project: {
      ficheReady: !!(newer.project?.ficheReady || older.project?.ficheReady),
      step: Math.max(Number(newer.project?.step || 0), Number(older.project?.step || 0)),
      fields: { ...fieldsO, ...fieldsN },
    },
    comparatorNotes,
    promptDraft: draftN || older.promptDraft || {},
    moduleMap: { ...(older.moduleMap || {}), ...(newer.moduleMap || {}) },
  };
}

export function mergeRosterSaves(rosterStudents, saves) {
  const byUser = new Map();
  for (const s of saves || []) {
    const u = String(s.username || "").toLowerCase();
    if (!u || u === "__clock" || u === "instructor") continue;
    const prev = byUser.get(u);
    byUser.set(u, prev ? mergeTwoSaves(prev, s) : s);
  }
  const rostered = new Set();
  const rows = (rosterStudents || []).map((r) => {
    const key = String(r.username || "").toLowerCase();
    rostered.add(key);
    const hit = byUser.get(key);
    if (hit) {
      return {
        ...hit,
        name: hit.name || r.name,
        role: hit.role || r.role,
        username: r.username,
      };
    }
    return {
      username: r.username,
      name: r.name,
      role: r.role,
      updatedAt: 0,
      modules: 0,
      xp: 0,
      fiche: false,
      chatDone: 0,
      chatTotal: 9,
      ownPrompts: 0,
      badges: 0,
      quizzes: 0,
      quizAvg: 0,
      comparator: { caseId: "", winner: "", gptChars: 0, claudeChars: 0 },
      intro: false,
      moduleMap: {},
      pending: true,
      logs: [],
      prompts: [],
      quizScores: [],
      challenges: [],
      labChecks: [],
      badgesList: [],
      project: { ficheReady: false, step: 0, fields: {} },
      knowUs: { years: "", pain: "", aiLevel: "", hope: "" },
      comparatorNotes: {},
      promptDraft: {},
    };
  });
  for (const [key, s] of byUser) {
    if (!rostered.has(key)) rows.push(s);
  }
  return rows;
}

export function shortName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "Alumno";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}
