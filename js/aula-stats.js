function chatIds() {
  return ["chat-1", "chat-2", "chat-3", "chat-4", "chat-5", "chat-6", "chat-7", "chat-8", "chat-9"];
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
    moduleMap[id] = { status: m.status || "open", score: Number(m.score || 0) };
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
  };
}

export function mergeRosterSaves(rosterStudents, saves) {
  const byUser = new Map();
  for (const s of saves || []) {
    const u = String(s.username || "").toLowerCase();
    if (!u || u === "__clock" || u === "instructor") continue;
    byUser.set(u, s);
  }
  return (rosterStudents || []).map((r) => {
    const hit = byUser.get(String(r.username || "").toLowerCase());
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
      badges: 0,
      quizzes: 0,
      quizAvg: 0,
      comparator: { caseId: "", winner: "", gptChars: 0, claudeChars: 0 },
      intro: false,
      moduleMap: {},
      pending: true,
    };
  });
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
