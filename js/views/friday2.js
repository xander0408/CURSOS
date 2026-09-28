import { getState } from "../store.js";
import { escapeHtml, progressBar, copyText } from "../ui.js";
import { assetUrl } from "../paths.js";
import { isModuleUnlocked, nextFriday2Step, modulesOfDay, quizzesOfDay } from "../journey.js";
import { moduleProgress } from "./modules.js?v=20260927s1";
import { bindActivities } from "./activities.js?v=20260927s1";
import { dayPct } from "./dashboard.js?v=20260927s1";

const FILES = [
  {
    file: "recursos/viernes2/datos-practica-excel.xlsx",
    label: "Descargar Excel (.xlsx)",
    hint: "Ábralo en Microsoft Excel. Diez filas ficticias de Planta Central y Lote Norte.",
    practice: "Excel + IA en Acción",
  },
  {
    file: "recursos/viernes2/documento-base-presentacion.pptx",
    label: "Descargar PowerPoint (.pptx)",
    hint: "Ábralo en Microsoft PowerPoint. Es el documento base para la presentación ejecutiva.",
    practice: "De Información a Presentación Ejecutiva",
  },
  {
    file: "recursos/viernes2/dossier-investigacion.docx",
    label: "Descargar Word (.docx)",
    hint: "Ábralo en Microsoft Word. Dossier ficticio para verificación cruzada.",
    practice: "Detective de Información",
  },
];

function itemCard(it, done) {
  const on = !!done[it.id];
  const resources = (it.resources || [])
    .map((resource) => {
      const path = typeof resource === "string" ? resource : resource?.path;
      if (!path) return "";
      const label = typeof resource === "string" ? path.split("/").pop() : resource.label || "Descargar";
      return `<a class="btn btn-primary" href="${escapeHtml(assetUrl(path))}" download="${escapeHtml(path.split("/").pop())}">${escapeHtml(label)}</a>`;
    })
    .join("");
  const checklist = (it.checklist || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<div class="card activity-card ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Práctica · ${it.mins} min</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          ${resources ? `<div class="btn-row">${resources}</div>` : ""}
          ${checklist ? `<div class="activity-checklist"><strong>Lista de verificación</strong><ul>${checklist}</ul></div>` : ""}
        </div>
      </div>`;
}

function chatCards(chats, done) {
  return chats
    .map((it) => {
      const on = !!done[it.id];
      return `<div class="card activity-card chat-task ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Tarea ${it.n} · ${escapeHtml(it.focus || "Práctica")} · ${it.mins} min</p>
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
}

export function renderFriday2(data) {
  const done = getState().progress.labs?.checks || {};
  const step = nextFriday2Step(data);
  const pct = dayPct(data, 2);
  const mods = modulesOfDay(data, 2);
  const cards = mods
    .map((m) => {
      const full = data.modules[m.id];
      const p = moduleProgress(full);
      const open = isModuleUnlocked(data, m.id);
      const href = open ? `#/modulo/${m.id}/leccion/${full.lessons[0].id}` : "#/viernes-2";
      return `<a class="card clickable ${open ? "" : "soon"}" href="${href}" style="text-decoration:none;color:inherit">
        <div class="module-row">
          <div class="module-num">${m.number}</div>
          <div>
            <h3>${escapeHtml(m.title)}</h3>
            <p>${escapeHtml(m.subtitle)}</p>
            ${progressBar(p.pct)}
            ${open ? "" : '<p class="muted">Se abre al terminar el módulo anterior.</p>'}
          </div>
          <span class="pill ${p.complete ? "ok" : ""}">${!open ? "Bloqueado" : p.complete ? "Completado" : p.pct + "%"}</span>
        </div>
      </a>`;
    })
    .join("");

  const chats = (data.activities?.chatTasks || []).filter((t) => t.day === 2);
  const office = (data.activities?.items || []).filter((it) => ["a13", "a14", "a15"].includes(it.id));
  const extras = (data.activities?.items || []).filter((it) => it.day === 2 && !["a13", "a14", "a15"].includes(it.id));
  const quizzes = quizzesOfDay(data, 2);
  const best = getState().progress.quizzes?.bestScores || {};
  const quizHtml = quizzes
    .map((qz) => {
      const b = best[qz.id];
      const badge = b ? `<span class="pill ok">Mejor: ${b.score} pts</span>` : `<span class="pill">Sin jugar</span>`;
      return `<a class="card clickable quiz-card" href="#/quiz/${encodeURIComponent(qz.id)}" style="text-decoration:none;color:inherit">
        <div class="quiz-card-top"><span class="quiz-icon">${qz.icon || "❓"}</span>${badge}</div>
        <h3>${escapeHtml(qz.title)}</h3>
        <p>${escapeHtml(qz.subtitle || "")}</p>
      </a>`;
    })
    .join("");

  const areaPrompts = (data.library?.templates || []).filter((t) => t.area);
  const promptHtml = areaPrompts
    .map(
      (t) => `<div class="card">
        <p class="muted">${escapeHtml(t.area)}</p>
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.useWhen)}</p>
        <p>${escapeHtml(t.hint || "")}</p>
        <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" data-copy-id="${escapeHtml(t.id)}">Copiar plantilla</button>
        </div>
      </div>`
    )
    .join("");

  const files = FILES.map(
    (f) => `<div class="card">
      <p class="muted">${escapeHtml(f.practice)}</p>
      <h3>${escapeHtml(f.label)}</h3>
      <p>${escapeHtml(f.hint)}</p>
      <a class="btn btn-primary" href="${escapeHtml(assetUrl(f.file))}" download="${escapeHtml(f.file.split("/").pop())}">${escapeHtml(f.label)}</a>
    </div>`
  ).join("");

  return `
    <div class="friday2-page">
      <div class="page-head">
        <p class="muted">Jornada del 25 de septiembre · 8 horas · Independiente de la ruta del primer viernes</p>
        <h2>Viernes 2</h2>
        <p>Excel, PowerPoint, investigación, casos por área y proyecto final. Todo el material de esta jornada está aquí.</p>
      </div>
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="card stat"><span class="value">${pct}%</span><span class="label">Avance de esta jornada</span></div>
        <div class="card stat"><span class="value">${mods.filter((m) => moduleProgress(data.modules[m.id]).complete).length}/${mods.length}</span><span class="label">Módulos</span></div>
        <div class="card stat"><span class="value">${chats.filter((t) => done[t.id]).length}/${chats.length}</span><span class="label">Tareas de chat</span></div>
        <div class="card stat"><span class="value">${office.filter((t) => done[t.id]).length}/${office.length}</span><span class="label">Prácticas Office</span></div>
      </div>
      <div class="card friday2-banner" style="margin-bottom:16px">
        <h3>Siguiente paso</h3>
        <p><strong>${escapeHtml(step.title)}</strong></p>
        <p>${escapeHtml(step.detail)}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="${step.href}">Continuar</a>
          <a class="btn" href="#/proyecto">Proyecto final</a>
        </div>
      </div>
      <h3>Descargas de oficina</h3>
      <div class="grid grid-3">${files}</div>
      <h3 style="margin-top:28px">Módulos de esta jornada</h3>
      <div class="module-list">${cards}</div>
      <h3 style="margin-top:28px">Tareas en ChatGPT y Claude</h3>
      <div class="activity-grid">${chatCards(chats, done)}</div>
      <h3 style="margin-top:28px">Tres prácticas de 25 minutos</h3>
      <div class="activity-grid">${office.map((it) => itemCard(it, done)).join("")}</div>
      ${extras.length ? `<h3 style="margin-top:28px">Actividades complementarias</h3>
      <div class="activity-grid">${extras.map((it) => itemCard(it, done)).join("")}</div>` : ""}
      <h3 style="margin-top:28px">Quizzes del día</h3>
      <div class="grid grid-3">${quizHtml}</div>
      <h3 style="margin-top:28px">Prompts por área</h3>
      <div class="grid grid-2">${promptHtml}</div>
    </div>
  `;
}

export function bindFriday2(data) {
  bindActivities(data);
  document.querySelectorAll("[data-copy-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = data.library.templates.find((x) => x.id === btn.dataset.copyId);
      if (t) copyText(t.text);
    });
  });
}
