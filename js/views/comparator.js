import { getState, update, listLocalStudentSaves } from "../store.js";
import { escapeHtml, copyText, toast } from "../ui.js";
import { rubricHtml, readRubric, RUBRIC_AXES } from "../prompt-lab.js";
import { sectionAgent } from "../agents.js";
import { fetchAdminSaves, syncEnabled } from "../sync.js";
import { go } from "../router.js";

function clamp(n) {
  return Math.max(0, Math.min(5, n));
}

function count(re, t) {
  return (String(t).match(re) || []).length;
}

export function emptyCmpRun() {
  return {
    chatgptNotes: "",
    claudeNotes: "",
    scoresGpt: {},
    scoresClaude: {},
    winner: "",
    why: "",
  };
}

export function allComparatorCases(data) {
  const tasks = (data.activities?.chatTasks || []).map((t) => ({
    id: t.id,
    title: `Tarea ${t.n}: ${t.title}`,
    brief: t.do,
    prompt: t.prompt,
    look: t.look || "",
    group: "Tareas de clase",
    samples: null,
  }));
  const custom = [
    {
      id: "cmp-custom",
      title: "Mi prompt (cualquier texto)",
      brief: "Pega aquí el mismo prompt que usaste en ChatGPT y en Claude. Sirve para las 4 tareas, un correo de tu cargo o cualquier otro pedido.",
      prompt: "",
      look: "Las barras y el resumen se actualizan al escribir o pegar las dos respuestas.",
      group: "Libre",
      samples: null,
    },
  ];
  const extras = (data.comparator?.cases || []).map((c) => ({
    ...c,
    group: "Ejemplos del laboratorio",
  }));
  return [...tasks, ...custom, ...extras];
}

export function caseById(data, id) {
  const cases = allComparatorCases(data);
  return cases.find((c) => c.id === id) || cases[0];
}

function runFor(s, caseId) {
  const runs = s.runs && typeof s.runs === "object" ? s.runs : {};
  if (runs[caseId]) return { ...emptyCmpRun(), ...runs[caseId] };
  if (s.caseId === caseId || !s.caseId) {
    return {
      chatgptNotes: s.chatgptNotes || "",
      claudeNotes: s.claudeNotes || "",
      scoresGpt: s.scoresGpt || {},
      scoresClaude: s.scoresClaude || {},
      winner: s.winner || "",
      why: s.why || "",
    };
  }
  return emptyCmpRun();
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

export function pasteSnap(text) {
  const t = String(text || "").trim();
  if (!t) return { words: 0, paras: 0, lists: 0, hedges: 0, qs: 0 };
  return {
    words: t.split(/\s+/).filter(Boolean).length,
    paras: t.split(/\n+/).filter(Boolean).length,
    lists: count(/^[\s]*([-•*]|\d+[.)])/gm, t),
    hedges: count(/podr[ií]a|tal vez|si me confirmas|no invent|no especificado|verifica|borrador|antes de que lo env[ií]es|no me diste|no conozco/gi, t),
    qs: count(/\?/g, t),
  };
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
    return `<p class="muted">Pega las dos respuestas. Las barras se mueven en el momento: miden listas, cautela y si suena a plantilla, no quién «gana» la marca.</p>`;
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
  return `<div class="callout think"><strong>Lectura de este pegado (no es ranking de marcas).</strong> ${escapeHtml(who)}${escapeHtml(extra)} Elige abajo con tu criterio de negocio.</div>`;
}

function snapLine(label, snap, avgN) {
  const ready = snap.words > 0;
  return `<div class="cmp-live-card">
    <p class="muted">${escapeHtml(label)}</p>
    <p class="cmp-live-avg">${ready ? escapeHtml(String(avgN || "—")) : "—"}</p>
    <p>${ready ? `${snap.words} palabras · ${snap.lists} listas · ${snap.hedges ? "marca huecos" : "poco cauto"} · ${snap.qs} preguntas` : "Pega la respuesta"}</p>
  </div>`;
}

function liveHtml(gptText, claudeText, gptScores, claudeScores) {
  return `<div class="cmp-live" id="cmp-live">
    ${snapLine("ChatGPT ahora", pasteSnap(gptText), avg(gptScores))}
    ${snapLine("Claude ahora", pasteSnap(claudeText), avg(claudeScores))}
  </div>`;
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
  const gptText = document.getElementById("gpt-notes")?.value || "";
  const claudeText = document.getElementById("claude-notes")?.value || "";
  const fromPaste = {
    gpt: scoreFromPaste(gptText),
    claude: scoreFromPaste(claudeText),
  };
  const g = Object.values(gpt).some((v) => v) ? gpt : fromPaste.gpt;
  const c = Object.values(claude).some((v) => v) ? claude : fromPaste.claude;
  box.innerHTML = insightHtml(g, c);
  const live = document.getElementById("cmp-live");
  if (live) live.outerHTML = liveHtml(gptText, claudeText, fromPaste.gpt, fromPaste.claude);
}

function optionsHtml(cases, selectedId) {
  const groups = [];
  for (const c of cases) {
    const last = groups[groups.length - 1];
    if (!last || last.label !== c.group) groups.push({ label: c.group, items: [c] });
    else last.items.push(c);
  }
  return groups
    .map(
      (g) =>
        `<optgroup label="${escapeHtml(g.label)}">${g.items
          .map((c) => `<option value="${escapeHtml(c.id)}" ${c.id === selectedId ? "selected" : ""}>${escapeHtml(c.title)}</option>`)
          .join("")}</optgroup>`
    )
    .join("");
}

export function renderComparator(data, routeCaseId) {
  const s = getState().progress.comparator || {};
  const cases = allComparatorCases(data);
  const wanted = routeCaseId || s.caseId || cases[0].id;
  const selected = caseById(data, wanted);
  const run = runFor(s, selected.id);
  const gptScores = Object.keys(run.scoresGpt || {}).length ? run.scoresGpt : scoreFromPaste(run.chatgptNotes);
  const claudeScores = Object.keys(run.scoresClaude || {}).length ? run.scoresClaude : scoreFromPaste(run.claudeNotes);
  const pack = selected.samples || {};
  const isCustom = selected.id === "cmp-custom";
  const promptVal = isCustom ? s.customPrompt || "" : selected.prompt || "";
  const hasSamples = !!(pack.chatgpt && pack.claude);
  const inst = !!getState().profile.isInstructor;

  const promptBlock = isCustom
    ? `<div class="field"><label>Tu prompt (el mismo en los dos chats)</label>
        <textarea id="cmp-prompt-edit" rows="8" placeholder="Pega cualquier prompt: una tarea de clase, un correo de tu cargo (sin datos reales), un resumen…">${escapeHtml(promptVal)}</textarea></div>`
    : `<pre class="prompt-preview show" id="cmp-prompt-text">${escapeHtml(promptVal)}</pre>`;

  const sampleBtns = hasSamples
    ? `<button class="btn" type="button" id="load-gpt-ex">Cargar ejemplo típico ChatGPT</button>
       <button class="btn" type="button" id="load-claude-ex">Cargar ejemplo típico Claude</button>
       <button class="btn" type="button" id="load-both-ex">Cargar ambos ejemplos</button>`
    : `<p class="muted" style="margin:0">En las tareas y en tu prompt: pega aquí lo que te devolvieron los dos chats. No hay ejemplo precargado a propósito.</p>`;

  return `
    <div class="page-head">
      <h2>Comparador ChatGPT vs Claude</h2>
      <p>${escapeHtml(data.comparator.intro || "")} Sirve para <strong>cualquier prompt</strong>: las 4 tareas, un caso de tu cargo o texto libre. Pega las dos respuestas y el comparativo se actualiza al instante en este navegador.</p>
    </div>
    ${sectionAgent(data, "comparator")}
    <div class="card">
      <div class="field"><label>Qué estás comparando</label>
        <select id="cmp-case">${optionsHtml(cases, selected.id)}</select></div>
      <h3>${escapeHtml(selected.title)}</h3>
      <p>${escapeHtml(selected.brief)}</p>
      ${selected.look ? `<p><strong>Qué mirar:</strong> ${escapeHtml(selected.look)}</p>` : ""}
      ${promptBlock}
      <div class="btn-row">
        <button class="btn btn-primary" type="button" id="copy-cmp">Copiar prompt</button>
        <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Abrir ChatGPT</a>
        <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Abrir Claude</a>
        ${sampleBtns}
      </div>
      ${liveHtml(run.chatgptNotes, run.claudeNotes, gptScores, claudeScores)}
      <div class="grid grid-2" style="margin-top:16px">
        <div>
          <p class="muted">${escapeHtml(pack.chatgpt?.read || "Pega aquí la respuesta de ChatGPT (mismo prompt).")}</p>
          <div class="field"><label>Respuesta ChatGPT</label>
            <textarea id="gpt-notes" rows="10" placeholder="Ctrl+V la respuesta de ChatGPT">${escapeHtml(run.chatgptNotes)}</textarea></div>
        </div>
        <div>
          <p class="muted">${escapeHtml(pack.claude?.read || "Pega aquí la respuesta de Claude (mismo prompt).")}</p>
          <div class="field"><label>Respuesta Claude</label>
            <textarea id="claude-notes" rows="10" placeholder="Ctrl+V la respuesta de Claude">${escapeHtml(run.claudeNotes)}</textarea></div>
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
          <option value="chatgpt" ${run.winner === "chatgpt" ? "selected" : ""}>ChatGPT (en este caso)</option>
          <option value="claude" ${run.winner === "claude" ? "selected" : ""}>Claude (en este caso)</option>
          <option value="tie" ${run.winner === "tie" ? "selected" : ""}>Útiles de forma distinta</option>
        </select>
      </div>
      <div class="field"><label>Por qué (criterio de negocio, no de fandom)</label><textarea id="why">${escapeHtml(run.why)}</textarea></div>
      <button class="btn btn-primary" type="button" id="save-cmp">Guardar esta comparación</button>
    </div>
    ${
      inst
        ? `<div class="card" id="cmp-aula-card">
      <h3>Aula (solo instructor)</h3>
      <p class="muted">Quién ya pegó o eligió en el comparador. Se actualiza solo si hay servidor de avances o si trabajaron en esta PC.</p>
      <div id="cmp-aula"><p class="muted">Cargando…</p></div>
    </div>`
        : ""
    }
  `;
}

function winnerLabel(w) {
  if (w === "chatgpt") return "ChatGPT";
  if (w === "claude") return "Claude";
  if (w === "tie") return "Distintos";
  return "Sin elegir";
}

function aulaRowsFromLocal() {
  return listLocalStudentSaves().map((u) => {
    const raw = (() => {
      try {
        return JSON.parse(localStorage.getItem("aiBusinessLab.user." + u.id) || "{}");
      } catch {
        return {};
      }
    })();
    const c = raw.progress?.comparator || {};
    return {
      name: u.name,
      username: u.id,
      caseId: c.caseId || "",
      winner: c.winner || "",
      gpt: (c.chatgptNotes || "").trim().length,
      claude: (c.claudeNotes || "").trim().length,
      at: u.last,
    };
  });
}

function paintAula(rows, err) {
  const box = document.getElementById("cmp-aula");
  if (!box) return;
  if (err) {
    box.innerHTML = `<p class="muted">${escapeHtml(err)}</p>`;
    return;
  }
  if (!rows.length) {
    box.innerHTML = `<p class="muted">Aún no hay comparaciones de alumnos en esta vista.</p>`;
    return;
  }
  box.innerHTML = `<table class="data-table"><thead><tr><th>Alumno</th><th>Caso</th><th>ChatGPT</th><th>Claude</th><th>Elige</th></tr></thead><tbody>${rows
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.name)}</td><td><code>${escapeHtml(r.caseId || "—")}</code></td><td>${r.gpt ? "sí" : "no"}</td><td>${r.claude ? "sí" : "no"}</td><td>${escapeHtml(winnerLabel(r.winner))}</td></tr>`
    )
    .join("")}</tbody></table>`;
}

async function refreshAulaBoard() {
  if (!document.getElementById("cmp-aula")) return;
  const local = aulaRowsFromLocal();
  if (!syncEnabled()) {
    paintAula(local);
    return;
  }
  const r = await fetchAdminSaves();
  if (r.error || !r.saves?.length) {
    paintAula(local, r.error && !local.length ? "Sin servidor o sin copias. Se muestra lo de esta PC." : "");
    if (local.length) paintAula(local);
    return;
  }
  const cloud = r.saves.map((s) => ({
    name: s.name,
    username: s.username,
    caseId: s.comparator?.caseId || "",
    winner: s.comparator?.winner || "",
    gpt: s.comparator?.gptChars || 0,
    claude: s.comparator?.claudeChars || 0,
    at: s.updatedAt,
  }));
  const byUser = new Map();
  for (const row of [...local, ...cloud]) {
    const key = row.username || row.name;
    const prev = byUser.get(key);
    if (!prev || (row.at || 0) >= (prev.at || 0)) byUser.set(key, row);
  }
  paintAula([...byUser.values()]);
}

export function bindComparator(data, routeCaseId) {
  const cases = allComparatorCases(data);
  if (routeCaseId && cases.some((c) => c.id === routeCaseId) && getState().progress.comparator.caseId !== routeCaseId) {
    update((st) => {
      st.progress.comparator.caseId = routeCaseId;
    });
  } else if (!getState().progress.comparator.caseId && cases[0]) {
    update((st) => {
      st.progress.comparator.caseId = cases[0].id;
    });
  }

  const currentCaseId = () => document.getElementById("cmp-case")?.value || getState().progress.comparator.caseId;

  const persist = (autoScores, caseIdOverride) => {
    const caseId = caseIdOverride || getState().progress.comparator.caseId || currentCaseId();
    update((st) => {
      st.progress.comparator = st.progress.comparator || {};
      st.progress.comparator.runs = st.progress.comparator.runs || {};
      const notes = {
        chatgptNotes: document.getElementById("gpt-notes")?.value || "",
        claudeNotes: document.getElementById("claude-notes")?.value || "",
        scoresGpt: autoScores?.gpt || readRubric(document, "gpt"),
        scoresClaude: autoScores?.claude || readRubric(document, "claude"),
        winner: document.getElementById("winner")?.value || "",
        why: document.getElementById("why")?.value || "",
      };
      const edit = document.getElementById("cmp-prompt-edit");
      if (edit) st.progress.comparator.customPrompt = edit.value;
      st.progress.comparator.caseId = caseId;
      st.progress.comparator.runs[caseId] = { ...emptyCmpRun(), ...st.progress.comparator.runs[caseId], ...notes };
      Object.assign(st.progress.comparator, notes);
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

  const selectedCase = () => caseById(data, currentCaseId());

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
    const next = e.target.value;
    const prev = getState().progress.comparator.caseId || cases[0].id;
    persist(undefined, prev);
    update((st) => {
      st.progress.comparator.caseId = next;
      const run = runFor(st.progress.comparator, next);
      st.progress.comparator.chatgptNotes = run.chatgptNotes;
      st.progress.comparator.claudeNotes = run.claudeNotes;
      st.progress.comparator.scoresGpt = run.scoresGpt;
      st.progress.comparator.scoresClaude = run.scoresClaude;
      st.progress.comparator.winner = run.winner;
      st.progress.comparator.why = run.why;
    });
    go(`/comparador/${next}`);
  });
  document.getElementById("copy-cmp")?.addEventListener("click", () => {
    const custom = document.getElementById("cmp-prompt-edit");
    copyText(custom ? custom.value : document.getElementById("cmp-prompt-text")?.innerText || "");
  });
  document.getElementById("load-gpt-ex")?.addEventListener("click", () => loadSample("gpt"));
  document.getElementById("load-claude-ex")?.addEventListener("click", () => loadSample("claude"));
  document.getElementById("load-both-ex")?.addEventListener("click", () => loadSample("both"));
  document.getElementById("gpt-notes")?.addEventListener("input", onPaste);
  document.getElementById("claude-notes")?.addEventListener("input", onPaste);
  document.getElementById("cmp-prompt-edit")?.addEventListener("input", () => persist());
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
    const run = runFor(s, s.caseId);
    if (!run.winner || String(run.why || "").trim().length < 12) {
      toast("Elige una opción y explica por qué para este caso.");
      return;
    }
    toast("Comparación guardada. Puedes cambiar de tarea o de prompt sin perder este pegado.");
  });
  document.getElementById("winner")?.addEventListener("change", () => persist());
  document.getElementById("why")?.addEventListener("input", () => persist());

  refreshAulaBoard();
  if (document.getElementById("cmp-aula")) {
    window.clearInterval(window.__cmpAulaTimer);
    window.__cmpAulaTimer = window.setInterval(refreshAulaBoard, 8000);
  }
}
