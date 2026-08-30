import { getState, update } from "../store.js";
import { escapeHtml, toast } from "../ui.js";
import { scoreAnswer, maxScore, rank } from "../quiz-engine.js";
import { checkBadges } from "../badges.js";
import { sectionAgent } from "../agents.js";
import { isModuleUnlocked } from "../journey.js";

// Estilo Kahoot: colores y formas fijas para hasta 4 opciones.
const SHAPES = [
  { color: "red", glyph: "▲" },
  { color: "blue", glyph: "◆" },
  { color: "yellow", glyph: "●" },
  { color: "green", glyph: "■" },
];

let timerId = null;

function clearTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

// ---- Indice de quizzes (pantalla de seleccion) ----
export function renderQuizIndex(data) {
  const best = getState().progress.quizzes?.bestScores || {};
  const cards = data.quizzes
    .map((qz) => {
      const b = best[qz.id];
      const total = maxScore(qz);
      const pct = b ? Math.round((b.score / total) * 100) : 0;
      const badge = b ? `<span class="pill ok">Mejor: ${b.score} pts · ${pct}%</span>` : `<span class="pill">Sin jugar</span>`;
      const open = !qz.moduleId || isModuleUnlocked(data, qz.moduleId);
      const href = open ? `#/quiz/${qz.id}` : "#/quiz";
      return `<a class="card clickable quiz-card ${open ? "" : "soon"}" href="${href}" style="text-decoration:none;color:inherit">
        <div class="quiz-card-top"><span class="quiz-icon">${qz.icon || "❓"}</span>${badge}</div>
        <h3>${escapeHtml(qz.title)}</h3>
        <p>${escapeHtml(qz.subtitle || "")}</p>
        <p class="muted">${qz.questions.length} preguntas · ${qz.seconds}s por pregunta</p>
      </a>`;
    })
    .join("");
  return `
    <div class="page-head">
      <h2>Quiz rápido</h2>
      <p>Estilo concurso: responde contra el reloj. Cuanto más rápido aciertas, más puntos ganas. Ideal para repasar en clase.</p>
    </div>
    ${sectionAgent(data, "quiz")}
    <div class="grid grid-3">${cards}</div>
  `;
}

// ---- Juego de un quiz ----
export function renderQuizPlay(data, quizId) {
  const quiz = data.quizzes.find((q) => q.id === quizId);
  if (!quiz) return `<div class="page-head"><h2>Quiz no encontrado</h2><p><a href="#/quiz">Volver</a></p></div>`;
  if (quiz.moduleId && !isModuleUnlocked(data, quiz.moduleId)) {
    return `<div class="page-head"><h2>Quiz bloqueado</h2><p>Completa el módulo correspondiente primero.</p><p><a href="#/quiz">Volver</a></p></div>`;
  }
  return `<div id="quiz-stage" class="quiz-stage"></div>`;
}

// La vista de juego es imperativa (temporizador en vivo), no solo innerHTML.
export function bindQuizPlay(data, quizId) {
  const quiz = data.quizzes.find((q) => q.id === quizId);
  const stage = document.getElementById("quiz-stage");
  if (!quiz || !stage) return;

  const session = {
    index: 0,
    score: 0,
    streak: 0,
    correctCount: 0,
    answers: [],
  };

  showStart();

  function showStart() {
    clearTimer();
    const best = getState().progress.quizzes?.bestScores?.[quiz.id];
    stage.innerHTML = `
      <div class="quiz-hero">
        <div class="quiz-hero-icon">${quiz.icon || "❓"}</div>
        <h2>${escapeHtml(quiz.title)}</h2>
        <p class="muted">${escapeHtml(quiz.subtitle || "")}</p>
        <div class="quiz-hero-meta">
          <span>${quiz.questions.length} preguntas</span>
          <span>${quiz.seconds}s cada una</span>
          <span>Puntos por rapidez + racha</span>
        </div>
        ${best ? `<p class="muted">Tu mejor puntaje: <strong>${best.score} pts</strong></p>` : ""}
        <div class="btn-row" style="justify-content:center">
          <button class="btn btn-primary" id="quiz-start" type="button">Empezar</button>
          <a class="btn" href="#/quiz">Volver</a>
        </div>
      </div>
    `;
    document.getElementById("quiz-start").onclick = () => askQuestion();
  }

  function askQuestion() {
    clearTimer();
    const total = quiz.questions.length;
    const question = quiz.questions[session.index];
    const msTotal = quiz.seconds * 1000;
    const startAt = Date.now();
    let answered = false;

    stage.innerHTML = `
      <div class="quiz-play">
        <div class="quiz-topbar">
          <span class="muted">Pregunta ${session.index + 1} de ${total}</span>
          <span class="quiz-score" id="quiz-score">${session.score} pts${session.streak > 1 ? ` · 🔥${session.streak}` : ""}</span>
        </div>
        <div class="quiz-timebar"><span id="quiz-timefill" style="width:100%"></span></div>
        <div class="quiz-question"><h2>${escapeHtml(question.q)}</h2></div>
        <div class="quiz-answers" id="quiz-answers">
          ${question.options
            .map((opt, i) => {
              const s = SHAPES[i % SHAPES.length];
              return `<button class="quiz-answer ${s.color}" data-i="${i}" type="button">
                <span class="quiz-glyph">${s.glyph}</span>
                <span class="quiz-answer-text">${escapeHtml(opt)}</span>
              </button>`;
            })
            .join("")}
        </div>
      </div>
    `;

    const fill = document.getElementById("quiz-timefill");
    timerId = setInterval(() => {
      const elapsed = Date.now() - startAt;
      const remaining = Math.max(0, msTotal - elapsed);
      fill.style.width = (remaining / msTotal) * 100 + "%";
      if (remaining <= 0 && !answered) {
        answered = true;
        clearTimer();
        lockAndScore(null, question, 0, msTotal);
      }
    }, 60);

    stage.querySelectorAll(".quiz-answer").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        clearTimer();
        const chosen = Number(btn.dataset.i);
        const msRemaining = Math.max(0, msTotal - (Date.now() - startAt));
        lockAndScore(chosen, question, msRemaining, msTotal);
      });
    });
  }

  function lockAndScore(chosen, question, msRemaining, msTotal) {
    const correct = chosen === question.correct;
    const res = scoreAnswer({ correct, msRemaining, msTotal, streak: session.streak });
    session.score += res.points;
    session.streak = res.streak;
    if (correct) session.correctCount += 1;
    session.answers.push({ chosen, correct: question.correct, wasRight: correct });

    // Marca visual de correcto/incorrecto.
    stage.querySelectorAll(".quiz-answer").forEach((btn) => {
      const i = Number(btn.dataset.i);
      btn.disabled = true;
      if (i === question.correct) btn.classList.add("is-correct");
      else if (i === chosen) btn.classList.add("is-wrong");
      else btn.classList.add("is-dim");
    });

    const scoreEl = document.getElementById("quiz-score");
    if (scoreEl) scoreEl.textContent = `${session.score} pts${session.streak > 1 ? ` · 🔥${session.streak}` : ""}`;

    const feedback = document.createElement("div");
    feedback.className = `quiz-feedback ${correct ? "ok" : "no"}`;
    const head = chosen === null ? "⏱️ Se acabó el tiempo" : correct ? `✅ ¡Correcto! +${res.points} pts` : "❌ Incorrecto";
    feedback.innerHTML = `
      <strong>${head}</strong>
      <p>${escapeHtml(question.explain || "")}</p>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-primary" id="quiz-next" type="button">${session.index + 1 < quiz.questions.length ? "Siguiente" : "Ver resultado"}</button>
      </div>
    `;
    stage.querySelector(".quiz-play").appendChild(feedback);
    document.getElementById("quiz-next").onclick = () => {
      session.index += 1;
      if (session.index < quiz.questions.length) askQuestion();
      else showResults();
    };
  }

  function showResults() {
    clearTimer();
    const total = maxScore(quiz);
    const pct = Math.round((session.score / total) * 100);
    const r = rank(pct);
    const correctPct = Math.round((session.correctCount / quiz.questions.length) * 100);

    // Guarda mejor puntaje.
    let isBest = false;
    update((st) => {
      if (!st.progress.quizzes) st.progress.quizzes = { bestScores: {} };
      if (!st.progress.quizzes.bestScores) st.progress.quizzes.bestScores = {};
      const prev = st.progress.quizzes.bestScores[quiz.id];
      if (!prev || session.score > prev.score) {
        st.progress.quizzes.bestScores[quiz.id] = {
          score: session.score,
          correct: session.correctCount,
          totalQuestions: quiz.questions.length,
          at: Date.now(),
        };
        isBest = true;
      }
    });
    checkBadges(data);

    stage.innerHTML = `
      <div class="quiz-hero">
        <div class="quiz-hero-icon">${r.icon}</div>
        <h2>${r.label}</h2>
        <p class="muted">${quiz.title}</p>
        <div class="quiz-result-score">${session.score} <span>pts</span></div>
        <div class="quiz-hero-meta">
          <span>${session.correctCount} de ${quiz.questions.length} correctas</span>
          <span>${correctPct}% de aciertos</span>
          ${isBest ? `<span class="pill ok">¡Nuevo récord!</span>` : ""}
        </div>
        <div class="btn-row" style="justify-content:center">
          <button class="btn btn-primary" id="quiz-again" type="button">Jugar de nuevo</button>
          <a class="btn" href="#/quiz">Otros quizzes</a>
        </div>
      </div>
    `;
    document.getElementById("quiz-again").onclick = () => {
      session.index = 0;
      session.score = 0;
      session.streak = 0;
      session.correctCount = 0;
      session.answers = [];
      askQuestion();
    };
    if (correctPct === 100) toast("¡Perfecto! Todas correctas.");
  }
}
