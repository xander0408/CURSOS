import { getState, update, logActivity } from "../store.js";
import { escapeHtml, toast, copyText } from "../ui.js";
import { checkBadges } from "../badges.js";
import { assetUrl } from "../paths.js";

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
          <p class="muted">Tarea ${it.n} de ${chats.length} · ${escapeHtml(it.focus || "Práctica")} · Día ${it.day} · ${it.mins} min</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          <p><strong>Qué mirar:</strong> ${escapeHtml(it.look)}</p>
          <pre class="prompt-preview show" id="chat-prompt-${escapeHtml(it.id)}">${escapeHtml(it.prompt)}</pre>
          <div class="btn-row">
            <button class="btn btn-primary" type="button" data-copy-chat="${escapeHtml(it.id)}">Copiar y pegar en los dos chats</button>
            <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Abrir ChatGPT</a>
            <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Abrir Claude</a>
            <a class="btn" href="#/comparador/${escapeHtml(it.id)}">Ver comparativo en vivo</a>
          </div>
        </div>
      </div>`;
    })
    .join("");

  const day2Ids = ["a13", "a14", "a15"];
  const day2 = pack.items.filter((it) => day2Ids.includes(it.id));
  const rest = pack.items.filter((it) => !day2Ids.includes(it.id));

  function itemCard(it) {
    const on = !!done[it.id];
    const resources = Array.isArray(it.resources)
      ? `<div class="btn-row">${it.resources
          .map((resource) => {
            const path = typeof resource === "string" ? resource : resource?.path;
            if (!path) return "";
            const label =
              typeof resource === "string"
                ? resource.split("/").pop() || "Descargar recurso"
                : resource.label || "Descargar recurso";
            const fname = path.split("/").pop() || "recurso";
            return `<a class="btn btn-primary" href="${escapeHtml(assetUrl(path))}" download="${escapeHtml(fname)}">${escapeHtml(label)}</a>`;
          })
          .join("")}</div>`
      : "";
    const checklist = Array.isArray(it.checklist)
      ? `<div class="activity-checklist">
            <strong>Lista de verificación:</strong>
            <ul>${it.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>`
      : "";
    return `<div class="card activity-card ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Día ${it.day} · ${it.mins} min</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          ${resources}
          ${checklist}
        </div>
      </div>`;
  }

  const cards = rest.map(itemCard).join("");
  const day2Cards = day2.map(itemCard).join("");

  return `
    <div class="page-head">
      <h2>Tareas en ChatGPT y Claude</h2>
      <p>Nueve prácticas con enfoque distinto. En la mayoría, el mismo texto en los dos chats. No envíes el resultado.</p>
      <p><strong>${chatOk} de ${chats.length}</strong> completadas.</p>
    </div>
    <div class="activity-grid">${chatCards}</div>
    <div class="page-head" style="margin-top:28px">
      <h2>Viernes 2 · prácticas con archivos de Office</h2>
      <p>Excel (.xlsx), PowerPoint (.pptx) y Word (.docx). También están reunidas en el menú <a href="#/viernes-2">Viernes 2</a>.</p>
    </div>
    <div class="activity-grid">${day2Cards}</div>
    <div class="page-head" style="margin-top:28px">
      <h2>${escapeHtml(pack.title)}</h2>
      <p>${escapeHtml(pack.subtitle)}</p>
      <p><strong>${ok} de ${n}</strong> actividades complementarias.</p>
    </div>
    <div class="activity-grid">${cards}</div>
  `;
}

export function bindActivities(data) {
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
      if (data) checkBadges(data);
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
