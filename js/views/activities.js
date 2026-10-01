import { getState, update, logActivity } from "../store.js";
import { escapeHtml, toast, copyText } from "../ui.js";
import { checkBadges } from "../badges.js";
import { assetUrl } from "../paths.js";
import { officeCaseById, officeCasePatch } from "../office-cases.js?v=20260930c1";

export function renderActivities(data, { day = 1 } = {}) {
  const pack = data.activities;
  const done = getState().progress.labs?.checks || {};
  const wantDay2 = Number(day) === 2;

  if (wantDay2) return renderOfficeTasks(data, done);

  const chats = (pack.chatTasks || []).filter((t) => t.day !== 2);
  const extras = (pack.items || []).filter((it) => it.day !== 2);
  const chatOk = chats.filter((i) => done[i.id]).length;
  const ok = extras.filter((i) => done[i.id]).length;
  const order = new Map(chats.map((t, i) => [t.id, i + 1]));

  return `
    <div class="page-head">
      <h2>Tareas en ChatGPT y Claude</h2>
      <p>Prácticas de esta jornada. En la mayoría, el mismo texto en los dos chats. No envíes el resultado.</p>
      <p><strong>${chatOk} de ${chats.length}</strong> tareas de chat · <strong>${ok} de ${extras.length}</strong> prácticas de lista.</p>
    </div>
    <div class="activity-grid">${chats.map((it) => chatCard(it, done, order, chats.length)).join("")}</div>
    <div class="page-head" style="margin-top:28px">
      <h2>${escapeHtml(pack.title)}</h2>
      <p>${escapeHtml(pack.subtitle)}</p>
    </div>
    <div class="activity-grid">${extras.map((it) => itemCard(it, done)).join("")}</div>
  `;
}

function renderOfficeTasks(data, done) {
  const cases = data.officeCases?.cases || [];
  const officeIds = ["a13", "a14", "a15"];
  const office = (data.activities?.items || []).filter((it) => officeIds.includes(it.id));
  const chosen = getState().progress.project?.fields?.officeCaseId || "";
  const caseOk = cases.filter((c) => done[c.activityId]).length;
  const officeOk = office.filter((it) => done[it.id]).length;
  const versusItems = new Map((data.activities?.items || []).filter((it) => it.versus).map((it) => [it.id, it]));

  const caseCards = cases
    .map((c) => {
      const it = versusItems.get(c.activityId) || { id: c.activityId, versus: true, mins: 40 };
      const on = !!done[c.activityId];
      const times = getState().progress.labs?.versus?.[c.activityId] || {};
      const mine = chosen === c.id;
      const fname = (c.webFile || c.file || "").split("/").pop() || "caso.docx";
      return `<div class="card activity-card ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(c.activityId)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Caso ${c.n} de 4 · ${escapeHtml(c.area)} · 40 min a mano</p>
          ${mine ? `<p class="pill ok">Este es tu proyecto final</p>` : ""}
          <h3>${escapeHtml(c.title)}</h3>
          <p>${escapeHtml(c.brief || c.story || c.problem)}</p>
          ${
            Array.isArray(c.deliver)
              ? `<ul>${c.deliver.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
                 <p><strong>Esto no:</strong> ${escapeHtml(c.dont || "")}</p>`
              : ""
          }
          <div class="btn-row">
            <a class="btn btn-primary" href="${escapeHtml(assetUrl(c.webFile))}" download="${escapeHtml(fname)}">Descargar Word del caso</a>
            <button class="btn" type="button" data-use-case="${escapeHtml(c.id)}">${mine ? "Ya está en tu ficha" : "Usar en mi proyecto"}</button>
            <a class="btn" href="#/proyecto">Abrir proyecto</a>
          </div>
          <div class="activity-checklist" style="margin-top:14px">
            <strong>Cronómetro de la mesa</strong>
            <p class="muted">Fase A: 40 minutos. Solo Word, Excel y PowerPoint. Sin IA y sin internet.</p>
            <div class="field"><label>Minutos reales de la Fase A (manual)</label>
              <input data-versus="${escapeHtml(it.id)}" data-versus-field="manualMin" type="number" min="0" max="120" value="${escapeHtml(times.manualMin || "")}" placeholder="40" /></div>
            <p class="muted">Fase B: la misma entrega, ahora sí ChatGPT o Claude. Midan el reloj.</p>
            <div class="field"><label>Minutos reales de la Fase B (con IA)</label>
              <input data-versus="${escapeHtml(it.id)}" data-versus-field="aiMin" type="number" min="0" max="120" value="${escapeHtml(times.aiMin || "")}" placeholder="ej. 18" /></div>
            <div class="field"><label>Tres diferencias (velocidad, calidad, huecos, riesgo)</label>
              <textarea data-versus="${escapeHtml(it.id)}" data-versus-field="notes" rows="3" placeholder="Con IA salió más rápido, pero inventó una fecha; a mano el Excel quedó más honesto.">${escapeHtml(times.notes || "")}</textarea></div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  return `
    <div class="page-head">
      <p class="muted"><a href="#/oficina">← Oficina + IA</a></p>
      <h2>Tareas · Oficina + IA</h2>
      <p>Una hoja por mesa. Lean, trabajen a mano, luego con IA. Al rato cada uno abre su proyecto con el mismo caso.</p>
      <p><strong>${caseOk} de ${cases.length}</strong> casos de mesa · <strong>${officeOk} de ${office.length}</strong> archivos de práctica.</p>
    </div>
    <div class="callout think">
      <strong>Cómo se corre</strong>
      Una mesa, un caso. 40 minutos con Word, Excel y PowerPoint. Internet apagado. Luego lo mismo con ChatGPT o Claude. Anoten los minutos. Después cada persona llena su proyecto.
    </div>
    <div class="page-head" style="margin-top:28px">
      <h2>Los 4 casos de mesa</h2>
      <p>Un caso por grupo. Descarga el Word, trabajo a mano, luego con IA, luego el proyecto de cada uno.</p>
    </div>
    <div class="activity-grid">${caseCards}</div>
    <div class="page-head" style="margin-top:28px">
      <h2>Tres archivos de Office (si los pide el módulo)</h2>
      <p>Excel, PowerPoint y Word de práctica. No son los casos de mesa.</p>
    </div>
    <div class="activity-grid">${office.map((it) => itemCard(it, done)).join("")}</div>
    <div class="card" style="margin-top:28px">
      <h3>Proyecto final · 7 pasos</h3>
      <p>Es individual. Elige el mismo caso de tu mesa: el sistema te carga problema, audiencia y prompt R+C+O+F+R. Presentación de 3 a 5 minutos.</p>
      <a class="btn btn-primary" href="#/proyecto">Abrir mi proyecto</a>
    </div>
  `;
}

function chatCard(it, done, order, total) {
  const on = !!done[it.id];
  const num = order.get(it.id) || it.n;
  return `<div class="card activity-card chat-task ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Tarea ${num} de ${total} · ${escapeHtml(it.focus || "Práctica")} · ${it.mins} min</p>
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
}

function itemCard(it, done) {
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
          <p class="muted">Práctica con archivo · ${it.mins} min</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          ${resources}
          ${checklist}
        </div>
      </div>`;
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
  document.querySelectorAll("[data-versus]").forEach((el) => {
    const save = () => {
      const id = el.getAttribute("data-versus");
      const field = el.getAttribute("data-versus-field");
      update((s) => {
        s.progress.labs = s.progress.labs || {};
        s.progress.labs.versus = s.progress.labs.versus || {};
        s.progress.labs.versus[id] = { ...(s.progress.labs.versus[id] || {}), [field]: el.value };
      });
    };
    el.addEventListener("input", save);
    el.addEventListener("change", save);
  });
  document.querySelectorAll("[data-use-case]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = officeCaseById(data, btn.getAttribute("data-use-case"));
      if (!c) return;
      update((s) => {
        s.progress.project = s.progress.project || {};
        s.progress.project.fields = { ...(s.progress.project.fields || {}), ...officeCasePatch(c) };
      });
      logActivity("proyecto", `caso ${c.id}`);
      toast(`Cargado: Caso ${c.n} · ${c.title}. Abre Proyecto final.`);
      window.dispatchEvent(new Event("app:refresh"));
    });
  });
}
