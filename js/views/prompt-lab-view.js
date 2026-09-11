import { getState, update, saveOwnPrompt } from "../store.js";
import { frameworkForm, readFramework } from "../prompt-lab.js";
import { assemblePrompt } from "../challenge-engine.js";
import { copyText, toast, escapeHtml } from "../ui.js";
import { checkBadges } from "../badges.js";
import { sectionAgent } from "../agents.js";

export function renderPromptLab(data) {
  const draft = getState().progress.promptLab?.drafts?.[0] || {};
  const mine = getState().progress.library?.custom || [];
  const saved =
    mine
      .map(
        (t) => `<div class="card">
          <h3>${escapeHtml(t.title)}</h3>
          <pre class="prompt-preview show">${escapeHtml(t.text)}</pre>
        </div>`
      )
      .join("") || `<p class="muted">Cuando completes las cinco piezas, pulsa Guardar mi prompt.</p>`;
  return `
    <div class="page-head">
      <h2>Prompt Lab</h2>
      <p>Arma las cinco piezas, pulsa <strong>Guardar mi prompt</strong> y queda en tu biblioteca. Cada alumno guarda los suyos.</p>
    </div>
    ${sectionAgent(data, "promptLab")}
    <div class="card" id="lab-root">
      ${frameworkForm(draft)}
      <div class="btn-row">
        <button class="btn btn-primary" type="button" id="save-lab">Guardar mi prompt</button>
        <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Probar en ChatGPT</a>
        <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Probar en Claude</a>
        <a class="btn" href="#/biblioteca">Ver mis prompts</a>
      </div>
    </div>
    <h3 style="margin-top:24px">Tus prompts guardados (${mine.length})</h3>
    <div class="grid grid-2">${saved}</div>
  `;
}

export function bindPromptLab(data) {
  const root = document.getElementById("lab-root");
  if (!root) return;
  const saveDraft = () => {
    const fw = readFramework(root);
    update((s) => {
      s.progress.promptLab = s.progress.promptLab || { drafts: [], savedPrompts: [] };
      s.progress.promptLab.drafts = [fw];
    });
  };
  root.querySelectorAll("[data-fw]").forEach((el) =>
    el.addEventListener("input", () => {
      saveDraft();
      const fw = readFramework(root);
      const pre = root.querySelector("[data-assembled]");
      if (pre) {
        pre.textContent = assemblePrompt(fw);
        pre.classList.add("show");
      }
    })
  );
  root.querySelector("[data-action='preview-prompt']")?.addEventListener("click", () => {
    const fw = readFramework(root);
    const pre = root.querySelector("[data-assembled]");
    pre.textContent = assemblePrompt(fw);
    pre.classList.add("show");
  });
  root.querySelector("[data-action='copy-prompt']")?.addEventListener("click", () => {
    copyText(assemblePrompt(readFramework(root)));
  });
  document.getElementById("save-lab")?.addEventListener("click", () => {
    const fw = readFramework(root);
    const text = assemblePrompt(fw);
    if (Object.values(fw).some((v) => !v.trim())) {
      toast("Completa las cinco piezas antes de guardar.");
      return;
    }
    const r = saveOwnPrompt({ title: fw.objective || "Mi prompt", text, source: "prompt-lab" });
    if (r.error) {
      toast(r.error);
      return;
    }
    update((s) => {
      s.progress.promptLab = s.progress.promptLab || { drafts: [], savedPrompts: [] };
      s.progress.promptLab.savedPrompts = s.progress.promptLab.savedPrompts || [];
      s.progress.promptLab.savedPrompts.push({ at: Date.now(), title: (fw.objective || "Prompt").slice(0, 60) });
    });
    toast("Prompt guardado. Ya está en Tus prompts.");
    checkBadges(data);
    window.dispatchEvent(new Event("app:refresh"));
  });
}
