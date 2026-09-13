import { escapeHtml } from "./ui.js";

function when(ts) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString("es-HN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function winnerLabel(w) {
  if (w === "chatgpt") return "ChatGPT";
  if (w === "claude") return "Claude";
  if (w === "tie") return "Distintos";
  return "—";
}

function titleOf(list, id, fallback) {
  const hit = (list || []).find((x) => x.id === id);
  return hit?.title || fallback || id;
}

function block(title, inner) {
  if (!inner) return "";
  return `<section class="dossier-block"><h4>${escapeHtml(title)}</h4>${inner}</section>`;
}

function pre(text) {
  const t = String(text || "").trim();
  if (!t) return `<p class="muted">Sin texto.</p>`;
  return `<pre class="dossier-pre">${escapeHtml(t)}</pre>`;
}

function answersHtml(answers) {
  if (answers == null || answers === "") return "";
  try {
    const raw = typeof answers === "string" ? answers : JSON.stringify(answers, null, 2);
    return pre(raw);
  } catch {
    return pre(String(answers));
  }
}

export function studentDossierHtml(r, data, { forPrint } = {}) {
  const mods = data?.course?.modules || [];
  const quizzes = data?.quizzes || [];
  const chats = data?.activities?.chatTasks || data?.activities?.items || [];
  const badges = data?.badges || [];
  const ku = r.knowUs || {};
  const fields = r.project?.fields || {};
  const notes = r.comparatorNotes || {};
  const draft = r.promptDraft || {};
  const logs = r.logs || [];
  const hasWork =
    !r.pending &&
    (r.updatedAt ||
      logs.length ||
      (r.prompts || []).length ||
      (r.quizScores || []).length ||
      (r.labChecks || []).length);

  const intro = `
    <p><strong>${escapeHtml(r.name || "Alumno")}</strong> · <code>${escapeHtml(r.username || "")}</code>
    ${r.role ? ` · ${escapeHtml(r.role)}` : ""}
    ${r.intro ? " · intro hecha" : ""}</p>
    <p class="muted">Último guardado: ${escapeHtml(when(r.updatedAt))} · ${r.modules || 0}/10 módulos · ${r.chatDone || 0}/${r.chatTotal || 9} tareas · ${r.ownPrompts || 0} prompts · quiz ${r.quizzes ? `${r.quizAvg}%` : "—"} · ${r.xp || 0} pts</p>
  `;

  if (!hasWork) {
    return `<article class="dossier-student">${intro}<p class="muted">Aún no hay recopilación de este participante (no se borra nada: cuando entre y guarde, aparece aquí).</p></article>`;
  }

  const know = [ku.years, ku.pain, ku.aiLevel, ku.hope].some((v) => String(v || "").trim())
    ? `<ul>
        ${ku.years ? `<li>Años / contexto: ${escapeHtml(ku.years)}</li>` : ""}
        ${ku.pain ? `<li>Dolor: ${escapeHtml(ku.pain)}</li>` : ""}
        ${ku.aiLevel ? `<li>Nivel IA: ${escapeHtml(ku.aiLevel)}</li>` : ""}
        ${ku.hope ? `<li>Espera: ${escapeHtml(ku.hope)}</li>` : ""}
      </ul>`
    : "";

  const modLines = Object.entries(r.moduleMap || {})
    .map(([id, m]) => {
      const title = titleOf(mods, id, id);
      const lessons = (m.lessonsDone || []).join(", ");
      return `<li><strong>${escapeHtml(title)}</strong> (${escapeHtml(id)}): ${escapeHtml(m.status || "—")} · ${m.score || 0} pts${lessons ? ` · lecciones: ${escapeHtml(lessons)}` : ""}</li>`;
    })
    .join("");

  const tasks = (r.labChecks || [])
    .map((id) => `<li>${escapeHtml(titleOf(chats, id, id))} <code>${escapeHtml(id)}</code></li>`)
    .join("");

  const prompts = (r.prompts || [])
    .map(
      (t) => `<div class="dossier-prompt">
        <p><strong>${escapeHtml(t.title || "Prompt")}</strong>${t.source ? ` · ${escapeHtml(t.source)}` : ""} · ${escapeHtml(when(t.savedAt))}</p>
        ${pre(t.text)}
      </div>`
    )
    .join("");

  const quiz = (r.quizScores || [])
    .map((q) => {
      const title = titleOf(quizzes, q.id, q.id);
      const pct = q.totalQuestions ? Math.round((q.correct / q.totalQuestions) * 100) : 0;
      return `<li>${escapeHtml(title)}: ${q.correct}/${q.totalQuestions} (${pct}%) · ${q.score} pts · ${escapeHtml(when(q.at))}</li>`;
    })
    .join("");

  const ch = (r.challenges || [])
    .map(
      (c) => `<li><strong>${escapeHtml(c.id)}</strong> · ${escapeHtml(c.status)} · ${c.score}% · ${c.attempts} intento(s)${c.answers ? answersHtml(c.answers) : ""}</li>`
    )
    .join("");

  const badgeLines = (r.badgesList || [])
    .map((id) => `<li>${escapeHtml(titleOf(badges, id, id))}</li>`)
    .join("");

  const fieldLines = Object.entries(fields)
    .filter(([, v]) => String(v || "").trim())
    .map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong></p>${pre(v)}`)
    .join("");

  const cmpInner =
    notes.caseId || notes.winner || notes.chatgptNotes || notes.claudeNotes || notes.why
      ? `<p>Caso: <code>${escapeHtml(notes.caseId || r.comparator?.caseId || "—")}</code> · Elige: ${escapeHtml(winnerLabel(notes.winner || r.comparator?.winner))}</p>
         ${notes.why ? `<p>Por qué: ${escapeHtml(notes.why)}</p>` : ""}
         ${notes.customPrompt ? `<p>Prompt usado</p>${pre(notes.customPrompt)}` : ""}
         <p>Notas ChatGPT</p>${pre(notes.chatgptNotes)}
         <p>Notas Claude</p>${pre(notes.claudeNotes)}`
      : "";

  const draftInner = Object.entries(draft)
    .filter(([, v]) => String(v || "").trim())
    .map(([k, v]) => `<p><strong>${escapeHtml(k)}</strong></p>${pre(v)}`)
    .join("");

  const logLines = logs
    .slice()
    .sort((a, b) => (a.at || 0) - (b.at || 0))
    .map(
      (e) =>
        `<li><span class="muted">${escapeHtml(when(e.at))}</span> · <code>${escapeHtml(e.kind || "evento")}</code> · ${escapeHtml(e.detail || "")}</li>`
    )
    .join("");

  const body = `
    ${intro}
    ${block("Conocernos", know)}
    ${block("Módulos y lecciones", modLines ? `<ul>${modLines}</ul>` : "")}
    ${block("Tareas y checks de laboratorio", tasks ? `<ul>${tasks}</ul>` : "")}
    ${block("Prompts propios", prompts)}
    ${block("Borrador Prompt Lab", draftInner)}
    ${block("Quizzes", quiz ? `<ul>${quiz}</ul>` : "")}
    ${block("Retos", ch ? `<ul>${ch}</ul>` : "")}
    ${block("Insignias", badgeLines ? `<ul>${badgeLines}</ul>` : "")}
    ${block("Proyecto / ficha", fieldLines || (r.fiche ? "<p>Ficha marcada lista.</p>" : ""))}
    ${block("Comparador", cmpInner)}
    ${block("Registro de actividad (logs)", logLines ? `<ol class="dossier-log">${logLines}</ol>` : "<p class='muted'>Sin eventos en el log (el avance de módulos, prompts y quizzes sí puede aparecer arriba).</p>")}
  `;

  const cls = forPrint ? "dossier-student print-break" : "dossier-student";
  return `<article class="${cls}">${body}</article>`;
}

export function recapBoardHtml(rows, data, openUsers) {
  const open = openUsers || new Set();
  return `<div class="aula-recaps">${rows
    .map((r) => {
      const key = String(r.username || "").toLowerCase();
      const isOpen = open.has(key) ? " open" : "";
      return `<details class="aula-recap" data-aula-user="${escapeHtml(key)}"${isOpen}>
        <summary>Recuento de ${escapeHtml(r.name || r.username)} · ${r.logs?.length || 0} logs · ${r.prompts?.length || 0} prompts</summary>
        ${studentDossierHtml(r, data)}
      </details>`;
    })
    .join("")}</div>`;
}

export function printCollectedPdf(rows, data) {
  const generated = new Date().toLocaleString("es-HN");
  const inner = rows.map((r) => studentDossierHtml(r, data, { forPrint: true })).join("");
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Recuento del aula — Magnatic</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 24px; font-size: 13px; line-height: 1.45; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  h4 { font-size: 14px; margin: 16px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .muted { color: #444; }
  .dossier-student { margin: 0 0 28px; }
  .print-break { page-break-after: always; break-after: page; }
  .print-break:last-child { page-break-after: auto; }
  .dossier-pre { white-space: pre-wrap; background: #f4f4f4; padding: 8px 10px; border: 1px solid #ddd; font-size: 11px; }
  ol.dossier-log { padding-left: 18px; }
  code { font-family: Consolas, monospace; }
  @media print { body { margin: 12mm; } }
</style></head><body>
<h1>Recuento del aula</h1>
<p class="muted">Magnatic · lo recopilado de cada participante · ${escapeHtml(generated)}</p>
${inner}
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return false;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const run = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      /* ignorar */
    }
    window.setTimeout(() => iframe.remove(), 1500);
  };
  window.setTimeout(run, 300);
  return true;
}
