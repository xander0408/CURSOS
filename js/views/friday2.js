import { getState } from "../store.js";
import { escapeHtml, progressBar } from "../ui.js";
import { assetUrl } from "../paths.js";
import { isModuleUnlocked } from "../journey.js";
import { moduleProgress } from "./modules.js?v=20260920v3";
import { bindActivities } from "./activities.js?v=20260920v3";

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

function practiceCards(data) {
  const done = getState().progress.labs?.checks || {};
  const items = (data.activities?.items || []).filter((it) => ["a13", "a14", "a15"].includes(it.id));
  return items
    .map((it) => {
      const on = !!done[it.id];
      const resources = (it.resources || [])
        .map((resource) => {
          const path = resource.path;
          if (!path) return "";
          return `<a class="btn btn-primary" href="${escapeHtml(assetUrl(path))}" download="${escapeHtml(path.split("/").pop())}">${escapeHtml(resource.label)}</a>`;
        })
        .join("");
      const checklist = (it.checklist || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      return `<div class="card activity-card ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Práctica · ${it.mins} min · Viernes 2</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          <div class="btn-row">${resources}</div>
          ${checklist ? `<div class="activity-checklist"><strong>Lista de verificación</strong><ul>${checklist}</ul></div>` : ""}
        </div>
      </div>`;
    })
    .join("");
}

export function renderFriday2(data) {
  const mods = (data.course.modules || []).filter((m) => m.day === 2);
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

  const areaPrompts = (data.library?.templates || []).filter((t) => t.area);
  const promptHtml = areaPrompts
    .map(
      (t) => `<div class="card">
        <p class="muted">${escapeHtml(t.area)}</p>
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.useWhen)}</p>
        <a class="btn" href="#/biblioteca">Ver prompt completo</a>
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
    <div class="page-head">
      <p class="muted">Jornada del 25 de septiembre · 8 horas</p>
      <h2>Viernes 2</h2>
      <p>Excel, PowerPoint, investigación, casos por área y proyecto final. Todo el material nuevo está aquí. Los archivos se abren en Excel, PowerPoint y Word.</p>
    </div>
    <div class="card" style="margin-bottom:16px">
      <h3>Cómo usar esta jornada</h3>
      <p>1. Descargue el archivo de cada práctica. 2. Ábralo en Office. 3. Pida ayuda a ChatGPT y Claude sin pegar datos reales. 4. Marque la práctica al terminarla.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="#/proyecto">Ir al proyecto final</a>
        <a class="btn" href="#/biblioteca">Prompts por área</a>
        <a class="btn" href="#/quiz">Quizzes del día</a>
      </div>
    </div>
    <h3>Descargas de oficina</h3>
    <div class="grid grid-3">${files}</div>
    <h3 style="margin-top:28px">Módulos del Viernes 2</h3>
    <div class="module-list">${cards}</div>
    <h3 style="margin-top:28px">Tres prácticas de 25 minutos</h3>
    <div class="activity-grid">${practiceCards(data)}</div>
    <h3 style="margin-top:28px">Prompts por área</h3>
    <div class="grid grid-2">${promptHtml}</div>
  `;
}

export function bindFriday2(data) {
  bindActivities(data);
}
