import { assemblePrompt } from "./challenge-engine.js";

export function frameworkForm(values = {}, { reveal = false } = {}) {
  const v = {
    role: "",
    context: "",
    objective: "",
    format: "",
    constraints: "",
    ...values,
  };
  const assembled = assemblePrompt(v);
  const ready = Object.values(v).every((x) => String(x).trim().length > 8);
  return `
    <p class="muted">Completa las piezas o pega un prompt listo. El boton Copiar arma el texto y lo deja en el portapapeles.</p>
    <div class="field"><label>Rol — ¿quién debe ser la IA?</label><textarea name="role" data-fw="role">${esc(v.role)}</textarea></div>
    <div class="field"><label>Contexto — ¿qué situación laboral hay?</label><textarea name="context" data-fw="context">${esc(v.context)}</textarea></div>
    <div class="field"><label>Objetivo — ¿qué debe lograr?</label><textarea name="objective" data-fw="objective">${esc(v.objective)}</textarea></div>
    <div class="field"><label>Formato — ¿cómo debe verse el resultado?</label><textarea name="format" data-fw="format">${esc(v.format)}</textarea></div>
    <div class="field"><label>Restricciones — ¿qué no debe hacer?</label><textarea name="constraints" data-fw="constraints">${esc(v.constraints)}</textarea></div>
    <div class="btn-row">
      <button class="btn" type="button" data-action="preview-prompt">Ver solicitud ensamblada</button>
      <button class="btn btn-primary" type="button" data-action="copy-prompt">Copiar para ChatGPT / Claude</button>
    </div>
    <div class="prompt-preview ${reveal || ready ? "show" : ""}" data-assembled>${esc(assembled)}</div>
    <p class="muted">Ábrelo en otra pestaña. Esta plataforma no reemplaza a ChatGPT ni a Claude.</p>
  `;
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function readFramework(root) {
  const get = (name) => root.querySelector(`[data-fw="${name}"]`)?.value || "";
  return {
    role: get("role"),
    context: get("context"),
    objective: get("objective"),
    format: get("format"),
    constraints: get("constraints"),
  };
}

export const RUBRIC_AXES = [
  { id: "clarity", label: "Claridad" },
  { id: "precision", label: "Precisión" },
  { id: "structure", label: "Estructura" },
  { id: "creativity", label: "Creatividad" },
  { id: "utility", label: "Utilidad" },
  { id: "compliance", label: "Cumplimiento de instrucciones" },
];

export function rubricHtml(name, values = {}) {
  return RUBRIC_AXES.map((a) => {
    const val = values[a.id] || 3;
    return `<div class="field"><label>${a.label}: <span data-rubric-val="${name}-${a.id}">${val}</span></label>
      <input class="range" type="range" min="1" max="5" value="${val}" data-rubric="${name}" data-axis="${a.id}" />
    </div>`;
  }).join("");
}

export function readRubric(root, name) {
  const out = {};
  root.querySelectorAll(`[data-rubric="${name}"]`).forEach((el) => {
    out[el.dataset.axis] = Number(el.value);
  });
  return out;
}
