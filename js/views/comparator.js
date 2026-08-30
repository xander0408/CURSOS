import { getState, update } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { rubricHtml, readRubric, RUBRIC_AXES } from "../prompt-lab.js";
import { sectionAgent } from "../agents.js";

function clamp(n) {
  return Math.max(0, Math.min(5, n));
}

function count(re, t) {
  return (String(t).match(re) || []).length;
}

/** Heurística de aula: no es un juez oficial; busca rasgos distintos, no la longitud sola. */
export function scoreFromPaste(text) {
  const t = String(text || "").trim();
  const empty = { clarity: 0, precision: 0, structure: 0, creativity: 0, utility: 0, compliance: 0 };
  if (!t) return empty;

  const words = t.split(/\s+/).filter(Boolean).length;
  const paras = t.split(/\n+/).filter(Boolean).length;
  const qs = count(/\?/g, t);
  const lists = count(/^[\s]*([-•*]|\d+[.)])/gm, t);
  const table = /\|.+\|/.test(t) || /asunto\s*:/i.test(t);
  const nums = count(/\d/g, t);
  const hedges = count(/podr[ií]a|tal vez|si me confirmas|no invent|no especificado|verifica|borrador|antes de que lo env[ií]es|no me diste|no conozco/gi, t);
  const template = count(/encantad|sin duda|perfecto para|estamos para servirle|no dudes en/gi, t);
  const forbidden = count(/reembolso total|mañana a las|garantizamos|seg[uú]n la ley \d/gi, t);

  const clarity = clamp(2 + (paras >= 2 ? 1 : 0) + (words > 40 && words < 280 ? 1 : 0) + (table ? 1 : 0) - (words > 420 ? 1 : 0));
  const precision = clamp(2 + (hedges ? 1 : 0) + (nums > 2 ? 1 : 0) - (forbidden ? 2 : 0) - (template ? 1 : 0));
  const structure = clamp(1 + (lists ? 2 : 0) + (table ? 1 : 0) + (paras > 3 ? 1 : 0));
  const creativity = clamp(2 + (qs >= 2 ? 1 : 0) + (template ? 0 : 1));
  const utility = clamp(2 + (lists || table ? 1 : 0) + (words > 50 ? 1 : 0) - (qs > 5 ? 1 : 0));
  const compliance = clamp(3 + (hedges ? 1 : 0) - (forbidden ? 2 : 0) - (template ? 1 : 0));

  return { clarity, precision, structure, creativity, utility, compliance };
}

function avg(scores) {
  const vals = RUBRIC_AXES.map((a) => Number(scores[a.id] || 0));
  const n = vals.filter((v) => v > 0).length;
  if (!n) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / n) * 10) / 10;
}

function insightHtml(gpt, claude) {
  const ga = avg(gpt);
  const ca = avg(claude);
  if (!ga && !ca) {
    return `<p class="muted">Pega las dos respuestas o carga los ejemplos típicos. Las barras no deben quedar iguales: miden rasgos distintos (listas, cautela, promesas de más).</p>`;
  }
  let who = "En este pegado, ambos sirven para cosas distintas.";
  if (ga - ca >= 0.6) who = "En este pegado, ChatGPT sale más usable de inmediato (estructura/listo para copiar). Revisa si prometió de más.";
  else if (ca - ga >= 0.6) who = "En este pegado, Claude sale más prudente (marca huecos y no cierra lo que no le diste). Revisa si se alargó de más.";
  const gptP = gpt.precision || 0;
  const clP = claude.precision || 0;
  const extra =
    gptP !== clP
      ? ` Precisión: ChatGPT ${gptP}/5 vs Claude ${clP}/5 (cautela vs plantilla).`
      : "";
  return `<div class="callout think"><strong>Lectura objetiva de este caso (no es ranking de marcas).</strong> ${escapeHtml(who)}${escapeHtml(extra)} Elige abajo con tu criterio de negocio.</div>`;
}

function barsHtml(name, scores) {
  return `<div class="cmp-bars" data-bars="${name}">
    ${RUBRIC_AXES.map((a) => {
      const v = Number(scores[a.id] || 0);
      const pct = (v / 5) * 100;
      return `<div class="cmp-bar-row"><span>${escapeHtml(a.label)}</span>
        <div class="cmp-bar"><i style="width:${pct}%"></i></div>
        <b data-bar-n="${name}-${a.id}">${v}</b></div>`;
    }).join("")}
    <p class="muted">Promedio: <strong data-avg="${name}">${avg(scores) || "—"}</strong></p>
  </div>`;
}

function applyScoresToUi(prefix, scores) {
  RUBRIC_AXES.forEach((a) => {
    const input = document.querySelector(`input[data-rubric="${prefix}"][data-axis="${a.id}"]`);
    if (input) input.value = String(Math.max(1, scores[a.id] || 1));
    const n = document.querySelector(`[data-bar-n="${prefix}-${a.id}"]`);
    if (n) n.textContent = String(scores[a.id] || 0);
    const bar = n?.parentElement?.querySelector(".cmp-bar i");
    if (bar) bar.style.width = `${((scores[a.id] || 0) / 5) * 100}%`;
    const span = document.querySelector(`[data-rubric-val="${prefix}-${a.id}"]`);
    if (span) span.textContent = String(scores[a.id] || 0);
  });
  const ael = document.querySelector(`[data-avg="${prefix}"]`);
  if (ael) ael.textContent = String(avg(scores) || "—");
}

function refreshInsight() {
  const box = document.getElementById("cmp-insight");
  if (!box) return;
  const gpt = readRubric(document, "gpt");
  const claude = readRubric(document, "claude");
  const fromPaste = {
    gpt: scoreFromPaste(document.getElementById("gpt-notes")?.value),
    claude: scoreFromPaste(document.getElementById("claude-notes")?.value),
  };
  const g = Object.values(gpt).some((v) => v) ? gpt : fromPaste.gpt;
  const c = Object.values(claude).some((v) => v) ? claude : fromPaste.claude;
  box.innerHTML = insightHtml(g, c);
}

export function renderComparator(data) {
  const s = getState().progress.comparator;
  const cases = data.comparator.cases;
  const selected = cases.find((c) => c.id === s.caseId) || cases[0];
  const opts = cases
    .map((c) => `<option value="${c.id}" ${c.id === selected.id ? "selected" : ""}>${escapeHtml(c.title)}</option>`)
    .join("");
  const gptScores = Object.keys(s.scoresGpt || {}).length ? s.scoresGpt : scoreFromPaste(s.chatgptNotes);
  const claudeScores = Object.keys(s.scoresClaude || {}).length ? s.scoresClaude : scoreFromPaste(s.claudeNotes);
  const pack = selected.samples || {};

  return `
    <div class="page-head">
      <h2>Comparador ChatGPT vs Claude</h2>
      <p>${escapeHtml(data.comparator.intro || "Mismo prompt, dos herramientas. Tú decides en este caso.")}</p>
    </div>
    ${sectionAgent(data, "comparator")}
    <div class="card">
      <div class="field"><label>Elige el caso (todos los participantes)</label>
        <select id="cmp-case">${opts}</select></div>
      <h3>${escapeHtml(selected.title)}</h3>
      <p>${escapeHtml(selected.brief)}</p>
      <pre class="prompt-preview show" id="cmp-prompt-text">${escapeHtml(selected.prompt)}</pre>
      <div class="btn-row">
        <button class="btn btn-primary" type="button" id="copy-cmp">Copiar prompt</button>
        <button class="btn" type="button" id="load-gpt-ex">Cargar ejemplo típico ChatGPT</button>
        <button class="btn" type="button" id="load-claude-ex">Cargar ejemplo típico Claude</button>
        <button class="btn" type="button" id="load-both-ex">Cargar ambos ejemplos</button>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div>
          <p class="muted">${escapeHtml(pack.chatgpt?.read || "")}</p>
          <div class="field"><label>Respuesta ChatGPT (pégala o usa el ejemplo)</label>
            <textarea id="gpt-notes" rows="10">${escapeHtml(s.chatgptNotes)}</textarea></div>
        </div>
        <div>
          <p class="muted">${escapeHtml(pack.claude?.read || "")}</p>
          <div class="field"><label>Respuesta Claude (pégala o usa el ejemplo)</label>
            <textarea id="claude-notes" rows="10">${escapeHtml(s.claudeNotes)}</textarea></div>
        </div>
      </div>
      <div id="cmp-insight">${insightHtml(gptScores, claudeScores)}</div>
      <div class="grid grid-2">
        <div><h3>ChatGPT</h3>${barsHtml("gpt", gptScores)}${rubricHtml("gpt", gptScores.clarity ? gptScores : { clarity: 1, precision: 1, structure: 1, creativity: 1, utility: 1, compliance: 1 })}</div>
        <div><h3>Claude</h3>${barsHtml("claude", claudeScores)}${rubricHtml("claude", claudeScores.clarity ? claudeScores : { clarity: 1, precision: 1, structure: 1, creativity: 1, utility: 1, compliance: 1 })}</div>
      </div>
      <div class="field"><label>Cuál te sirve más en este caso</label>
        <select id="winner">
          <option value="">Selecciona</option>
          <option value="chatgpt" ${s.winner === "chatgpt" ? "selected" : ""}>ChatGPT (en este caso)</option>
          <option value="claude" ${s.winner === "claude" ? "selected" : ""}>Claude (en este caso)</option>
          <option value="tie" ${s.winner === "tie" ? "selected" : ""}>Útiles de forma distinta</option>
        </select>
      </div>
      <div class="field"><label>Por qué (criterio de negocio, no de fandom)</label><textarea id="why">${escapeHtml(s.why)}</textarea></div>
      <button class="btn btn-primary" type="button" id="save-cmp">Guardar comparación</button>
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
    refreshInsight();
  };

  const onPaste = () => {
    const gpt = scoreFromPaste(document.getElementById("gpt-notes").value);
    const claude = scoreFromPaste(document.getElementById("claude-notes").value);
    applyScoresToUi("gpt", gpt);
    applyScoresToUi("claude", claude);
    persist({ gpt, claude });
  };

  const selectedCase = () => {
    const id = document.getElementById("cmp-case")?.value;
    return data.comparator.cases.find((c) => c.id === id) || data.comparator.cases[0];
  };

  const loadSample = (which) => {
    const pack = selectedCase().samples || {};
    if (which === "gpt" || which === "both") {
      const ex = pack.chatgpt;
      if (ex) {
        document.getElementById("gpt-notes").value = ex.text;
        applyScoresToUi("gpt", ex.scores);
      }
    }
    if (which === "claude" || which === "both") {
      const ex = pack.claude;
      if (ex) {
        document.getElementById("claude-notes").value = ex.text;
        applyScoresToUi("claude", ex.scores);
      }
    }
    persist({
      gpt: which !== "claude" ? pack.chatgpt?.scores : readRubric(document, "gpt"),
      claude: which !== "gpt" ? pack.claude?.scores : readRubric(document, "claude"),
    });
    toast("Ejemplos cargados. No sustituyen tu prueba en las pestañas reales.");
  };

  document.getElementById("cmp-case")?.addEventListener("change", (e) => {
    update((st) => {
      st.progress.comparator.caseId = e.target.value;
      st.progress.comparator.chatgptNotes = "";
      st.progress.comparator.claudeNotes = "";
      st.progress.comparator.scoresGpt = {};
      st.progress.comparator.scoresClaude = {};
      st.progress.comparator.winner = "";
      st.progress.comparator.why = "";
    });
    window.dispatchEvent(new Event("app:refresh"));
  });
  document.getElementById("copy-cmp")?.addEventListener("click", () => {
    copyText(document.getElementById("cmp-prompt-text")?.innerText || "");
  });
  document.getElementById("load-gpt-ex")?.addEventListener("click", () => loadSample("gpt"));
  document.getElementById("load-claude-ex")?.addEventListener("click", () => loadSample("claude"));
  document.getElementById("load-both-ex")?.addEventListener("click", () => loadSample("both"));
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
      toast("Elige una opción y explica por qué para este caso.");
      return;
    }
    toast("Comparación guardada.");
  });
  document.getElementById("winner")?.addEventListener("change", () => persist());
  document.getElementById("why")?.addEventListener("input", () => persist());
}
