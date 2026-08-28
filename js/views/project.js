import { getState, update } from "../store.js";
import { frameworkForm, readFramework } from "../prompt-lab.js";
import { assemblePrompt } from "../challenge-engine.js";
import { ficheText } from "../rubric.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";
import { completeModule } from "../store.js";

const STEPS = [
  { id: "problem", title: "Identificar problema", field: "problem", prompt: "Describe un problema real de tu trabajo que podría aliviarse con IA generativa. ¿Qué duele hoy?" },
  { id: "task", title: "Analizar tarea actual", field: "currentTask", prompt: "¿Cómo lo haces ahora? Pasos, personas, herramientas (Word, Excel, correo…)." },
  { id: "time-before", title: "Estimar tiempo actual", field: "timeBefore", prompt: "¿Cuánto tardas hoy? (minutos u horas por semana). Sé honesto, no optimista." },
  { id: "solution", title: "Diseñar solución", field: "solution", prompt: "¿Qué parte hará la IA y qué parte seguirás haciendo tú? (control humano)." },
  { id: "prompt", title: "Crear prompt", field: "prompt", prompt: "Construye ROL + CONTEXTO + OBJETIVO + FORMATO + RESTRICCIONES. No copies un prompt ajeno sin adaptarlo." },
  { id: "chatgpt", title: "Probar en ChatGPT", field: "chatgpt", prompt: "Pega o resume el resultado de ChatGPT. ¿Qué faltó?" },
  { id: "claude", title: "Probar en Claude", field: "claude", prompt: "Pega o resume el resultado de Claude con el mismo prompt (o una iteración controlada)." },
  { id: "compare", title: "Comparar resultados", field: "compare", prompt: "¿Cuál te sirve más en ESTE problema y por qué? No hay ganador universal." },
  { id: "refine", title: "Refinar prompt", field: "refine", prompt: "¿Qué contexto u objetivo faltaba? Escribe la versión mejorada." },
  { id: "verify", title: "Verificar resultado", field: "validation", prompt: "¿Qué datos, cifras o políticas comprobaste con una fuente humana o interna?" },
  { id: "process", title: "Diseñar proceso final", field: "process", prompt: "Pasos repetibles: cuándo usas IA, cuándo no, quién aprueba." },
  { id: "savings", title: "Tiempo ahorrado y ficha", field: "timeAfter", prompt: "Estima tiempo después y riesgos. Luego genera la ficha." },
];

export function renderProject(data, step = 0) {
  const i = Math.max(0, Math.min(STEPS.length - 1, Number(step) || 0));
  const s = STEPS[i];
  const fields = getState().progress.project.fields || {};
  const nav = STEPS.map(
    (st, idx) => `<a class="${idx === i ? "on" : ""}" href="#/proyecto/${idx}">${idx + 1}</a>`
  ).join("");

  const body =
    s.id === "prompt"
      ? frameworkForm(fields.framework || {})
      : `<div class="field"><label>${escapeHtml(s.prompt)}</label><textarea id="proj-field">${escapeHtml(fields[s.field] || "")}</textarea></div>`;

  const fiche = i === STEPS.length - 1 ? renderFiche(fields) : "";

  return `
    <div class="page-head">
      <h2>Proyecto final</h2>
      <p>Un problema real de tu trabajo. La ficha es tu evidencia de criterio, no un diploma automático.</p>
    </div>
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
  document.getElementById("proj-next")?.addEventListener("click", () => {
    const patch = {};
    if (s.id === "prompt") {
      const fw = readFramework(document.getElementById("proj-root"));
      patch.framework = fw;
      patch.prompt = assemblePrompt(fw);
    } else {
      patch[s.field] = document.getElementById("proj-field")?.value || getState().progress.project.fields[s.field];
    }
    if (i === STEPS.length - 1) {
      patch.savings = document.getElementById("savings")?.value || "";
      patch.risks = document.getElementById("risks")?.value || "";
      patch.timeAfter = document.getElementById("proj-field")?.value || patch.timeAfter;
    }
    update((st) => {
      st.progress.project.fields = { ...st.progress.project.fields, ...patch };
      st.progress.project.step = i;
      if (i === STEPS.length - 1) st.progress.project.ficheReady = true;
    });
    if (i === STEPS.length - 1) {
      completeModule("m9", 100);
      checkBadges(data);
      toast("Ficha guardada en este navegador.");
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
}
