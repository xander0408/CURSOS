import { getState, update, logActivity } from "../store.js";
import { escapeHtml, toast, copyText } from "../ui.js";

export function renderActivities(data) {
  const pack = data.activities;
  const done = getState().progress.labs?.checks || {};
  const chats = pack.chatTasks || [];
  const chatOk = chats.filter((i) => done[i.id]).length;
  const n = pack.items.length;
  const ok = pack.items.filter((i) => done[i.id]).length;

  const chatCards = chats
    .map((it) => {
      const on = !!done[it.id];
      return `<div class="card activity-card chat-task ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Tarea ${it.n} de 4 · Día ${it.day} · ${it.mins} min · ChatGPT y Claude</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          <p><strong>Qué mirar:</strong> ${escapeHtml(it.look)}</p>
          <pre class="prompt-preview show" id="chat-prompt-${escapeHtml(it.id)}">${escapeHtml(it.prompt)}</pre>
          <div class="btn-row">
            <button class="btn btn-primary" type="button" data-copy-chat="${escapeHtml(it.id)}">Copiar y pegar en los dos chats</button>
            <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Abrir ChatGPT</a>
            <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Abrir Claude</a>
          </div>
        </div>
      </div>`;
    })
    .join("");

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
      <h2>4 tareas en ChatGPT y Claude</h2>
      <p>Obligatorias. Copie el texto, ábralo en <strong>ChatGPT</strong> y en <strong>Claude</strong> (el mismo). Si Claude no tiene créditos, haga las cuatro en ChatGPT y anótelo. No envíe nada desde el chat.</p>
      <p><strong>${chatOk} de ${chats.length}</strong> tareas duales hechas.</p>
    </div>
    <div class="activity-grid">${chatCards}</div>
    <div class="page-head" style="margin-top:28px">
      <h2>${escapeHtml(pack.title)}</h2>
      <p>${escapeHtml(pack.subtitle)}</p>
      <p><strong>${ok} de ${n}</strong> misiones extra en este navegador.</p>
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
  document.querySelectorAll("[data-copy-chat]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute("data-copy-chat");
      copyText(document.getElementById("chat-prompt-" + id)?.innerText || "");
    });
  });
}
