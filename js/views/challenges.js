import { allChallenges } from "../content.js";
import { getState } from "../store.js";
import { escapeHtml, pillForDifficulty } from "../ui.js";

export function renderChallengesIndex(data, moduleFilter = "") {
  const list = allChallenges(data).filter((c) => !moduleFilter || c.moduleId === moduleFilter);
  const opts = data.course.modules
    .map((m) => `<option value="${m.id}" ${moduleFilter === m.id ? "selected" : ""}>M${m.number} ${escapeHtml(m.title)}</option>`)
    .join("");
  const rows = list
    .map((c) => {
      const st = getState().progress.challenges[c.id];
      const done = st?.status === "done";
      return `<a class="card clickable" href="#/modulo/${c.moduleId}/reto/${c.id}" style="text-decoration:none;color:inherit">
        <p class="muted">M${c.moduleId.replace("m", "")} · ${pillForDifficulty(c.difficulty)}</p>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.objective)}</p>
        <p class="muted">${done ? `Enviado · ${st.score}%` : "Sin enviar — la respuesta no se muestra aún"}</p>
      </a>`;
    })
    .join("");
  return `
    <div class="page-head">
      <h2>Retos</h2>
      <p>Envía tu respuesta para ver la explicación. El objetivo es el criterio, no adivinar la clave.</p>
    </div>
    <div class="field"><label>Filtrar por módulo</label>
      <select id="ch-filter"><option value="">Todos</option>${opts}</select>
    </div>
    <div class="grid grid-2">${rows}</div>
  `;
}

export function bindChallengesIndex() {
  document.getElementById("ch-filter")?.addEventListener("change", (e) => {
    const v = e.target.value;
    location.hash = v ? `#/retos/${v}` : "#/retos";
  });
}
