import { getState, update } from "../store.js";
import { frameworkForm, readFramework } from "../prompt-lab.js";
import { assemblePrompt } from "../challenge-engine.js";
import { ficheText } from "../rubric.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";
import { completeModule } from "../store.js";
import { assignedTask } from "../journey.js";
import { sectionAgent } from "../agents.js";
import { assetUrl } from "../paths.js";

const STEPS = [
  { id: "problem", title: "1. Definir el problema" },
  { id: "prompt", title: "2. Crear el prompt R+C+O+F+R" },
  { id: "chatgpt", title: "3. Probar en ChatGPT" },
  { id: "claude", title: "4. Probar en Claude" },
  { id: "compare", title: "5. Comparar resultados" },
  { id: "refine", title: "6. Refinar y validar" },
  { id: "present", title: "7. Preparar la presentación" },
];

const SUCCESS_CRITERIA = [
  "El problema está definido y no contiene datos sensibles.",
  "El prompt incluye Rol, Contexto, Objetivo, Formato y Restricciones.",
  "Se probó el mismo punto de partida en ChatGPT y Claude.",
  "La comparación usa criterios concretos, no un ganador universal.",
  "El prompt fue refinado a partir de lo observado.",
  "Cifras, hechos, fuentes y políticas fueron verificados por una persona.",
  "La presentación explica valor, riesgos y control humano en 3–5 minutos.",
];

function textarea(field, label, value, rows = 5) {
  return `<div class="field"><label>${escapeHtml(label)}</label>
    <textarea data-project-field="${escapeHtml(field)}" rows="${rows}">${escapeHtml(value || "")}</textarea></div>`;
}

export function renderProject(data, step = 0) {
  const i = Math.max(0, Math.min(STEPS.length - 1, Number(step) || 0));
  const s = STEPS[i];
  const fields = { ...(getState().progress.project.fields || {}) };
  const task = assignedTask(data);
  if (task) {
    if (!fields.problem) fields.problem = task.problem || task.deliverable;
    if (!fields.prompt && task.pastePrompt) fields.prompt = task.pastePrompt;
  }
  const nav = STEPS.map(
    (st, idx) => `<a class="${idx === i ? "on" : ""}" href="#/proyecto/${idx}">${idx + 1}</a>`
  ).join("");

  let body = "";
  if (s.id === "problem") {
    const user = getState().profile.username || "";
    const wordName = user ? `${user}-proyecto-final.docx` : "";
    const wordHref = wordName ? assetUrl(`proyectos/${wordName}`) : "";
    const mine = task
      ? `<div class="callout think">
          <strong>Este es TU caso</strong>
          ${escapeHtml(task.title)}. ${escapeHtml(task.forRole || "")}.
          No es el ejercicio de mesa de los 40 minutos. El instructor te da el Word de la carpeta proyectos (${escapeHtml(wordName || "USUARIO-proyecto-final.docx")}).
        </div>
        ${task.story ? `<p>${escapeHtml(task.story)}</p>` : ""}
        ${task.doThis ? `<p><strong>Qué entregar:</strong> ${escapeHtml(task.doThis)}</p>` : `<p><strong>Qué entregar:</strong> ${escapeHtml(task.deliverable || "")}</p>`}
        ${task.dont ? `<p><strong>Esto no:</strong> ${escapeHtml(task.dont)}</p>` : ""}
        ${wordHref ? `<p><a class="btn btn-primary" href="${escapeHtml(wordHref)}" download="${escapeHtml(wordName)}">Descargar mi Word</a></p>` : ""}`
      : `<div class="callout think"><strong>Tu Word</strong>Cada alumno tiene un archivo en la carpeta proyectos (su usuario). Si no ves el tuyo, pídeselo al instructor.</div>`;
    body = `
      ${mine}
      ${textarea("audience", "¿Quién oiría tu presentación? (cargo, no nombre)", fields.audience, 2)}
      ${textarea("problem", "El problema, en tus palabras", fields.problem)}
      ${textarea("currentTask", "¿Cómo se hace hoy?", fields.currentTask)}
      ${textarea("timeBefore", "¿Cuánto te toma hoy? (tu estimado)", fields.timeBefore, 3)}
      ${task?.pastePrompt ? `<p class="muted">Copia esto, pégalo en ChatGPT y el mismo texto en Claude.</p>
        <pre class="prompt-preview show" id="proj-ready-prompt">${escapeHtml(task.pastePrompt)}</pre>
        <button class="btn" type="button" id="copy-task-prompt">Copiar el texto</button>` : ""}`;
  } else if (s.id === "prompt") {
    body = `${task?.pastePrompt ? `<p class="muted">Revisa el caso asignado y adáptalo. No pegues datos internos.</p>
      <pre class="prompt-preview show" id="proj-ready-prompt">${escapeHtml(task.pastePrompt)}</pre>
      <button class="btn" type="button" id="copy-task-prompt">Copiar prompt del caso</button>` : ""}
      ${frameworkForm(fields.framework || {})}`;
  } else if (s.id === "chatgpt") {
    body = `<p>Pega el prompt en ChatGPT. Conserva el resultado o un resumen fiel y anota qué faltó.</p>
      <p><a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Abrir ChatGPT</a></p>
      ${textarea("chatgpt", "Resultado o resumen de ChatGPT", fields.chatgpt, 9)}`;
  } else if (s.id === "claude") {
    body = `<p>Usa el mismo punto de partida en Claude para poder comparar con justicia.</p>
      <p><a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Abrir Claude</a></p>
      ${textarea("claude", "Resultado o resumen de Claude", fields.claude, 9)}`;
  } else if (s.id === "compare") {
    body = `<p>No busques un ganador universal. Compara utilidad, exactitud, claridad, formato y riesgos para este caso.</p>
      ${textarea("compare", "¿Qué funcionó mejor en cada respuesta y por qué?", fields.compare, 8)}`;
  } else if (s.id === "refine") {
    body = `
      ${textarea("refine", "Prompt refinado: ¿qué contexto, formato o restricción mejoraste?", fields.refine, 8)}
      ${textarea("validation", "¿Qué cifras, hechos, fuentes o políticas verificaste y con quién?", fields.validation, 6)}
      ${textarea("process", "Proceso final: ¿qué hace la IA, qué revisa una persona y quién aprueba?", fields.process, 5)}
      ${textarea("timeAfter", "Tiempo estimado después", fields.timeAfter, 3)}
      ${textarea("risks", "Riesgos y controles", fields.risks, 5)}`;
  } else {
    const checked = fields.successCriteria || {};
    body = `
      <div class="callout think"><strong>Un minuto al frente</strong>El problema. Qué pediste. Qué salió en ChatGPT y en Claude. Qué revisaste tú. Quién decide.</div>
      <p class="muted">Slides: contexto · situación · evidencia (sin cifras internas) · opciones · control humano. Máximo 4 viñetas por diapositiva.</p>
      ${textarea("solution", "Solución en una frase que firmarías frente a tu jefatura", fields.solution, 4)}
      ${textarea("presentation", "Guion hablado (3–5 minutos). Léelo en voz alta. Si pasas de 5:00, recorta.", fields.presentation, 10)}
      ${textarea("peerNotes", "Feedback de la mesa (qué se entendió, qué faltó, un riesgo).", fields.peerNotes, 5)}
      <h4>7 criterios de éxito</h4>
      <div class="project-criteria">${SUCCESS_CRITERIA.map(
        (criterion, idx) =>
          `<label class="choice"><input type="checkbox" data-project-criterion="${idx}" ${checked[idx] ? "checked" : ""}> ${escapeHtml(criterion)}</label>`
      ).join("")}</div>`;
  }

  const fiche = i === STEPS.length - 1 ? renderFiche(fields) : "";

  return `
    <div class="page-head">
      <p class="muted"><a href="#/oficina">← Oficina + IA</a></p>
      <h2>Proyecto final</h2>
      <p>Usa el Word de tu usuario en la carpeta proyectos. No el caso de mesa. Datos de práctica, nada de la empresa.</p>
    </div>
    ${Number(step) === 0 ? sectionAgent(data, "project") : ""}
    <div class="steps">${nav}</div>
    <div class="card" id="proj-root">
      <p class="muted">Paso ${i + 1} de ${STEPS.length}</p>
      <h3>${escapeHtml(s.title)}</h3>
      ${body}
      ${fiche}
      <div class="btn-row">
        ${i > 0 ? `<a class="btn" href="#/proyecto/${i - 1}">Anterior</a>` : ""}
        <button class="btn btn-primary" type="button" id="proj-next">${i === STEPS.length - 1 ? "Guardar ficha" : "Guardar y seguir"}</button>
      </div>
    </div>
  `;
}

function renderFiche(fields) {
  const assembled = fields.prompt || (fields.framework ? assemblePrompt(fields.framework) : "");
  const f = {
    problem: fields.problem,
    solution: fields.solution,
    prompt: assembled,
    result: [fields.chatgpt, fields.claude, fields.compare].filter(Boolean).join("\n---\n"),
    validation: fields.validation,
    timeBefore: fields.timeBefore,
    timeAfter: fields.timeAfter,
    savings: fields.savings || "",
    risks: fields.risks || fields.refine,
    humanControl: fields.process,
    presentation: fields.presentation,
  };
  return `<div class="ficha" id="ficha">
    <h3>Ficha del proyecto</h3>
    ${Object.entries({
      PROBLEMA: f.problem,
      SOLUCIÓN: f.solution,
      PROMPT: f.prompt,
      RESULTADO: f.result,
      VALIDACIÓN: f.validation,
      "TIEMPO ANTES": f.timeBefore,
      "TIEMPO DESPUÉS": f.timeAfter,
      "AHORRO ESTIMADO": f.savings,
      RIESGOS: f.risks,
      "CONTROL HUMANO": f.humanControl,
      "GUION DE PRESENTACIÓN": f.presentation,
    })
      .map(([k, v]) => `<dt>${k}</dt><dd>${escapeHtml(v || "—")}</dd>`)
      .join("")}
    <div class="field"><label>Ahorro estimado (complétalo)</label><input id="savings" value="${escapeHtml(fields.savings || "")}" /></div>
    <div class="field"><label>Riesgos</label><textarea id="risks">${escapeHtml(fields.risks || "")}</textarea></div>
    <button class="btn" type="button" id="copy-fiche">Copiar ficha</button>
  </div>`;
}

export function bindProject(data, step = 0) {
  const i = Math.max(0, Math.min(STEPS.length - 1, Number(step) || 0));
  const s = STEPS[i];
  const fields = { ...(getState().progress.project.fields || {}) };
  const task = assignedTask(data);
  if (task) {
    if (!fields.problem) fields.problem = task.problem || task.deliverable;
    if (!fields.prompt && task.pastePrompt) fields.prompt = task.pastePrompt;
  }

  const collectPatch = () => {
    const patch = {};
    if (s.id === "prompt") {
      const fw = readFramework(document.getElementById("proj-root"));
      patch.framework = fw;
      patch.prompt = assemblePrompt(fw) || fields.prompt || task?.pastePrompt || "";
    }
    document.querySelectorAll("[data-project-field]").forEach((el) => {
      patch[el.getAttribute("data-project-field")] = el.value;
    });
    const criteria = document.querySelectorAll("[data-project-criterion]");
    if (criteria.length) {
      patch.successCriteria = {};
      criteria.forEach((el) => {
        patch.successCriteria[el.getAttribute("data-project-criterion")] = el.checked;
      });
    }
    if (document.getElementById("savings")) patch.savings = document.getElementById("savings").value;
    if (document.getElementById("risks")) patch.risks = document.getElementById("risks").value;
    return patch;
  };

  const savePatch = (patch) => {
    update((st) => {
      st.progress.project.fields = { ...st.progress.project.fields, ...patch };
      st.progress.project.step = i;
    });
  };

  document.querySelectorAll("[data-project-field]").forEach((el) => {
    el.addEventListener("input", () => savePatch(collectPatch()));
  });
  document.querySelectorAll("[data-project-criterion]").forEach((el) => {
    el.addEventListener("change", () => savePatch(collectPatch()));
  });
  document.getElementById("proj-root")?.querySelectorAll("[data-fw]")?.forEach((el) => {
    el.addEventListener("input", () => savePatch(collectPatch()));
  });
  document.getElementById("savings")?.addEventListener("input", () => savePatch(collectPatch()));
  document.getElementById("risks")?.addEventListener("input", () => savePatch(collectPatch()));
  document.querySelectorAll(".steps a").forEach((a) => {
    a.addEventListener("click", () => savePatch(collectPatch()));
  });

  document.getElementById("proj-next")?.addEventListener("click", () => {
    const patch = collectPatch();
    savePatch(patch);
    if (i === STEPS.length - 1) {
      const fields = { ...getState().progress.project.fields, ...patch };
      const required = ["problem", "prompt", "chatgpt", "claude", "compare", "validation", "presentation"];
      const missing = required.filter((key) => !String(fields[key] || "").trim());
      const criteriaOk = SUCCESS_CRITERIA.every((_, idx) => !!fields.successCriteria?.[idx]);
      if (missing.length || !criteriaOk) {
        toast("Completa los 7 pasos y marca los 7 criterios antes de cerrar la ficha.");
        return;
      }
      update((st) => {
        st.progress.project.ficheReady = true;
      });
      completeModule("m9", 100);
      checkBadges(data);
      toast("Ficha guardada.");
      window.dispatchEvent(new Event("app:refresh"));
      return;
    }
    location.hash = `#/proyecto/${i + 1}`;
  });
  document.getElementById("copy-fiche")?.addEventListener("click", () => {
    const fields = { ...getState().progress.project.fields };
    fields.savings = document.getElementById("savings")?.value || fields.savings;
    fields.risks = document.getElementById("risks")?.value || fields.risks;
    copyText(ficheText({ ...fields, prompt: fields.prompt || assemblePrompt(fields.framework || {}) }));
  });
  document.getElementById("copy-task-prompt")?.addEventListener("click", () => {
    const task = assignedTask(data);
    const box = document.getElementById("proj-ready-prompt");
    copyText(box?.innerText || task?.pastePrompt || "");
  });
}
