import { getState, update } from "../store.js";
import { frameworkForm, readFramework } from "../prompt-lab.js";
import { assemblePrompt } from "../challenge-engine.js";
import { copyText, toast } from "../ui.js";
import { checkBadges } from "../badges.js";

export function renderPromptLab(data) {
  const draft = getState().progress.promptLab.drafts[0] || {};
  return `
    <div class="page-head">
      <h2>Prompt Lab</h2>
      <p>Construye ROL + CONTEXTO + OBJETIVO + FORMATO + RESTRICCIONES. El texto listo para copiar aparece cuando las piezas están pensadas, no antes.</p>
    </div>
    <div class="card" id="lab-root">
      ${frameworkForm(draft)}
      <div class="btn-row">
        <button class="btn" type="button" id="save-lab">Guardar en biblioteca</button>
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
      s.progress.promptLab.drafts = [fw];
    });
  };
  root.querySelectorAll("[data-fw]").forEach((el) => el.addEventListener("input", saveDraft));
  root.querySelector("[data-action='preview-prompt']")?.addEventListener("click", () => {
    const fw = readFramework(root);
    const pre = root.querySelector("[data-assembled]");
    pre.textContent = assemblePrompt(fw);
    pre.classList.add("show");
    root.querySelector("[data-action='copy-prompt']").disabled = !Object.values(fw).every((v) => v.trim().length > 8);
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
      s.progress.library.custom.push({
        id: "c" + Date.now(),
        title: (fw.objective || "Prompt").slice(0, 60),
        text,
        framework: fw,
        savedAt: Date.now(),
      });
    });
    toast("Guardado en tu biblioteca.");
    checkBadges(data);
  });
}
