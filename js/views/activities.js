import { getState, update, logActivity } from "../store.js";
import { escapeHtml, toast } from "../ui.js";

export function renderActivities(data) {
  const pack = data.activities;
  const done = getState().progress.labs?.checks || {};
  const n = pack.items.length;
  const ok = pack.items.filter((i) => done[i.id]).length;
  const cards = pack.items
    .map((it) => {
      const on = !!done[it.id];
      return `<label class="card activity-card ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Día ${it.day} · ${it.mins} min</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
        </div>
      </label>`;
    })
    .join("");
  return `
    <div class="page-head">
      <h2>${escapeHtml(pack.title)}</h2>
      <p>${escapeHtml(pack.subtitle)}</p>
      <p><strong>${ok} de ${n}</strong> misiones hechas en este navegador.</p>
    </div>
    <div class="activity-grid">${cards}</div>
  `;
}

export function bindActivities() {
  document.querySelectorAll("[data-act]").forEach((el) => {
    el.addEventListener("change", () => {
      const id = el.getAttribute("data-act");
      update((s) => {
        s.progress.labs = s.progress.labs || {};
        s.progress.labs.checks = s.progress.labs.checks || {};
        s.progress.labs.checks[id] = el.checked;
      });
      logActivity("actividad", `${id}: ${el.checked ? "hecha" : "desmarcada"}`);
      toast(el.checked ? "Actividad marcada." : "Actividad desmarcada.");
    });
  });
}
