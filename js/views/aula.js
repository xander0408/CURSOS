import { getState, listLocalStudentSaves, resetLocalUser, logActivity } from "../store.js";
import { escapeHtml, toast } from "../ui.js";
import { fetchAdminSaves, syncEnabled } from "../sync.js";
import { mergeRosterSaves, shortName, snapshotFromState } from "../aula-stats.js";
import { bindInstructorClock } from "../clock.js";

function localSnapshots() {
  const out = [];
  for (const u of listLocalStudentSaves()) {
    try {
      const raw = JSON.parse(localStorage.getItem("aiBusinessLab.user." + u.id) || "{}");
      out.push(snapshotFromState(raw, u.id));
    } catch {
      /* ignorar */
    }
  }
  return out;
}

function barChart(rows, valueFn, maxHint, unit) {
  const max = Math.max(maxHint || 1, ...rows.map(valueFn), 1);
  const h = Math.max(120, rows.length * 32 + 8);
  const w = 720;
  const left = 150;
  const bars = rows
    .map((r, i) => {
      const v = valueFn(r);
      const y = i * 32 + 6;
      const bw = ((w - left - 56) * v) / max;
      return `<text x="0" y="${y + 16}" fill="currentColor" font-size="12">${escapeHtml(shortName(r.name))}</text>
        <rect x="${left}" y="${y}" width="${Math.max(v ? 6 : 0, bw)}" height="20" rx="6" fill="var(--accent)" opacity="0.9"></rect>
        <text x="${left + Math.max(bw, 8) + 8}" y="${y + 16}" fill="currentColor" font-size="12">${v}${unit || ""}</text>`;
    })
    .join("");
  return `<svg class="aula-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Gráfica">${bars}</svg>`;
}

function donut(pct, label) {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const c = 2 * Math.PI * 28;
  const dash = (p / 100) * c;
  return `<div class="aula-donut">
    <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
      <circle cx="36" cy="36" r="28" fill="none" stroke="var(--border)" stroke-width="8"></circle>
      <circle cx="36" cy="36" r="28" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${dash} ${c}" transform="rotate(-90 36 36)"></circle>
    </svg>
    <div><strong>${p}%</strong><span>${escapeHtml(label)}</span></div>
  </div>`;
}

function winnerLabel(w) {
  if (w === "chatgpt") return "ChatGPT";
  if (w === "claude") return "Claude";
  if (w === "tie") return "Distintos";
  return "—";
}

function tableHtml(rows) {
  return `<div class="aula-table-wrap"><table class="data-table aula-table">
    <thead><tr>
      <th>Alumno</th><th>Cargo</th><th>Módulos</th><th>4 tareas</th><th>Quiz</th>
      <th>Insignias</th><th>Proyecto</th><th>Comparador</th><th>Pts</th><th>Último</th>
    </tr></thead>
    <tbody>${rows
      .map((r) => {
        const late = r.updatedAt && Date.now() - r.updatedAt > 15 * 60 * 1000;
        const live = r.updatedAt && Date.now() - r.updatedAt < 20 * 1000;
        return `<tr class="${r.pending ? "is-pending" : ""} ${live ? "is-live" : ""}">
          <td><strong>${escapeHtml(r.name)}</strong><br><code>${escapeHtml(r.username)}</code></td>
          <td>${escapeHtml(r.role || "—")}</td>
          <td>${r.modules}/10</td>
          <td>${r.chatDone || 0}/${r.chatTotal || 4}</td>
          <td>${r.quizzes ? `${r.quizAvg}% · ${r.quizzes}` : "—"}</td>
          <td>${r.badges || 0}/8</td>
          <td>${r.fiche ? "Ficha lista" : "Abierto"}</td>
          <td>${escapeHtml(winnerLabel(r.comparator?.winner))} ${r.comparator?.gptChars && r.comparator?.claudeChars ? "· pegó ambos" : ""}</td>
          <td>${r.xp || 0}</td>
          <td>${r.updatedAt ? escapeHtml(new Date(r.updatedAt).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })) : "Sin entrar"}${late ? " · pausa" : live ? " · ahora" : ""}</td>
        </tr>`;
      })
      .join("")}</tbody>
  </table></div>`;
}

function paintBoard(data, saves) {
  const box = document.getElementById("aula-live");
  if (!box) return;
  const rows = mergeRosterSaves(data.roster?.students || [], saves);
  const n = rows.length || 1;
  const avgMod = Math.round((rows.reduce((a, r) => a + (r.modules || 0), 0) / n / 10) * 100);
  const ficheN = rows.filter((r) => r.fiche).length;
  const chatN = rows.filter((r) => (r.chatDone || 0) >= 4).length;
  const liveN = rows.filter((r) => r.updatedAt && Date.now() - r.updatedAt < 60 * 1000).length;
  box.innerHTML = `
    <div class="aula-kpis">
      ${donut(Math.round((liveN / n) * 100), "activos 1 min")}
      ${donut(avgMod, "módulos del aula")}
      ${donut(Math.round((chatN / n) * 100), "4 tareas hechas")}
      ${donut(Math.round((ficheN / n) * 100), "ficha de proyecto")}
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <h3>Módulos cerrados por persona</h3>
        ${barChart(rows, (r) => r.modules || 0, 10, "/10")}
      </div>
      <div class="card">
        <h3>Puntos</h3>
        ${barChart(rows, (r) => r.xp || 0, 100, "")}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Seguimiento en vivo</h3>
      <p class="muted">Actualización automática. La marca verde indica actividad reciente.</p>
      ${tableHtml(rows)}
    </div>
  `;
}

export function renderAdmin(data) {
  const isInst = !!getState().profile.isInstructor;
  if (!isInst) {
    return `<div class="page-head"><h2>Acceso restringido</h2><p>Inicia sesión con una cuenta de instructor.</p></div>`;
  }
  const ins = data.roster?.instructor || {};
  const local = listLocalStudentSaves();
  const localHtml = local
    .map(
      (u) => `<div class="card">
        <h3>${escapeHtml(u.name)} <code>${escapeHtml(u.id)}</code></h3>
        <p class="muted">${escapeHtml(u.role)} · ${u.modules} módulos · ${u.xp} pts</p>
        <button class="btn btn-danger" type="button" data-reset-user="${escapeHtml(u.id)}">Restablecer</button>
      </div>`
    )
    .join("") || `<p class="muted">Aún no hay sesiones locales.</p>`;

  return `
    <div class="page-head">
      <h2>Dashboard del aula</h2>
      <p>Progreso, tareas, evaluaciones y proyecto. Controla el temporizador desde la barra superior.</p>
    </div>
    <div id="aula-live"><p class="muted">Cargando el aula…</p></div>
    <div class="card" style="margin-top:16px">
      <h3>Acceso</h3>
      <p>Usuario: <code>${escapeHtml(ins.username || "instructor")}</code></p>
      <p class="muted">Credenciales de administración.</p>
      <p><a class="btn" href="#/cronograma">Cronograma (solo tú)</a></p>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Sesiones en este equipo</h3>
      ${localHtml}
    </div>
  `;
}

export function bindAdmin(data) {
  bindInstructorClock();
  const paint = async () => {
    if (!document.getElementById("aula-live")) return;
    const local = localSnapshots();
    if (!syncEnabled()) {
      paintBoard(data, local);
      return;
    }
    const r = await fetchAdminSaves();
    if (r.error || !r.saves) {
      paintBoard(data, local);
      return;
    }
    const cloud = r.saves.filter((s) => s.username !== "__clock");
    const by = new Map();
    for (const row of [...local, ...cloud]) {
      const k = String(row.username || "").toLowerCase();
      const prev = by.get(k);
      if (!prev || (row.updatedAt || 0) >= (prev.updatedAt || 0)) by.set(k, row);
    }
    paintBoard(data, [...by.values()]);
  };
  paint();
  window.clearInterval(window.__aulaTimer);
  window.__aulaTimer = window.setInterval(paint, 5000);

  document.querySelectorAll("[data-reset-user]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-reset-user");
      if (!getState().profile.isInstructor) return;
      if (!confirm("¿Restablecer el progreso de " + id + "?")) return;
      resetLocalUser(id);
      logActivity("admin", "reset " + id);
      toast("Progreso restablecido.");
      window.dispatchEvent(new Event("app:refresh"));
    });
  });
}
