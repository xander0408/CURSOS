import { getState, getModule, readModule, markLessonDone, saveChallengeResult, completeModule, recountChallenges } from "../store.js";
import { activaBar, progressBar, pillForDifficulty, renderBlocks, escapeHtml, copyText, toast } from "../ui.js";
import { evaluate, xpFor, assemblePrompt } from "../challenge-engine.js";
import { frameworkForm, readFramework, rubricHtml, readRubric } from "../prompt-lab.js";
import { checkBadges } from "../badges.js";
import { sectionAgent } from "../agents.js";

export function moduleProgress(full) {
  const st = readModule(full.id);
  const lessons = full.lessons || [];
  const challenges = full.challenges || [];
  const chState = getState().progress.challenges;
  const lessonsDone = st.lessonsDone.length;
  const chDone = challenges.filter((c) => chState[c.id]?.status === "done").length;

  // Progreso = (lecciones hechas + retos hechos) / (total de lecciones + total de retos).
  // Asi, un modulo sin retos depende solo de sus lecciones y no aporta un 50% fantasma.
  const totalItems = lessons.length + challenges.length;
  const doneItems = lessonsDone + chDone;
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  const scores = challenges.map((c) => chState[c.id]?.score ?? 0);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const complete = lessons.every((l) => st.lessonsDone.includes(l.id)) && challenges.every((c) => chState[c.id]?.status === "done");
  return { pct, avg, complete, chDone, lessonDone: lessonsDone };
}

function maybeComplete(data, full) {
  const p = moduleProgress(full);
  if (p.complete) completeModule(full.id, p.avg);
  recountChallenges();
  checkBadges(data);
}

export function renderModule(data, params) {
  const full = data.modules[params.moduleId];
  if (!full) return `<div class="page-head"><h2>Módulo no encontrado</h2></div>`;
  const kind = params.kind === "reto" ? "reto" : "leccion";
  if (kind === "reto") return renderChallenge(data, full, params.itemId);
  const lessonId = params.itemId || full.lessons[0]?.id;
  return renderLesson(data, full, lessonId);
}

function renderLesson(data, full, lessonId) {
  const idx = Math.max(0, full.lessons.findIndex((l) => l.id === lessonId));
  const lesson = full.lessons[idx];
  const p = moduleProgress(full);
  const notes = getState().settings.instructorUnlocked
    ? data.instructor.modules?.[full.id]?.lessons?.[lesson.id]
    : null;
  const phase = lesson.activaPhase ?? idx % 6;
  const prev = full.lessons[idx - 1];
  const next = full.lessons[idx + 1];
  const firstChallenge = full.challenges[0];

  return `
    <div class="page-head">
      <p class="muted">Módulo ${full.number} · Lección ${idx + 1} de ${full.lessons.length}</p>
      <h2>${escapeHtml(lesson.title)}</h2>
      <p>${escapeHtml(full.title)}</p>
    </div>
    ${activaBar(typeof phase === "number" ? phase : 0)}
    ${progressBar(p.pct)}
    <div class="card" style="margin-top:16px">
      ${renderBlocks(lesson.blocks)}
      ${notes ? `<div class="callout think"><strong>Nota del instructor</strong>${escapeHtml(notes)}</div>` : ""}
      <div class="lesson-nav">
        ${prev ? `<a class="btn" href="#/modulo/${full.id}/leccion/${prev.id}">Anterior</a>` : `<span></span>`}
        <button class="btn btn-primary" type="button" id="btn-continue" data-module="${full.id}" data-lesson="${lesson.id}" data-next="${next ? next.id : ""}" data-first-ch="${firstChallenge ? firstChallenge.id : ""}">Continuar</button>
      </div>
    </div>
  `;
}

export function renderChallenge(data, full, challengeId) {
  const ch = (full.challenges || []).find((c) => c.id === challengeId) || full.challenges[0];
  if (!ch) return `<p>No hay retos en este módulo.</p>`;
  const saved = getState().progress.challenges[ch.id];
  const submitted = saved?.status === "done";
  const idx = full.challenges.findIndex((c) => c.id === ch.id);
  const next = full.challenges[idx + 1];
  const notes = getState().settings.instructorUnlocked
    ? data.instructor.modules?.[full.id]?.challenges?.[ch.id]
    : null;

  return `
    <div class="page-head">
      <p class="muted">Módulo ${full.number} · Reto ${idx + 1} de ${full.challenges.length} · ${pillForDifficulty(ch.difficulty)}</p>
      <h2>${escapeHtml(ch.title)}</h2>
      <p><strong>Objetivo:</strong> ${escapeHtml(ch.objective)}</p>
    </div>
    ${activaBar(ch.activaPhase ?? 3)}
    <div class="card">
      <p>${escapeHtml(ch.instructions)}</p>
      ${ch.thinkFirst ? `<div class="callout think"><strong>Piensa primero</strong>${escapeHtml(ch.thinkFirst)}</div>` : ""}
      <div id="challenge-body">${challengeBody(ch, saved, submitted)}</div>
      ${notes && submitted ? `<div class="callout privacy"><strong>Criterios (instructor)</strong>${escapeHtml(notes)}</div>` : ""}
      <div class="feedback ${submitted ? "show" : ""} ${saved && saved.score >= 70 ? "ok" : "no"}" id="feedback">
        ${submitted ? feedbackHtml(ch, saved) : ""}
      </div>
      <div class="btn-row">
        ${submitted ? "" : `<button class="btn btn-primary" type="button" id="btn-submit">Enviar</button>`}
        ${submitted ? `<button class="btn" type="button" id="btn-retry">Intentar de nuevo</button>` : ""}
        ${submitted && next ? `<a class="btn btn-primary" href="#/modulo/${full.id}/reto/${next.id}">Siguiente reto</a>` : ""}
        ${submitted && !next ? `<a class="btn btn-primary" href="#/modulos">Volver a módulos</a>` : ""}
      </div>
    </div>
  `;

  queueMicrotask(() => bindChallenge(data, full, ch));
}

function challengeBody(ch, saved, submitted) {
  const ans = saved?.answers || {};
  if (ch.type === "mcq") {
    return ch.options
      .map(
        (o, i) =>
          `<button type="button" class="choice ${ans.selected === i ? "selected" : ""} ${
            submitted ? (i === ch.correctIndex ? "correct" : ans.selected === i ? "wrong" : "") : ""
          }" data-i="${i}" ${submitted ? "disabled" : ""}>${escapeHtml(o)}</button>`
      )
      .join("");
  }
  if (ch.type === "tf") {
    return ["Verdadero", "Falso"]
      .map((label, i) => {
        const val = i === 0;
        return `<button type="button" class="choice ${ans.selected === val ? "selected" : ""} ${
          submitted ? (val === ch.correct ? "correct" : ans.selected === val ? "wrong" : "") : ""
        }" data-tf="${val}" ${submitted ? "disabled" : ""}>${label}</button>`;
      })
      .join("");
  }
  if (ch.type === "order") {
    const items = ans.order
      ? ans.order.map((i) => ch.items[i])
      : [...ch.items];
    const order = ans.order || ch.items.map((_, i) => i);
    return `<p class="muted">Usa las flechas para ordenar los pasos.</p><ul class="order-list" id="order-list">
      ${items
        .map(
          (text, pos) =>
            `<li data-idx="${order[pos]}"><button type="button" data-up>↑</button><button type="button" data-down>↓</button><span>${escapeHtml(text)}</span></li>`
        )
        .join("")}
    </ul>`;
  }
  if (ch.type === "fill") {
    return `<div class="field"><label>${escapeHtml(ch.prompt || "Tu respuesta")}</label>
      <input ${submitted ? "disabled" : ""} id="fill-input" value="${escapeHtml(ans.text || "")}" /></div>`;
  }
  if (ch.type === "prompt-build") {
    return `
      ${ch.weakPrompt ? `<div class="callout limit"><strong>Solicitud deficiente</strong>${escapeHtml(ch.weakPrompt)}</div>` : ""}
      ${frameworkForm(ans.framework || {}, { reveal: submitted })}
      <div class="field"><label>Resume qué cambió y por qué (criterio, no copia)</label>
        <textarea id="prompt-why" ${submitted ? "disabled" : ""}>${escapeHtml(ans.why || "")}</textarea></div>
    `;
  }
  if (ch.type === "evaluate-ai") {
    return `
      <div class="callout limit"><strong>Salida de IA (simulada para el ejercicio)</strong><pre style="white-space:pre-wrap;font-size:13px">${escapeHtml(ch.aiOutput)}</pre></div>
      <p class="muted">Evalúa con criterio. No asumas que es correcta.</p>
      ${rubricHtml("eval", ans.scores)}
      <div class="field"><label>¿Qué verificarías antes de usarlo en el trabajo?</label>
        <textarea id="eval-notes" ${submitted ? "disabled" : ""}>${escapeHtml(ans.notes || "")}</textarea></div>
    `;
  }
  if (ch.type === "detect-error") {
    return `
      <div class="callout limit"><strong>Texto a revisar</strong><pre style="white-space:pre-wrap;font-size:13px">${escapeHtml(ch.aiOutput)}</pre></div>
      <p class="muted">Marca los problemas que detectes. La clave no se muestra hasta enviar.</p>
      ${(ch.candidates || [])
        .map(
          (c) =>
            `<label class="choice"><input type="checkbox" data-err="${c.id}" ${
              (ans.selectedIds || []).includes(c.id) ? "checked" : ""
            } ${submitted ? "disabled" : ""}/> ${escapeHtml(c.label)}</label>`
        )
        .join("")}
    `;
  }
  if (ch.type === "compare") {
    return `
      <p><strong>Utiliza exactamente este prompt en ChatGPT.</strong></p>
      <pre class="prompt-preview show">${escapeHtml(ch.sharedPrompt)}</pre>
      <button class="btn" type="button" data-copy="${escapeHtml(ch.sharedPrompt)}">Copiar prompt</button>
      <p style="margin-top:16px"><strong>Luego utiliza exactamente el mismo prompt en Claude.</strong></p>
      <div class="field"><label>Resultado o resumen — ChatGPT</label><textarea id="cmp-gpt">${escapeHtml(ans.gpt || "")}</textarea></div>
      <div class="field"><label>Resultado o resumen — Claude</label><textarea id="cmp-claude">${escapeHtml(ans.claude || "")}</textarea></div>
      <p class="muted">La plataforma no declara un ganador. Tú decides qué te sirve más en este caso.</p>
      ${rubricHtml("gpt", ans.scoresGpt)}
      <h3>Claude</h3>
      ${rubricHtml("claude", ans.scoresClaude)}
      <div class="field"><label>¿Cuál te sirve más para este caso y por qué?</label>
        <select id="cmp-winner">
          <option value="">Selecciona…</option>
          <option ${ans.winner === "chatgpt" ? "selected" : ""} value="chatgpt">ChatGPT (en este caso)</option>
          <option ${ans.winner === "claude" ? "selected" : ""} value="claude">Claude (en este caso)</option>
          <option ${ans.winner === "tie" ? "selected" : ""} value="tie">Útiles de forma distinta</option>
        </select>
        <textarea id="cmp-why" style="margin-top:8px">${escapeHtml(ans.why || "")}</textarea>
      </div>
    `;
  }
  if (ch.type === "case") {
    return `
      <div class="callout privacy"><strong>Situación laboral</strong>${escapeHtml(ch.scenario)}</div>
      ${ch.flow ? `<ol>${ch.flow.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` : ""}
      ${frameworkForm(ans.framework || {}, { reveal: submitted })}
      <div class="field"><label>Pega o resume el resultado de la IA</label>
        <textarea id="case-result">${escapeHtml(ans.result || "")}</textarea></div>
      <div class="field"><label>Revisión humana: ¿qué validaste o corregiste?</label>
        <textarea id="case-review">${escapeHtml(ans.review || "")}</textarea></div>
    `;
  }
  return `<p>Tipo de reto no soportado.</p>`;
}

function feedbackHtml(ch, saved) {
  const score = saved?.score ?? 0;
  let extra = escapeHtml(ch.explanation || "");
  if (saved?.answers?.framework && (ch.type === "prompt-build" || ch.type === "case")) {
    extra += `<pre class="prompt-preview show">${escapeHtml(assemblePrompt(saved.answers.framework))}</pre>`;
  }
  if (ch.type === "detect-error" && ch.rationale) extra += `<p>${escapeHtml(ch.rationale)}</p>`;
  return `<strong>${score >= 70 ? "Buen criterio" : "Revisa de nuevo"} · ${score}%</strong><p>${extra}</p>`;
}

function bindChallenge(data, full, ch) {
  const root = document.getElementById("challenge-body");
  if (!root) return;

  root.querySelectorAll(".choice[data-i]").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
  root.querySelectorAll(".choice[data-tf]").forEach((btn) => {
    btn.addEventListener("click", () => {
      root.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  const list = root.querySelector("#order-list");
  if (list) {
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      if (e.target.dataset.up && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
      if (e.target.dataset.down && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
    });
  }

  root.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", () => copyText(ch.sharedPrompt));
  });
  root.querySelectorAll("[data-action='preview-prompt']").forEach((b) => {
    b.addEventListener("click", () => {
      const fw = readFramework(root);
      const pre = root.querySelector("[data-assembled]");
      pre.textContent = assemblePrompt(fw);
      pre.classList.add("show");
    });
  });
  root.querySelectorAll("[data-action='copy-prompt']").forEach((b) => {
    b.addEventListener("click", () => copyText(assemblePrompt(readFramework(root))));
  });
  root.querySelectorAll("input[data-rubric]").forEach((el) => {
    el.addEventListener("input", () => {
      const span = root.querySelector(`[data-rubric-val="${el.dataset.rubric}-${el.dataset.axis}"]`);
      if (span) span.textContent = el.value;
    });
  });

  document.getElementById("btn-retry")?.addEventListener("click", () => {
    saveChallengeResult(ch.id, { score: getState().progress.challenges[ch.id].score, answers: null, xpDelta: 0, completed: false });
    window.dispatchEvent(new Event("app:refresh"));
  });

  document.getElementById("btn-submit")?.addEventListener("click", () => {
    const payload = collectPayload(ch, root);
    if (payload.error) {
      toast(payload.error);
      return;
    }
    const prevAttempts = getState().progress.challenges[ch.id]?.attempts || 0;
    const result = evaluate(ch, payload);
    const xpDelta = xpFor(ch, result, prevAttempts);
    saveChallengeResult(ch.id, {
      score: result.score,
      answers: payload,
      xpDelta,
      completed: true,
    });
    maybeComplete(data, full);
    window.dispatchEvent(new Event("app:refresh"));
  });
}

function collectPayload(ch, root) {
  if (ch.type === "mcq") {
    const sel = root.querySelector(".choice.selected");
    if (!sel) return { error: "Elige una opción antes de enviar." };
    return { selected: Number(sel.dataset.i) };
  }
  if (ch.type === "tf") {
    const sel = root.querySelector(".choice.selected");
    if (!sel) return { error: "Elige verdadero o falso." };
    return { selected: sel.dataset.tf === "true" };
  }
  if (ch.type === "order") {
    const order = [...root.querySelectorAll("#order-list li")].map((li) => Number(li.dataset.idx));
    return { order };
  }
  if (ch.type === "fill") {
    const text = document.getElementById("fill-input")?.value || "";
    if (!text.trim()) return { error: "Escribe una respuesta." };
    return { text };
  }
  if (ch.type === "prompt-build") {
    const framework = readFramework(root);
    const why = document.getElementById("prompt-why")?.value || "";
    if (Object.values(framework).some((v) => !String(v).trim()) || why.trim().length < 12) {
      return { error: "Completa las cinco piezas del framework y explica el cambio." };
    }
    return { framework, why, complete: true };
  }
  if (ch.type === "evaluate-ai") {
    const notes = document.getElementById("eval-notes")?.value || "";
    if (notes.trim().length < 12) return { error: "Describe qué verificarías." };
    return { scores: readRubric(root, "eval"), notes, complete: true };
  }
  if (ch.type === "detect-error") {
    const selectedIds = [...root.querySelectorAll("[data-err]:checked")].map((el) => el.dataset.err);
    if (!selectedIds.length) return { error: "Marca al menos un problema detectado." };
    return { selectedIds };
  }
  if (ch.type === "compare") {
    const gpt = document.getElementById("cmp-gpt")?.value || "";
    const claude = document.getElementById("cmp-claude")?.value || "";
    const winner = document.getElementById("cmp-winner")?.value || "";
    const why = document.getElementById("cmp-why")?.value || "";
    if (gpt.trim().length < 8 || claude.trim().length < 8 || !winner || why.trim().length < 12) {
      return { error: "Pega ambos resultados, elige una opción y explica por qué." };
    }
    return {
      gpt,
      claude,
      winner,
      why,
      scoresGpt: readRubric(root, "gpt"),
      scoresClaude: readRubric(root, "claude"),
      complete: true,
    };
  }
  if (ch.type === "case") {
    const framework = readFramework(root);
    const result = document.getElementById("case-result")?.value || "";
    const review = document.getElementById("case-review")?.value || "";
    if (Object.values(framework).some((v) => !String(v).trim()) || result.trim().length < 8 || review.trim().length < 8) {
      return { error: "Completa el prompt, el resultado y la revisión humana." };
    }
    return { framework, result, review, complete: true };
  }
  return { error: "No se pudo leer el reto." };
}

export function renderModulesIndex(data) {
  const cards = data.course.modules
    .map((m) => {
      const full = data.modules[m.id];
      const p = moduleProgress(full);
      return `<a class="card clickable" href="#/modulo/${m.id}/leccion/${full.lessons[0].id}" style="text-decoration:none;color:inherit">
        <div class="module-row">
          <div class="module-num">${m.number}</div>
          <div>
            <h3>${escapeHtml(m.title)}</h3>
            <p>${escapeHtml(m.subtitle)}</p>
            ${progressBar(p.pct)}
          </div>
          <span class="pill ${p.complete ? "ok" : ""}">${p.complete ? "Completado" : p.pct + "%"}</span>
        </div>
      </a>`;
    })
    .join("");
  return `
    <div class="page-head">
      <h2>Módulos</h2>
      <p>Nueve laboratorios. El ritmo de los dos viernes lo marca el instructor en sala. Puedes navegar todos.</p>
    </div>
    ${sectionAgent(data, "modules")}
    <div class="module-list">${cards}</div>
  `;
}
