import { getState, update, resetAll, exportState, importState } from "../store.js";
import { moduleProgress } from "./modules.js";
import { escapeHtml, progressBar, toast, openModal, closeModal } from "../ui.js";
import { sectionAgent } from "../agents.js";
import { nextPathStep, assignedTask } from "../journey.js";

export function globalPct(data) {
  const pcts = data.course.modules.map((m) => moduleProgress(data.modules[m.id]).pct);
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

export function renderDashboard(data) {
  const s = getState();
  const pct = globalPct(data);
  const step = nextPathStep(data);
  const task = assignedTask(data);
  const badges = data.badges
    .map((b) => {
      const on = !!s.progress.badges[b.id];
      return `<span class="badge-chip ${on ? "earned" : ""}">${b.icon} ${b.name}</span>`;
    })
    .join("");

  const path = [
    { ok: s.profile.introDone, href: "#/perfil", label: "1. Conocernos" },
    { ok: s.progress.freeTiersAck, href: "#/cuentas", label: "2. Cuentas gratis" },
    ...data.course.modules.map((m, i) => ({
      ok: moduleProgress(data.modules[m.id]).complete,
      href: `#/modulo/${m.id}/leccion/${data.modules[m.id].lessons[0].id}`,
      label: `${i + 3}. ${m.number === 0 ? "Historia" : "M" + m.number + " " + m.title}`,
    })),
  ];

  const pathHtml = path
    .map(
      (p, i) =>
        `<a class="path-step ${p.ok ? "done" : i === path.findIndex((x) => !x.ok) ? "now" : ""}" href="${p.href}">${escapeHtml(p.label)}</a>`
    )
    .join("");

  return `
    <div class="page-head">
      <h2>Ruta del laboratorio</h2>
      <p>Orden fijo: conocernos, cuentas gratis, historia de la IA, modulos. Los casos de practica son ficticios; no uses datos internos de tu empresa.</p>
    </div>
    ${sectionAgent(data, "dashboard")}
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="card stat"><span class="value">${pct}%</span><span class="label">Progreso general</span></div>
      <div class="card stat"><span class="value">${s.progress.totals.modulesCompleted}</span><span class="label">Módulos</span></div>
      <div class="card stat"><span class="value">${s.progress.totals.challengesCompleted}</span><span class="label">Retos</span></div>
      <div class="card stat"><span class="value">${s.progress.totals.xp}</span><span class="label">Puntos</span></div>
    </div>
    <div class="card path-card">
      <h3>Siguiente paso</h3>
      <p><strong>${escapeHtml(step.title)}</strong></p>
      <p>${escapeHtml(step.detail)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${step.href}">Continuar</a>
        <a class="btn" href="#/manual">Manual de prompts</a>
        <a class="btn" href="#/actividades">Actividades</a>
        ${getState().profile.isInstructor ? `<a class="btn" href="#/cronograma">Cronograma</a>` : ""}
      </div>
    </div>
    <div class="path-rail">${pathHtml}</div>
    <div class="grid grid-2" style="margin-top:16px">
      ${
        task
          ? `<div class="card">
        <h3>Tu caso de práctica</h3>
        <p><strong>${escapeHtml(task.title)}</strong></p>
        <p>${escapeHtml(task.deliverable)}</p>
        <p class="muted">${escapeHtml(task.when)}</p>
      </div>`
          : `<div class="card"><h3>Tarea</h3><p>Completa Conocernos para ver tu práctica asignada.</p></div>`
      }
      <div class="card">
        <h3>Insignias</h3>
        <div class="btn-row">${badges}</div>
        <div class="btn-row" style="margin-top:12px">
          <a class="btn" href="#/quiz">Quiz de repaso</a>
          <a class="btn" href="#/actividades">Misiones</a>
        </div>
      </div>
    </div>
  `;
}

export function bindDashboard() {}

export function renderProgress(data) {
  const s = getState();
  const rows = data.course.modules
    .map((m) => {
      const p = moduleProgress(data.modules[m.id]);
      const label = m.number === 0 ? "Inicio" : `M${m.number}`;
      return `<div class="card"><h3>${label} ${escapeHtml(m.title)}</h3>${progressBar(p.pct)}<p class="muted">Puntuación (último intento): ${p.avg}%</p></div>`;
    })
    .join("");
  const badges = data.badges
    .map((b) => {
      const on = s.progress.badges[b.id];
      return `<div class="card ${on ? "" : "soon"}"><h3>${b.icon} ${b.name}</h3><p>${escapeHtml(b.why)}</p><p class="muted">${on ? "Conseguida" : "Aún no"}</p></div>`;
    })
    .join("");
  return `
    <div class="page-head">
      <h2>Progreso</h2>
      <p>La puntuación de cada reto usa el <strong>último intento</strong>. Los puntos no sustituyen el criterio en el trabajo real.</p>
    </div>
    <div class="grid grid-3">${rows}</div>
    <h3 style="margin-top:28px">Insignias</h3>
    <div class="grid grid-2">${badges}</div>
    <div class="card" style="margin-top:20px">
      <h3>Tu avance en este navegador</h3>
      <p>El progreso se guarda por <strong>usuario</strong> en este navegador. Si cambias de equipo, exporta e importa.</p>
      <div class="btn-row">
        <button class="btn" type="button" id="btn-export">Exportar avance</button>
        <button class="btn" type="button" id="btn-import">Importar avance</button>
        <input type="file" id="import-file" accept="application/json,.json" style="display:none" />
        <button class="btn btn-danger" type="button" id="btn-reset">Reiniciar progreso</button>
      </div>
    </div>
  `;
}

export function bindProgress(data) {
  document.getElementById("btn-export")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(exportState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const name = (getState().profile.displayName || "alumno").replace(/[^\w-]+/g, "_");
    a.download = `ai-business-lab-${name}.json`;
    a.click();
    toast("Avance exportado. Guarda el archivo en un lugar seguro.");
  });

  const fileInput = document.getElementById("import-file");
  document.getElementById("btn-import")?.addEventListener("click", () => fileInput?.click());
  fileInput?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        importState(obj);
        toast("Avance importado. Se recargará la página.");
        setTimeout(() => location.reload(), 800);
      } catch {
        toast("No se pudo leer el archivo. ¿Es un respaldo válido?");
      }
    };
    reader.readAsText(file);
  });
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    openModal(`<h3>¿Reiniciar esta máquina?</h3><p>Se borra el progreso de este usuario en este navegador. No afecta a otros.</p>
      <div class="btn-row"><button class="btn btn-danger" id="confirm-reset">Sí, reiniciar</button><button class="btn" id="cancel-reset">Cancelar</button></div>`);
    document.getElementById("confirm-reset").onclick = () => {
      resetAll();
      closeModal();
      location.hash = "#/";
      location.reload();
    };
    document.getElementById("cancel-reset").onclick = closeModal;
  });
}
