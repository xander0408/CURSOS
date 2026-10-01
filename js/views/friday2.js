import { getState } from "../store.js";
import { escapeHtml } from "../ui.js";
import { assetUrl } from "../paths.js";
import { nextFriday2Step, modulesOfDay, OFFICE_NAME } from "../journey.js?v=20260930c1";
import { moduleProgress } from "./modules.js?v=20260927s2";
import { dayPct } from "./dashboard.js?v=20260930j1";

const FILES = [
  {
    file: "recursos/viernes2/datos-practica-excel.xlsx",
    label: "Excel de práctica (.xlsx)",
    hint: "Diez filas ficticias de Planta Central y Lote Norte. No es un caso de mesa.",
    practice: "Si el módulo de Excel lo pide",
  },
  {
    file: "recursos/viernes2/documento-base-presentacion.pptx",
    label: "PowerPoint base (.pptx)",
    hint: "Plantilla de 4 slides para prácticas de módulo, no para el caso de mesa.",
    practice: "Si el módulo de PowerPoint lo pide",
  },
  {
    file: "recursos/viernes2/dossier-investigacion.docx",
    label: "Dossier de investigación (.docx)",
    hint: "Texto ficticio para cazar cifras. Distinto de los 4 casos.",
    practice: "Si el módulo detective lo pide",
  },
];

const LINKS = [
  { href: "#/oficina/tareas", title: "Tareas", detail: "Los 4 Word de mesa, cronómetro A/B y el puente al proyecto." },
  { href: "#/oficina/modulos", title: "Módulos", detail: "Excel, PowerPoint, investigación y cierre." },
  { href: "#/oficina/retos", title: "Retos", detail: "Envía tu respuesta para ver la explicación." },
  { href: "#/oficina/quiz", title: "Quiz", detail: "Repaso corto contra el reloj." },
  { href: "#/oficina/prompts", title: "Prompts", detail: "Plantillas por área, si las necesitas." },
  { href: "#/proyecto", title: "Proyecto final", detail: "Elige tu caso. Siete pasos. 3–5 minutos." },
];

const RUTA = [
  { t: "Mañana", d: "Módulos con los tres archivos de Office, si el instructor los abre." },
  { t: "Tarde", d: "Un Word por mesa. 40 min a mano (sin IA ni internet). Luego la misma entrega con IA." },
  { t: "Cierre", d: "Cada persona elige ese caso en Proyecto final y presenta 3–5 minutos." },
];

export function renderFriday2(data) {
  const done = getState().progress.labs?.checks || {};
  const step = nextFriday2Step(data);
  const pct = dayPct(data, 2);
  const mods = modulesOfDay(data, 2);
  const cases = data.officeCases?.cases || [];
  const caseOk = cases.filter((c) => done[c.activityId]).length;
  const projectOn = !!getState().progress.project?.ficheReady;

  const caseFiles = cases
    .map(
      (c) => `<div class="card">
      <p class="muted">Caso ${c.n} · ${escapeHtml(c.area)}</p>
      <h3>${escapeHtml(c.title)}</h3>
      <p>${escapeHtml(c.problem.split(".")[0])}.</p>
      <a class="btn btn-primary" href="${escapeHtml(assetUrl(c.webFile))}" download="${escapeHtml((c.webFile || "").split("/").pop())}">Descargar Word</a>
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

  const nav = LINKS.map(
    (l) => `<a class="card clickable" href="${l.href}" style="text-decoration:none;color:inherit">
      <h3>${escapeHtml(l.title)}</h3>
      <p>${escapeHtml(l.detail)}</p>
    </a>`
  ).join("");

  const ruta = RUTA.map((x) => `<li><strong>${escapeHtml(x.t)}.</strong> ${escapeHtml(x.d)}</li>`).join("");

  return `
    <div class="friday2-page">
      <div class="page-head">
        <p class="muted">Jornada de 8 horas · un caso por mesa · proyecto individual</p>
        <h2>${OFFICE_NAME}</h2>
        <p>El instructor entrega un Word. La mesa trabaja 40 minutos sin IA. Luego con IA. Cada persona cierra su ficha del mismo caso.</p>
      </div>
      <div class="grid grid-4" style="margin-bottom:20px">
        <div class="card stat"><span class="value">${pct}%</span><span class="label">Avance de módulos</span></div>
        <div class="card stat"><span class="value">${mods.filter((m) => moduleProgress(data.modules[m.id]).complete).length}/${mods.length}</span><span class="label">Módulos</span></div>
        <div class="card stat"><span class="value">${caseOk}/${cases.length}</span><span class="label">Casos de mesa</span></div>
        <div class="card stat"><span class="value">${projectOn ? "sí" : "no"}</span><span class="label">Ficha lista</span></div>
      </div>
      <div class="card friday2-banner" style="margin-bottom:16px">
        <h3>Siguiente paso</h3>
        <p><strong>${escapeHtml(step.title)}</strong></p>
        <p>${escapeHtml(step.detail)}</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="${step.href}">Continuar</a>
          <a class="btn" href="#/oficina/tareas">Los 4 casos</a>
          <a class="btn" href="#/proyecto">Proyecto final</a>
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <h3>Cómo corre el viernes</h3>
        <ol>${ruta}</ol>
      </div>
      <h3>Los 4 Word que entregas en mesa</h3>
      <div class="grid grid-2">${caseFiles}</div>
      <h3 style="margin-top:28px">Secciones</h3>
      <div class="grid grid-3">${nav}</div>
      <h3 style="margin-top:28px">Archivos de módulo (opcionales)</h3>
      <div class="grid grid-3">${files}</div>
    </div>
  `;
}

export function bindFriday2() {}
