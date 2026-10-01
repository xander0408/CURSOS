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
  { href: "#/oficina/modulos", title: "Módulos", detail: "Excel, PowerPoint, investigación, productividad y proyecto." },
  { href: "#/oficina/tareas", title: "Tareas", detail: "Prácticas de chat y archivos de Office de 25 minutos." },
  { href: "#/oficina/retos", title: "Retos", detail: "Envía tu respuesta para ver la explicación." },
  { href: "#/oficina/quiz", title: "Quiz", detail: "Repaso contra el reloj de esta jornada." },
  { href: "#/oficina/prompts", title: "Prompts", detail: "Plantillas por área con casos ficticios." },
  { href: "#/proyecto", title: "Proyecto final", detail: "Siete pasos y presentación de 3–5 minutos." },
];

export function renderFriday2(data) {
  const done = getState().progress.labs?.checks || {};
  const step = nextFriday2Step(data);
  const pct = dayPct(data, 2);
  const mods = modulesOfDay(data, 2);
  const chats = (data.activities?.chatTasks || []).filter((t) => t.day === 2);
  const office = (data.activities?.items || []).filter((it) => ["a13", "a14", "a15"].includes(it.id));

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

  return `
    <div class="friday2-page">
      <div class="page-head">
        <p class="muted">Jornada propia · Excel, PowerPoint, investigación y cierre</p>
        <h2>${OFFICE_NAME}</h2>
        <p>Módulos, tareas, retos, quiz, prompts y proyecto de esta jornada. El otro viernes está en la pestaña de arriba, no en este menú.</p>
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
      <h3>Secciones de esta jornada</h3>
      <div class="grid grid-3">${nav}</div>
      <h3 style="margin-top:28px">Descargas de oficina</h3>
      <div class="grid grid-3">${files}</div>
    </div>
  `;
}

export function bindFriday2() {}
