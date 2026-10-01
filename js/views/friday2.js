import { getState } from "../store.js";
import { escapeHtml } from "../ui.js";
import { assetUrl } from "../paths.js";
import { nextFriday2Step, modulesOfDay, OFFICE_NAME } from "../journey.js";
import { moduleProgress } from "./modules.js?v=20260927s2";
import { dayPct } from "./dashboard.js?v=20260930j1";

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

const LINKS = [
  { href: "#/oficina/tareas", title: "Tareas", detail: "Chat, Office y casos por área. Hay para un viernes completo." },
  { href: "#/oficina/modulos", title: "Módulos", detail: "Excel, PowerPoint, investigación, productividad y proyecto." },
  { href: "#/oficina/retos", title: "Retos", detail: "Envía tu respuesta para ver la explicación." },
  { href: "#/oficina/quiz", title: "Quiz", detail: "Repaso contra el reloj, incluidos números y presentación." },
  { href: "#/oficina/prompts", title: "Prompts", detail: "Plantillas por área con casos ficticios." },
  { href: "#/proyecto", title: "Proyecto final", detail: "Siete pasos y presentación de 3–5 minutos." },
];

const RUTA = [
  { t: "Mañana", d: "Módulos de Excel y PowerPoint + prácticas con los archivos .xlsx y .pptx." },
  { t: "Mediodía", d: "Investigación con el dossier .docx y tareas de cacería de cifras o fuentes." },
  { t: "Tarde", d: "Caso en grupo: 40 min solo Word/Excel/PPT (sin IA ni internet) y luego la misma entrega con IA, midiendo tiempos." },
  { t: "Cierre", d: "Proyecto individual: ficha profesional y presentación de 3–5 minutos." },
];

export function renderFriday2(data) {
  const done = getState().progress.labs?.checks || {};
  const step = nextFriday2Step(data);
  const pct = dayPct(data, 2);
  const mods = modulesOfDay(data, 2);
  const chats = (data.activities?.chatTasks || []).filter((t) => t.day === 2);
  const extras = (data.activities?.items || []).filter((it) => it.day === 2);
  const nextChats = chats.filter((t) => !done[t.id]).slice(0, 3);

  const files = FILES.map(
    (f) => `<div class="card">
      <p class="muted">${escapeHtml(f.practice)}</p>
      <h3>${escapeHtml(f.label)}</h3>
      <p>${escapeHtml(f.hint)}</p>
      <a class="btn btn-primary" href="${escapeHtml(assetUrl(f.file))}" download="${escapeHtml(f.file.split("/").pop())}">${escapeHtml(f.label)}</a>
    </div>`
  ).join("");

  const nav = LINKS.map(
    (l) => `<a class="card clickable" href="${l.href}" style="text-decoration:none;color:inherit">
      <h3>${escapeHtml(l.title)}</h3>
      <p>${escapeHtml(l.detail)}</p>
    </a>`
  ).join("");

  const ruta = RUTA.map((x) => `<li><strong>${escapeHtml(x.t)}.</strong> ${escapeHtml(x.d)}</li>`).join("");
  const pending = nextChats.length
    ? `<div class="card" style="margin-bottom:16px">
        <h3>Siguientes tareas de chat</h3>
        <ol>${nextChats.map((t) => `<li><a href="#/oficina/tareas">${escapeHtml(t.title)}</a> · ${t.mins} min</li>`).join("")}</ol>
        <a class="btn btn-primary" href="#/oficina/tareas">Abrir todas las tareas</a>
      </div>`
    : `<div class="card" style="margin-bottom:16px"><p>Ya marcaste las tareas de chat. Sigue con el <a href="#/proyecto">proyecto</a> o un <a href="#/oficina/quiz">quiz</a>.</p></div>`;

  return `
    <div class="friday2-page">
      <div class="page-head">
        <p class="muted">Jornada de 8 horas · Excel, PowerPoint, investigación, casos por área y cierre</p>
        <h2>${OFFICE_NAME}</h2>
        <p>Todo lo de este viernes está en esta pestaña. Hay tareas de chat, prácticas de lista, archivos de Office, quizzes y el proyecto.</p>
      </div>
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="card stat"><span class="value">${pct}%</span><span class="label">Avance de módulos</span></div>
        <div class="card stat"><span class="value">${mods.filter((m) => moduleProgress(data.modules[m.id]).complete).length}/${mods.length}</span><span class="label">Módulos</span></div>
        <div class="card stat"><span class="value">${chats.filter((t) => done[t.id]).length}/${chats.length}</span><span class="label">Tareas de chat</span></div>
        <div class="card stat"><span class="value">${extras.filter((t) => done[t.id]).length}/${extras.length}</span><span class="label">Prácticas de lista</span></div>
      </div>
      <div class="card friday2-banner" style="margin-bottom:16px">
        <h3>Siguiente paso</h3>
        <p><strong>${escapeHtml(step.title)}</strong></p>
        <p>${escapeHtml(step.detail)}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="${step.href}">Continuar</a>
          <a class="btn" href="#/oficina/tareas">Ir a las tareas</a>
          <a class="btn" href="#/proyecto">Proyecto final</a>
        </div>
      </div>
      ${pending}
      <div class="card" style="margin-bottom:16px">
        <h3>Cómo llenar el viernes</h3>
        <ol>${ruta}</ol>
      </div>
      <h3>Secciones</h3>
      <div class="grid grid-3">${nav}</div>
      <h3 style="margin-top:28px">Descargas de oficina</h3>
      <div class="grid grid-3">${files}</div>
    </div>
  `;
}

export function bindFriday2() {}
