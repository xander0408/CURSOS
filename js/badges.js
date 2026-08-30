import { getState, update } from "./store.js";
import { openModal, closeModal } from "./ui.js";

export function checkBadges(data) {
  const s = getState();
  const earned = [];
  const mods = s.progress.modules;
  const ch = s.progress.challenges;
  const allCh = [];
  for (const m of data.course.modules) {
    for (const c of data.modules[m.id].challenges || []) {
      allCh.push({ ...c, moduleId: m.id });
    }
  }

  const mDone = (id) => mods[id]?.status === "done";
  const libCount = (s.progress.library.custom?.length || 0) + (s.progress.library.savedIds?.length || 0);
  const thinkN = allCh.filter(
    (c) =>
      (c.type === "evaluate-ai" || c.type === "detect-error") && ch[c.id]?.status === "done"
  ).length;
  const factOk = allCh.filter(
    (c) => c.moduleId === "m7" && c.type === "detect-error" && ch[c.id]?.status === "done" && (ch[c.id]?.score || 0) >= 70
  ).length;
  const allMods = data.course.modules.every((m) => mDone(m.id));
  const fiche = s.progress.project.ficheReady;

  const rules = {
    explorer: mDone("m0") && mDone("m1"),
    "prompt-builder": libCount >= 3 || (mDone("m2") && mDone("m3")),
    thinker: thinkN >= 3,
    analyst: mDone("m5"),
    writer: mDone("m4"),
    presenter: mDone("m6"),
    "fact-checker": factOk >= 1,
    master: allMods && fiche,
  };

  for (const badge of data.badges) {
    if (rules[badge.id] && !s.progress.badges[badge.id]) {
      earned.push(badge);
      update((st) => {
        st.progress.badges[badge.id] = { earnedAt: Date.now() };
      });
    }
  }

  if (earned.length) {
    const b = earned[0];
    openModal(`
      <h3 style="margin-top:0">${b.icon} ${b.name}</h3>
      <p class="muted">${b.why}</p>
      <div class="btn-row"><button class="btn btn-primary" type="button" id="modal-ok">Continuar</button></div>
    `);
    document.getElementById("modal-ok").onclick = closeModal;
  }
  return earned;
}
