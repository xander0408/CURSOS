import { getState, saveOwnPrompt, deleteOwnPrompt } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";

export function ownPromptBoxHtml({ prefix = "own", value = "", title = "", editId = "" } = {}) {
  return `
    <div class="card own-prompt-box">
      <h3>Crea y guarda tu propio prompt</h3>
      <p class="muted">Escríbelo tú (o pégalo ya anonimizado). Pulsa <strong>Guardar mi prompt</strong>. Cada alumno guarda los suyos en su sesión: no se mezclan con los del compañero.</p>
      <input type="hidden" id="${prefix}-id" value="${escapeHtml(editId)}" />
      <div class="field"><label>Título corto</label>
        <input id="${prefix}-title" maxlength="80" value="${escapeHtml(title)}" placeholder="Ej. Aviso de reunión a mi equipo" /></div>
      <div class="field"><label>Tu prompt</label>
        <textarea id="${prefix}-text" rows="8" placeholder="Rol, contexto, objetivo, formato y restricciones…">${escapeHtml(value)}</textarea></div>
      <button class="btn btn-primary" type="button" data-upload-own-prompt="${escapeHtml(prefix)}">Guardar mi prompt</button>
    </div>`;
}

function refreshView() {
  window.dispatchEvent(new Event("app:refresh"));
}

export function bindOwnPromptUploads(root, data) {
  (root || document).querySelectorAll("[data-upload-own-prompt]").forEach((btn) => {
    if (btn.dataset.boundUpload === "1") return;
    btn.dataset.boundUpload = "1";
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-upload-own-prompt");
      const title = document.getElementById(p + "-title")?.value || "";
      const text = document.getElementById(p + "-text")?.value || "";
      const id = document.getElementById(p + "-id")?.value || "";
      const r = saveOwnPrompt({ title, text, source: p, id });
      if (r.error) {
        toast(r.error);
        return;
      }
      toast("Prompt guardado. Ya está en Biblioteca → Tus prompts.");
      checkBadges(data);
      refreshView();
    });
  });
}

export function renderLibrary(data) {
  const mine = getState().progress.library.custom || [];
  const custom =
    mine
      .map(
        (t) => `<div class="card">
        <h3>${escapeHtml(t.title)}</h3>
        <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" data-copy-custom="${escapeHtml(t.id)}">Copiar</button>
          <button class="btn" type="button" data-edit-custom="${escapeHtml(t.id)}">Editar</button>
          <button class="btn btn-ghost" type="button" data-del-custom="${escapeHtml(t.id)}">Borrar</button>
        </div>
      </div>`
      )
      .join("") || `<p class="muted">Todavía no tienes prompts propios. Escríbelo arriba y pulsa Guardar mi prompt.</p>`;

  const seeds = data.library.templates
    .map(
      (t) => `<div class="card">
        <h3>${escapeHtml(t.title)}</h3>
        <p class="muted">${escapeHtml(t.useWhen)}</p>
        <p>${escapeHtml(t.hint)}</p>
        <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        <div class="btn-row">
          <button class="btn btn-primary" type="button" data-copy-id="${t.id}">Copiar plantilla</button>
          <button class="btn" type="button" data-clone-id="${t.id}">Guardar una copia mía</button>
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="page-head">
      <h2>Biblioteca de prompts</h2>
      <p>Primero crea el tuyo y guárdalo. Abajo hay plantillas del curso por si quieres una base.</p>
    </div>
    ${ownPromptBoxHtml({ prefix: "libown" })}
    <h3 style="margin-top:24px">Tus prompts (${mine.length})</h3>
    <div class="grid grid-2">${custom}</div>
    <h3 style="margin-top:24px">Plantillas del curso</h3>
    <div class="grid grid-2">${seeds}</div>
  `;
}

export function bindLibrary(data) {
  bindOwnPromptUploads(document, data);
  document.querySelectorAll("[data-copy-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = data.library.templates.find((x) => x.id === btn.dataset.copyId);
      if (t) copyText(t.text);
    });
  });
  document.querySelectorAll("[data-clone-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = data.library.templates.find((x) => x.id === btn.dataset.cloneId);
      if (!t) return;
      const r = saveOwnPrompt({ title: "Mío: " + t.title, text: t.text, source: "plantilla" });
      if (r.error) {
        toast(r.error);
        return;
      }
      toast("Copia guardada en Tus prompts. Edítala para que sea tuya.");
      checkBadges(data);
      refreshView();
    });
  });
  document.querySelectorAll("[data-copy-custom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = getState().progress.library.custom.find((x) => x.id === btn.dataset.copyCustom);
      if (t) copyText(t.text);
    });
  });
  document.querySelectorAll("[data-edit-custom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = getState().progress.library.custom.find((x) => x.id === btn.dataset.editCustom);
      if (!t) return;
      const idEl = document.getElementById("libown-id");
      const titleEl = document.getElementById("libown-title");
      const textEl = document.getElementById("libown-text");
      if (idEl) idEl.value = t.id;
      if (titleEl) titleEl.value = t.title;
      if (textEl) textEl.value = t.text;
      titleEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Edita arriba y pulsa Guardar mi prompt.");
    });
  });
  document.querySelectorAll("[data-del-custom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteOwnPrompt(btn.dataset.delCustom);
      toast("Prompt borrado.");
      refreshView();
    });
  });
}
