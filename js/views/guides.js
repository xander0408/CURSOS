import { getState, update } from "../store.js";
import { escapeHtml, toast, copyText } from "../ui.js";
import { assignedTask } from "../journey.js";

export function renderPerfil(data) {
  const s = getState();
  const k = s.profile.knowUs || {};
  const task = assignedTask(data);
  return `
    <div class="page-head">
      <h2>Conocernos</h2>
      <p>Ronda de aula: cargo, una tarea que te quita tiempo (sin datos internos) y tu caso de practica asignado. Los ejemplos del laboratorio son ficticios.</p>
    </div>
    <div class="card">
      <h3>${escapeHtml(s.profile.displayName || "Participante")}</h3>
      <p class="muted">${escapeHtml(s.profile.role || "")} · ${escapeHtml(s.profile.email || "")}</p>
      <div class="field"><label>Anos aproximados en tu cargo o en el sector</label>
        <input id="ku-years" value="${escapeHtml(k.years || "")}" placeholder="ej. 8" /></div>
      <div class="field"><label>Una tarea de tu semana que te quita tiempo (sin datos sensibles)</label>
        <textarea id="ku-pain" rows="3" placeholder="ej. armar el reporte semanal a partir de varios correos">${escapeHtml(k.pain || "")}</textarea></div>
      <div class="field"><label>¿Cuánto has usado ChatGPT o Claude?</label>
        <select id="ku-ai">
          <option value="nunca" ${k.aiLevel === "nunca" ? "selected" : ""}>Nunca o casi nunca</option>
          <option value="poco" ${k.aiLevel === "poco" ? "selected" : ""}>Un poco, por curiosidad</option>
          <option value="semanal" ${k.aiLevel === "semanal" ? "selected" : ""}>Casi todas las semanas</option>
          <option value="diario" ${k.aiLevel === "diario" ? "selected" : ""}>Casi todos los días</option>
        </select>
      </div>
      <div class="field"><label>¿Qué te gustaría lograr al terminar los 2 viernes?</label>
        <textarea id="ku-hope" rows="2">${escapeHtml(k.hope || "")}</textarea></div>
      <button class="btn btn-primary" type="button" id="ku-save">Guardar y continuar</button>
    </div>
    ${task ? `<div class="card" style="margin-top:16px">
      <h3>Tu tarea asignada</h3>
      <p><strong>${escapeHtml(task.title)}</strong></p>
      <p>${escapeHtml(task.deliverable)}</p>
      <p class="muted">Cuando: ${escapeHtml(task.when)}</p>
      <pre class="prompt-preview show" id="task-prompt-box">${escapeHtml(task.pastePrompt || "")}</pre>
      <button class="btn btn-primary" type="button" id="copy-task">Copiar prompt de mi caso</button>
    </div>` : ""}
  `;
}

export function bindPerfil(data) {
  document.getElementById("ku-save")?.addEventListener("click", () => {
    const years = document.getElementById("ku-years").value.trim();
    const pain = document.getElementById("ku-pain").value.trim();
    const aiLevel = document.getElementById("ku-ai").value;
    const hope = document.getElementById("ku-hope").value.trim();
    if (!pain) {
      toast("Describe al menos una tarea que te quite tiempo.");
      return;
    }
    update((s) => {
      s.profile.knowUs = { years, pain, aiLevel, hope };
      s.profile.introDone = true;
    });
    toast("Perfil guardado en este navegador.");
    location.hash = "#/cuentas";
  });
  document.getElementById("copy-task")?.addEventListener("click", () => {
    copyText(document.getElementById("task-prompt-box")?.innerText || assignedTask(data)?.pastePrompt || "");
  });
}

export function renderCuentas(data) {
  const f = data.freeAccounts;
  const col = (title, url, plan, can, cannot, tip) => `
    <div class="card">
      <h3>${escapeHtml(title)}</h3>
      <p class="muted">${escapeHtml(plan)} · <a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a></p>
      <p><strong>Sí puedes</strong></p>
      <ul>${can.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      <p><strong>Límites (Free)</strong></p>
      <ul>${cannot.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      <p class="muted">${escapeHtml(tip)}</p>
    </div>`;
  return `
    <div class="page-head">
      <h2>Cuentas gratuitas: hasta dónde llegan</h2>
      <p>${escapeHtml(f.disclaimer)}</p>
    </div>
    <div class="grid grid-2">
      ${col("ChatGPT", f.chatgpt.url, f.chatgpt.plan, f.chatgpt.can, f.chatgpt.cannotOrLimited, f.chatgpt.classTip)}
      ${col("Claude", f.claude.url, f.claude.plan, f.claude.can, f.claude.cannotOrLimited, f.claude.classTip)}
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Reglas de aula</h3>
      <ul>${f.classroomRules.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
      <button class="btn btn-primary" type="button" id="ack-free">Entendido: seguir a Historia de la IA</button>
    </div>
  `;
}

export function bindCuentas() {
  document.getElementById("ack-free")?.addEventListener("click", () => {
    update((s) => {
      s.progress.freeTiersAck = true;
    });
    location.hash = "#/modulo/m0/leccion/l1";
  });
}

export function renderManual(data) {
  const m = data.promptManual;
  const pieces = m.pieces
    .map((p) => `<div class="card"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.ask)}</p><p class="muted">${escapeHtml(p.example)}</p></div>`)
    .join("");
  const tpls = m.templates
    .map(
      (t) => `<div class="card"><h3>${escapeHtml(t.name)}</h3><pre class="prompt-preview show">${escapeHtml(t.body)}</pre></div>`
    )
    .join("");
  return `
    <div class="page-head">
      <h2>${escapeHtml(m.title)}</h2>
      <p>${escapeHtml(m.subtitle)}</p>
      <p><strong>${escapeHtml(m.rule)}</strong></p>
    </div>
    <div class="grid grid-2">${pieces}</div>
    <h3 style="margin-top:24px">Ruta de estudio</h3>
    ${(m.studyTrack || [])
      .map(
        (st) =>
          `<div class="card"><h3>${escapeHtml(st.session)}</h3><ul>${st.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>`
      )
      .join("")}
    <h3 style="margin-top:24px">Plantillas para copiar al Prompt Lab</h3>
    ${tpls}
    <div class="card">
      <h3>Recordatorios</h3>
      <ul>${m.cisaReminders.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
  `;
}

export function renderAdmin(data) {
  if (!getState().profile.isInstructor && !getState().settings.instructorUnlocked) {
    return `<div class="page-head"><h2>Solo instructor</h2><p>Entra con el usuario instructor o desbloquea el PIN.</p></div>`;
  }
  const rows = (data.roster?.students || [])
    .map((s) => {
      const task = (data.tasks || []).find((t) => t.id === s.taskId);
      return `<tr><td>${escapeHtml(s.name)}</td><td><code>${escapeHtml(s.username)}</code></td><td>${escapeHtml(s.role)}</td><td>${escapeHtml(task ? task.title : "—")}</td></tr>`;
    })
    .join("");
  const ins = data.roster?.instructor || {};
  return `
    <div class="page-head">
      <h2>Panel del instructor</h2>
      <p>Lista de aula y tareas. El avance de cada alumno vive en <strong>su</strong> navegador; aquí ves a quién se asignó qué. PIN de notas: el de instructor-notes.json.</p>
    </div>
    <div class="card">
      <h3>Tu acceso de administración</h3>
      <p>Usuario: <code>${escapeHtml(ins.username || "instructor")}</code></p>
      <p class="muted">La contraseña está en CREDENCIALES-INSTRUCTOR.md (no la proyectes).</p>
    </div>
    <div class="card" style="overflow:auto">
      <table class="data-table">
        <thead><tr><th>Nombre</th><th>Usuario</th><th>Cargo</th><th>Tarea</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card">
      <h3>Orden de la sesión 1</h3>
      <ol>
        <li>Login y ronda «Conocernos».</li>
        <li>Límites de cuentas gratis.</li>
        <li>Historia de la IA + quiz q0.</li>
        <li>Fundamentos → prompts → Word y tarea de cargo.</li>
      </ol>
    </div>
  `;
}
