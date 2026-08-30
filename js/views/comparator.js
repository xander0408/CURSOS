import { getState, update } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { rubricHtml, readRubric, RUBRIC_AXES } from "../prompt-lab.js";
import { sectionAgent } from "../agents.js";

function clamp(n) {
  return Math.max(1, Math.min(5, n));
}

function scoreFromPaste(text) {
  const t = String(text || "").trim();
  if (!t) return { clarity: 1, precision: 1, structure: 1, creativity: 1, utility: 1, compliance: 1 };
  const len = t.length;
  const paras = t.split(/\n+/).filter(Boolean).length;
  const hasNum = /\d/.test(t);
  const hasList = /[-*•]|\d+[.)]/.test(t);
  const words = t.split(/\s+/).length;
  const clarity = clamp(1 + Math.round(Math.min(words, 180) / 45) + (paras > 1 ? 1 : 0));
  const precision = clamp(2 + (hasNum ? 1 : 0) + (words > 40 ? 1 : 0));
  const structure = clamp(1 + (hasList ? 2 : 0) + (paras > 2 ? 1 : 0));
  const creativity = clamp(2 + (len > 280 ? 1 : 0));
  const utility = clamp(1 + Math.round(Math.min(len, 900) / 220));
  const compliance = clamp(2 + (t.length > 80 ? 1 : 0) + (paras >= 1 ? 1 : 0));
  return { clarity, precision, structure, creativity, utility, compliance };
}

function barsHtml(name, scores) {
  return `<div class="cmp-bars" data-bars="${name}">
    ${RUBRIC_AXES.map((a) => {
      const v = scores[a.id] || 1;
      const pct = (v / 5) * 100;
      return `<div class="cmp-bar-row"><span>${escapeHtml(a.label)}</span>
        <div class="cmp-bar"><i style="width:${pct}%"></i></div>
        <b data-bar-n="${name}-${a.id}">${v}</b></div>`;
    }).join("")}
  </div>`;
}

function applyScoresToUi(prefix, scores) {
  RUBRIC_AXES.forEach((a) => {
    const input = document.querySelector(`input[data-rubric="${prefix}"][data-axis="${a.id}"]`);
    if (input) input.value = String(scores[a.id] || 1);
    const n = document.querySelector(`[data-bar-n="${prefix}-${a.id}"]`);
    if (n) n.textContent = String(scores[a.id] || 1);
    const bar = n?.parentElement?.querySelector(".cmp-bar i");
    if (bar) bar.style.width = `${((scores[a.id] || 1) / 5) * 100}%`;
    const span = document.querySelector(`[data-rubric-val="${prefix}-${a.id}"]`);
    if (span) span.textContent = String(scores[a.id] || 1);
  });
}

export function renderComparator(data) {
  const s = getState().progress.comparator;
  const cases = data.comparator.cases;
  const unlocked = getState().settings.instructorUnlocked || getState().profile.isInstructor;
  const selected = cases.find((c) => c.id === s.caseId) || cases[0];
  const opts = cases
    .map((c) => `<option value="${c.id}" ${c.id === selected.id ? "selected" : ""}>${escapeHtml(c.title)}</option>`)
    .join("");
  const gptScores = Object.keys(s.scoresGpt || {}).length ? s.scoresGpt : scoreFromPaste(s.chatgptNotes);
  const claudeScores = Object.keys(s.scoresClaude || {}).length ? s.scoresClaude : scoreFromPaste(s.claudeNotes);

  return `
    <div class="page-head">
      <h2>Comparador ChatGPT vs Claude</h2>
      <p>Copia el prompt, pégalo en cada herramienta y pega aquí las respuestas. Las barras se actualizan solas.</p>
    </div>
    ${sectionAgent(data, "comparator")}
    <div class="card">
      ${unlocked ? `<div class="field"><label>Caso</label><select id="cmp-case">${opts}</select></div>` : `<p class="muted">Caso: <strong>${escapeHtml(selected.title)}</strong></p>`}
      <h3>${escapeHtml(selected.title)}</h3>
      <p>${escapeHtml(selected.brief)}</p>
      <pre class="prompt-preview show" id="cmp-prompt-text">${escapeHtml(selected.prompt)}</pre>
      <button class="btn btn-primary" type="button" id="copy-cmp">Copiar prompt</button>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="field"><label>Pega la respuesta de ChatGPT</label><textarea id="gpt-notes" rows="8">${escapeHtml(s.chatgptNotes)}</textarea></div>
        <div class="field"><label>Pega la respuesta de Claude</label><textarea id="claude-notes" rows="8">${escapeHtml(s.claudeNotes)}</textarea></div>
      </div>
      <div class="grid grid-2">
        <div><h3>ChatGPT</h3>${barsHtml("gpt", gptScores)}${rubricHtml("gpt", gptScores)}</div>
        <div><h3>Claude</h3>${barsHtml("claude", claudeScores)}${rubricHtml("claude", claudeScores)}</div>
      </div>
      <div class="field"><label>Cual te sirve mas en este caso</label>
        <select id="winner">
          <option value="">Selecciona</option>
          <option value="chatgpt" ${s.winner === "chatgpt" ? "selected" : ""}>ChatGPT (en este caso)</option>
          <option value="claude" ${s.winner === "claude" ? "selected" : ""}>Claude (en este caso)</option>
          <option value="tie" ${s.winner === "tie" ? "selected" : ""}>Utiles de forma distinta</option>
        </select>
      </div>
      <div class="field"><label>Por que (criterio de negocio)</label><textarea id="why">${escapeHtml(s.why)}</textarea></div>
      <button class="btn btn-primary" type="button" id="save-cmp">Guardar comparacion</button>
    </div>
  `;
}

export function bindComparator(data) {
  const persist = (autoScores) => {
    update((st) => {
      st.progress.comparator.chatgptNotes = document.getElementById("gpt-notes").value;
      st.progress.comparator.claudeNotes = document.getElementById("claude-notes").value;
      st.progress.comparator.scoresGpt = autoScores?.gpt || readRubric(document, "gpt");
      st.progress.comparator.scoresClaude = autoScores?.claude || readRubric(document, "claude");
      st.progress.comparator.winner = document.getElementById("winner").value;
      st.progress.comparator.why = document.getElementById("why").value;
    });
  };

  const onPaste = () => {
    const gpt = scoreFromPaste(document.getElementById("gpt-notes").value);
    const claude = scoreFromPaste(document.getElementById("claude-notes").value);
    applyScoresToUi("gpt", gpt);
    applyScoresToUi("claude", claude);
    persist({ gpt, claude });
  };

  document.getElementById("cmp-case")?.addEventListener("change", (e) => {
    update((st) => {
      st.progress.comparator.caseId = e.target.value;
    });
    window.dispatchEvent(new Event("app:refresh"));
  });
  document.getElementById("copy-cmp")?.addEventListener("click", () => {
    const raw = document.getElementById("cmp-prompt-text")?.innerText || "";
    copyText(raw);
  });
  document.getElementById("gpt-notes")?.addEventListener("input", onPaste);
  document.getElementById("claude-notes")?.addEventListener("input", onPaste);
  document.querySelectorAll("input[data-rubric]").forEach((el) => {
    el.addEventListener("input", () => {
      const name = el.dataset.rubric;
      const scores = readRubric(document, name);
      applyScoresToUi(name, scores);
      persist();
    });
  });
  document.getElementById("save-cmp")?.addEventListener("click", () => {
    persist();
    const s = getState().progress.comparator;
    if (!s.winner || s.why.trim().length < 12) {
      toast("Elige una opcion y explica por que para este caso.");
      return;
    }
    toast("Comparacion guardada.");
  });
  document.getElementById("winner")?.addEventListener("change", () => persist());
  document.getElementById("why")?.addEventListener("input", () => persist());
}
