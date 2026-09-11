/** API de avances (Cloudflare Worker + D1). GitHub Pages no puede guardar SQL. */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CLOCK_USER = "__clock";
const CHAT_IDS = ["chat-1", "chat-2", "chat-3", "chat-4", "chat-5", "chat-6", "chat-7", "chat-8", "chat-9"];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

async function roster(env) {
  const url = env.ROSTER_URL;
  if (!url) return null;
  const res = await fetch(url, { cf: { cacheTtl: 120 } });
  if (!res.ok) return null;
  return res.json();
}

function accountOf(data, username, password) {
  const u = String(username || "").trim().toLowerCase();
  const p = String(password || "");
  const inst = data.instructor;
  if (inst && String(inst.username || "").toLowerCase() === u && inst.password === p) {
    return { ...inst, isInstructor: true };
  }
  const st = (data.students || []).find((s) => String(s.username || "").toLowerCase() === u && s.password === p);
  return st || null;
}

function snapshot(st, username) {
  const p = st?.progress || {};
  const mods = p.modules || {};
  const checks = p.labs?.checks || {};
  const badges = p.badges || {};
  const quizzes = p.quizzes?.bestScores || {};
  const qList = Object.values(quizzes);
  const qn = qList.length;
  const qavg = qn
    ? Math.round(qList.reduce((a, q) => a + ((q.correct || 0) / Math.max(q.totalQuestions || 1, 1)) * 100, 0) / qn)
    : 0;
  const cmp = p.comparator || {};
  const moduleMap = {};
  for (const [id, m] of Object.entries(mods)) {
    moduleMap[id] = { status: m.status || "open", score: Number(m.score || 0) };
  }
  return {
    username,
    updatedAt: Number(p.updatedAt || 0),
    name: st?.profile?.displayName || username,
    role: st?.profile?.role || "",
    intro: !!st?.profile?.introDone,
    modules: Number(p.totals?.modulesCompleted || Object.values(mods).filter((m) => m.status === "done").length),
    xp: Number(p.totals?.xp || 0),
    fiche: !!p.project?.ficheReady,
    chatDone: CHAT_IDS.filter((id) => checks[id]).length,
    chatTotal: CHAT_IDS.length,
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
  };
}

async function readClock(env) {
  const row = await env.DB.prepare("SELECT payload FROM saves WHERE username = ?1").bind(CLOCK_USER).first();
  if (!row?.payload) return { running: false, endsAt: 0, label: "", minutes: 0 };
  try {
    return JSON.parse(row.payload);
  } catch {
    return { running: false, endsAt: 0, label: "", minutes: 0 };
  }
}

async function writeClock(env, clock) {
  const updatedAt = Date.now();
  await env.DB.prepare(
    "INSERT INTO saves (username, payload, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(username) DO UPDATE SET payload = ?2, updated_at = ?3"
  )
    .bind(CLOCK_USER, JSON.stringify(clock), updatedAt)
    .run();
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (!env.DB) return json({ error: "Sin base D1" }, 500);

    if (path === "/v1/clock" && request.method === "GET") {
      return json(await readClock(env));
    }

    const data = await roster(env);
    if (!data) return json({ error: "No se pudo leer la lista de aula" }, 502);

    if (path === "/v1/clock" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const acc = accountOf(data, body.username, body.password);
      if (!acc || !acc.isInstructor) return json({ error: "Solo instructor" }, 403);
      const action = body.action === "stop" ? "stop" : "start";
      const minutes = Math.max(1, Math.min(180, Number(body.minutes) || 10));
      const label = String(body.label || "Actividad").slice(0, 40);
      const now = Date.now();
      const clock =
        action === "stop"
          ? { running: false, endsAt: 0, label, minutes, startedAt: now }
          : { running: true, minutes, label, startedAt: now, endsAt: now + minutes * 60 * 1000 };
      await writeClock(env, clock);
      return json({ ok: true, clock });
    }

    if (path === "/v1/save" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const acc = accountOf(data, body.username, body.password);
      if (!acc) return json({ error: "Usuario o contraseña" }, 401);
      const uid = acc.username;
      if (uid === CLOCK_USER) return json({ error: "Reservado" }, 400);
      const state = body.state;
      if (!state || typeof state !== "object") return json({ error: "Sin estado" }, 400);
      const updatedAt = Number(state.progress?.updatedAt || Date.now());
      await env.DB.prepare(
        "INSERT INTO saves (username, payload, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(username) DO UPDATE SET payload = ?2, updated_at = ?3"
      )
        .bind(uid, JSON.stringify(state), updatedAt)
        .run();
      return json({ ok: true, updatedAt });
    }

    if (path === "/v1/load" && request.method === "GET") {
      const acc = accountOf(data, url.searchParams.get("username"), url.searchParams.get("password"));
      if (!acc) return json({ error: "Usuario o contraseña" }, 401);
      const row = await env.DB.prepare("SELECT payload, updated_at FROM saves WHERE username = ?1")
        .bind(acc.username)
        .first();
      if (!row) return json({ state: null });
      return json({ state: JSON.parse(row.payload), updatedAt: row.updated_at });
    }

    if (path === "/v1/admin" && request.method === "GET") {
      const acc = accountOf(data, url.searchParams.get("username"), url.searchParams.get("password"));
      if (!acc || !acc.isInstructor) return json({ error: "Solo instructor" }, 403);
      const { results } = await env.DB.prepare("SELECT username, updated_at, payload FROM saves ORDER BY updated_at DESC").all();
      const saves = (results || [])
        .filter((r) => r.username !== CLOCK_USER)
        .map((r) => {
          let st = {};
          try {
            st = JSON.parse(r.payload);
          } catch {
            st = {};
          }
          const snap = snapshot(st, r.username);
          snap.updatedAt = Number(r.updated_at || snap.updatedAt || 0);
          return snap;
        });
      return json({ saves });
    }

    return json({ error: "Ruta no encontrada", hint: "POST /v1/save  GET /v1/load  GET /v1/admin  GET|POST /v1/clock" }, 404);
  },
};
