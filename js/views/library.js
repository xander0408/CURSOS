import { getState, update } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";

export function renderLibrary(data) {
  const seeds = data.library.templates
    .map(
      (t) => `<div class="card">
        <h3>${escapeHtml(t.title)}</h3>
        <p class="muted">${escapeHtml(t.useWhen)}</p>
        <p>${escapeHtml(t.hint)}</p>
        <div class="btn-row">
          <button class="btn" type="button" data-copy-id="${t.id}">Copiar plantilla</button>
          <button class="btn" type="button" data-save-id="${t.id}">Guardar</button>
        </div>
      </div>`
    )
    .join("");
  const custom = getState().progress.library.custom
    .map(
      (t) => `<div class="card">
        <h3>${escapeHtml(t.title)}</h3>
        <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        <button class="btn" type="button" data-copy-custom="${t.id}">Copiar</button>
      </div>`
    )
    .join("") || `<p class="muted">Aún no has guardado prompts propios. El Prompt Lab es el lugar para construirlos.</p>`;

  return `
    <div class="page-head">
      <h2>Biblioteca de prompts</h2>
      <p>Plantillas reutilizables, no recetas mágicas. Adapta contexto y restricciones a tu empresa.</p>
    </div>
    <h3>Del curso</h3>
    <div class="grid grid-2">${seeds}</div>
    <h3 style="margin-top:24px">Tus prompts</h3>
    <div class="grid grid-2">${custom}</div>
  `;
}

export function bindLibrary(data) {
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
