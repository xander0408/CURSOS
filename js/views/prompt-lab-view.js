import { getState, update } from "../store.js";
import { frameworkForm, readFramework } from "../prompt-lab.js";
import { assemblePrompt } from "../challenge-engine.js";
import { copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";
import { sectionAgent } from "../agents.js";

export function renderPromptLab(data) {
  const draft = getState().progress.promptLab?.drafts?.[0] || {};
  return `
    <div class="page-head">
      <h2>Prompt Lab</h2>
      <p>Rol, contexto, objetivo, formato y restricciones. Copia el texto cuando esté listo.</p>
    </div>
    ${sectionAgent(data, "promptLab")}
    <div class="card" id="lab-root">
      ${frameworkForm(draft)}
      <div class="btn-row">
        <button class="btn btn-primary" type="button" id="save-lab">Sube tu prompt final al portal del curso</button>
        <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Probar en ChatGPT</a>
        <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Probar en Claude</a>
      </div>
    </div>
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
    update((s) => {
      s.progress.library.custom = s.progress.library.custom || [];
      s.progress.library.custom.push({
        id: "c" + Date.now(),
        title: (fw.objective || "Prompt").slice(0, 60),
        text,
        framework: fw,
        savedAt: Date.now(),
      });
      s.progress.promptLab.savedPrompts = s.progress.promptLab.savedPrompts || [];
      s.progress.promptLab.savedPrompts.push({ at: Date.now(), title: (fw.objective || "Prompt").slice(0, 60) });
    });
    toast("Prompt subido al portal. Lo ves en Biblioteca → Tus prompts.");
    checkBadges(data);
  });
}
