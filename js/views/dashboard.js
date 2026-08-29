import { getState, update, resetAll, exportState, importState } from "../store.js";
import { moduleProgress } from "./modules.js";
import { escapeHtml, progressBar, toast, openModal, closeModal } from "../ui.js";
import { sectionAgent } from "../agents.js";

export function globalPct(data) {
  const pcts = data.course.modules.map((m) => moduleProgress(data.modules[m.id]).pct);
  return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

export function renderDashboard(data) {
  const s = getState();
  const pct = globalPct(data);
  const next = data.course.modules.find((m) => moduleProgress(data.modules[m.id]).pct < 100) || data.course.modules[0];
  const nextFull = data.modules[next.id];
  const badges = data.badges
    .map((b) => {
      const on = !!s.progress.badges[b.id];
      return `<span class="badge-chip ${on ? "earned" : ""}">${b.icon} ${b.name}</span>`;
    })
    .join("");

  return `
    <div class="page-head">
      <h2>Laboratorio</h2>
      <p>No memorices prompts. Aprende a pensar qué necesita saber la IA para resolver un problema de negocio — y a verificar el resultado antes de usarlo.</p>
    </div>
    ${sectionAgent(data, "dashboard")}
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="card stat"><span class="value">${pct}%</span><span class="label">Progreso general</span></div>
      <div class="card stat"><span class="value">${s.progress.totals.modulesCompleted}</span><span class="label">Módulos</span></div>
      <div class="card stat"><span class="value">${s.progress.totals.challengesCompleted}</span><span class="label">Retos</span></div>
      <div class="card stat"><span class="value">${s.progress.totals.xp}</span><span class="label">Puntos</span></div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h3>Continúa aquí</h3>
        <p>Módulo ${next.number}: ${escapeHtml(next.title)}</p>
        ${progressBar(moduleProgress(nextFull).pct)}
        <div class="btn-row">
          <a class="btn btn-primary" href="#/modulo/${next.id}/leccion/${nextFull.lessons[0].id}">Abrir módulo</a>
        </div>
      </div>
      <div class="card">
        <h3>Tu nombre en este equipo</h3>
        <p>Se guarda solo en este navegador.</p>
        <div class="field"><input id="display-name" placeholder="Nombre o alias" value="${escapeHtml(s.profile.displayName)}" /></div>
        <button class="btn" type="button" id="save-name">Guardar</button>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Metodología A.C.T.I.V.A.</h3>
      <p>Analizar · Contextualizar · Transformar · Iterar · Verificar · Aplicar. Cada ejercicio ilumina una fase.</p>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <h3>🎮 Quiz rápido</h3>
        <p>Repaso estilo concurso: responde contra el reloj y gana puntos por rapidez.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#/quiz">Jugar un quiz</a></div>
      </div>
      <div class="card">
        <h3>Insignias</h3>
        <div class="btn-row">${badges}</div>
      </div>
    </div>
  `;
}

export function bindDashboard() {
  document.getElementById("save-name")?.addEventListener("click", () => {
    const name = document.getElementById("display-name").value.trim();
    update((s) => {
      s.profile.displayName = name;
    });
    toast("Nombre guardado en este navegador.");
    window.dispatchEvent(new Event("app:refresh"));
  });
}

export function renderProgress(data) {
  const s = getState();
  const rows = data.course.modules
    .map((m) => {
      const p = moduleProgress(data.modules[m.id]);
      return `<div class="card"><h3>M${m.number} ${escapeHtml(m.title)}</h3>${progressBar(p.pct)}<p class="muted">Puntuación (último intento): ${p.avg}%</p></div>`;
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
      <p>El progreso se guarda solo en este navegador. Si vas a cambiar de equipo, <strong>exporta</strong> tu avance y luego <strong>impórtalo</strong> en el otro.</p>
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
    openModal(`<h3>¿Reiniciar esta máquina?</h3><p>Se borra el progreso de este navegador. No afecta a otros alumnos.</p>
      <div class="btn-row"><button class="btn btn-danger" id="confirm-reset">Sí, reiniciar</button><button class="btn" id="cancel-reset">Cancelar</button></div>`);
    document.getElementById("confirm-reset").onclick = () => {
      resetAll();
      closeModal();
      // Recarga limpia: reconstruye todo desde el estado vacio y evita
      // que quede vista o estado cacheado con el progreso anterior.
      location.hash = "#/";
      location.reload();
    };
    document.getElementById("cancel-reset").onclick = closeModal;
  });
}
