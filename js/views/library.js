import { getState, update, saveOwnPrompt } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";

export function ownPromptBoxHtml({ prefix = "own", value = "", title = "" } = {}) {
  return `
    <div class="card own-prompt-box">
      <h3>Sube tu prompt final al portal del curso</h3>
      <p class="muted">Pega el prompt que te funcionó, ya anonimizado (Cliente Alfa, Planta Central, Lote Norte, cargos). Queda en Biblioteca → Tus prompts.</p>
      <div class="field"><label>Título corto</label>
        <input id="${prefix}-title" maxlength="80" value="${escapeHtml(title)}" placeholder="Ej. Aviso de reunión al equipo" /></div>
      <div class="field"><label>Tu prompt</label>
        <textarea id="${prefix}-text" rows="8" placeholder="Rol, contexto, objetivo, formato y restricciones…">${escapeHtml(value)}</textarea></div>
      <button class="btn btn-primary" type="button" data-upload-own-prompt="${escapeHtml(prefix)}">Sube tu prompt final al portal del curso</button>
    </div>`;
}

export function bindOwnPromptUploads(root, data) {
  (root || document).querySelectorAll("[data-upload-own-prompt]").forEach((btn) => {
    if (btn.dataset.boundUpload === "1") return;
    btn.dataset.boundUpload = "1";
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-upload-own-prompt");
      const title = document.getElementById(p + "-title")?.value || "";
      const text = document.getElementById(p + "-text")?.value || "";
      const r = saveOwnPrompt({ title, text, source: p });
      if (r.error) {
        toast(r.error);
        return;
      }
      toast("Prompt subido al portal. Ábrelo en Biblioteca → Tus prompts.");
      checkBadges(data);
    });
  });
}

export function renderLibrary(data) {
  const seeds = data.library.templates
    .map(
      (t) => `<div class="card">
        <h3>${escapeHtml(t.title)}</h3>
        <p class="muted">${escapeHtml(t.useWhen)}</p>
        <p>${escapeHtml(t.hint)}</p>
        <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" data-copy-id="${t.id}">Copiar plantilla</button>
          <button class="btn" type="button" data-save-id="${t.id}">Guardar</button>
        </div>
      </div>`
    )
    .join("");
  const custom = (getState().progress.library.custom || [])
    .map(
      (t) => `<div class="card">
        <h3>${escapeHtml(t.title)}</h3>
        <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        <button class="btn" type="button" data-copy-custom="${t.id}">Copiar</button>
      </div>`
    )
    .join("") || `<p class="muted">Aún no has subido prompts propios. Usa el recuadro de arriba o Prompt Lab.</p>`;

  return `
    <div class="page-head">
      <h2>Biblioteca de prompts</h2>
      <p>Plantillas listas para copiar y pegar. Cambia solo los datos entre corchetes. No uses información real de tu empresa.</p>
    </div>
    ${ownPromptBoxHtml({ prefix: "libown" })}
    <h3 style="margin-top:24px">Del curso</h3>
    <div class="grid grid-2">${seeds}</div>
    <h3 style="margin-top:24px">Tus prompts</h3>
    <div class="grid grid-2">${custom}</div>
  `;
}

export function bindLibrary(data) {
  bindOwnPromptUploads(document, data);
  document.querySelectorAll("[data-copy-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = data.library.templates.find((x) => x.id === btn.dataset.copyId);
      copyText(t.text);
    });
  });
  document.querySelectorAll("[data-save-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      update((s) => {
        if (!s.progress.library.savedIds.includes(btn.dataset.saveId)) {
          s.progress.library.savedIds.push(btn.dataset.saveId);
        }
      });
      toast("Marcado en tu biblioteca.");
      checkBadges(data);
    });
  });
  document.querySelectorAll("[data-copy-custom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = getState().progress.library.custom.find((x) => x.id === btn.dataset.copyCustom);
      if (t) copyText(t.text);
    });
  });
}
