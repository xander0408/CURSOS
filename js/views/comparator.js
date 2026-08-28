import { getState, update } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { rubricHtml, readRubric } from "../prompt-lab.js";

export function renderComparator(data) {
  const s = getState().progress.comparator;
  const cases = data.comparator.cases;
  const unlocked = getState().settings.instructorUnlocked;
  const selected = cases.find((c) => c.id === s.caseId) || cases[0];
  const opts = cases
    .map((c) => `<option value="${c.id}" ${c.id === selected.id ? "selected" : ""}>${escapeHtml(c.title)}</option>`)
    .join("");

  return `
    <div class="page-head">
      <h2>Comparador ChatGPT vs Claude</h2>
      <p>Mismo prompt, dos herramientas. Tú eliges qué te sirve más <strong>en este caso</strong>. La app no declara un modelo superior.</p>
    </div>
    <div class="card">
      ${unlocked ? `<div class="field"><label>Caso (instructor)</label><select id="cmp-case">${opts}</select></div>` : `<p class="muted">Caso en curso: <strong>${escapeHtml(selected.title)}</strong></p>`}
      <h3>${escapeHtml(selected.title)}</h3>
      <p>${escapeHtml(selected.brief)}</p>
      <p><strong>Utiliza exactamente este prompt en ChatGPT.</strong></p>
      <pre class="prompt-preview show">${escapeHtml(selected.prompt)}</pre>
      <button class="btn" type="button" id="copy-cmp">Copiar prompt</button>
      <p style="margin-top:16px"><strong>Después, utiliza exactamente este prompt en Claude.</strong></p>
      <div class="grid grid-2">
        <div class="field"><label>Notas / resultado ChatGPT</label><textarea id="gpt-notes">${escapeHtml(s.chatgptNotes)}</textarea></div>
        <div class="field"><label>Notas / resultado Claude</label><textarea id="claude-notes">${escapeHtml(s.claudeNotes)}</textarea></div>
      </div>
      <div class="grid grid-2">
        <div><h3>ChatGPT</h3>${rubricHtml("gpt", s.scoresGpt)}</div>
        <div><h3>Claude</h3>${rubricHtml("claude", s.scoresClaude)}</div>
      </div>
      <div class="field"><label>¿Cuál te sirve más para este caso?</label>
        <select id="winner">
          <option value="">Selecciona…</option>
          <option value="chatgpt" ${s.winner === "chatgpt" ? "selected" : ""}>ChatGPT (en este caso)</option>
          <option value="claude" ${s.winner === "claude" ? "selected" : ""}>Claude (en este caso)</option>
          <option value="tie" ${s.winner === "tie" ? "selected" : ""}>Útiles de forma distinta</option>
        </select>
      </div>
      <div class="field"><label>¿Por qué? (criterio de negocio, no de marca)</label><textarea id="why">${escapeHtml(s.why)}</textarea></div>
      <button class="btn btn-primary" type="button" id="save-cmp">Guardar comparación</button>
    </div>
  `;
}

export function bindComparator(data) {
  const persist = () => {
    update((st) => {
      st.progress.comparator.chatgptNotes = document.getElementById("gpt-notes").value;
      st.progress.comparator.claudeNotes = document.getElementById("claude-notes").value;
      st.progress.comparator.scoresGpt = readRubric(document, "gpt");
      st.progress.comparator.scoresClaude = readRubric(document, "claude");
      st.progress.comparator.winner = document.getElementById("winner").value;
      st.progress.comparator.why = document.getElementById("why").value;
    });
  };
  document.getElementById("cmp-case")?.addEventListener("change", (e) => {
    update((st) => {
      st.progress.comparator.caseId = e.target.value;
    });
    window.dispatchEvent(new Event("app:refresh"));
  });
  document.getElementById("copy-cmp")?.addEventListener("click", () => {
    const id = getState().progress.comparator.caseId || data.comparator.cases[0].id;
    const c = data.comparator.cases.find((x) => x.id === id) || data.comparator.cases[0];
    copyText(c.prompt);
  });
  document.getElementById("save-cmp")?.addEventListener("click", () => {
    persist();
    const s = getState().progress.comparator;
    if (!s.winner || s.why.trim().length < 12) {
      toast("Elige una opción y explica por qué para este caso.");
      return;
    }
    toast("Comparación guardada. No hay ganador global.");
  });
  document.querySelectorAll("#gpt-notes, #claude-notes, #winner, #why, input[data-rubric]").forEach((el) => {
    el.addEventListener("change", persist);
  });
}
