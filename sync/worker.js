/** API de avances (Cloudflare Worker + D1). GitHub Pages no puede guardar SQL. */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (!env.DB) return json({ error: "Sin base D1" }, 500);

    const data = await roster(env);
    if (!data) return json({ error: "No se pudo leer la lista de aula" }, 502);

    if (path === "/v1/save" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const acc = accountOf(data, body.username, body.password);
      if (!acc) return json({ error: "Usuario o contraseña" }, 401);
      const uid = acc.username;
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
      const saves = (results || []).map((r) => {
        let st = {};
        try {
          st = JSON.parse(r.payload);
        } catch {
          st = {};
        }
        return {
          username: r.username,
          updatedAt: r.updated_at,
          name: st.profile?.displayName || r.username,
          role: st.profile?.role || "",
          modules: st.progress?.totals?.modulesCompleted || 0,
          xp: st.progress?.totals?.xp || 0,
          fiche: !!st.progress?.project?.ficheReady,
        };
      });
      return json({ saves });
    }

    return json({ error: "Ruta no encontrada", hint: "POST /v1/save  GET /v1/load  GET /v1/admin" }, 404);
  },
};
