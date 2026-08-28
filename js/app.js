import { loadAll } from "./content.js";
import { parseHash, onRoute } from "./router.js";
import { getState, update } from "./store.js";
import { toast, openModal, closeModal } from "./ui.js";
import { renderDashboard, bindDashboard, renderProgress, bindProgress, globalPct } from "./views/dashboard.js";
import { renderModulesIndex, renderModule } from "./views/modules.js";
import { markLessonDone, completeModule, recountChallenges } from "./store.js";
import { checkBadges } from "./badges.js";
import { moduleProgress } from "./views/modules.js";
import { renderChallengesIndex, bindChallengesIndex } from "./views/challenges.js";
import { renderPromptLab, bindPromptLab } from "./views/prompt-lab-view.js";
import { renderComparator, bindComparator } from "./views/comparator.js";
import { renderLibrary, bindLibrary } from "./views/library.js";
import { renderProject, bindProject } from "./views/project.js";
import { renderQuizIndex, renderQuizPlay, bindQuizPlay } from "./views/quiz.js";
import { hydrateAgents } from "./agents.js";

const TITLES = {
  dashboard: "Dashboard",
  modules: "Módulos",
  module: "Módulo",
  challenges: "Retos",
  quiz: "Quiz",
  promptLab: "Prompt Lab",
  comparator: "Comparador",
  library: "Biblioteca",
  project: "Proyecto final",
  progress: "Progreso",
};

let data = null;

function setInstructorUi() {
  const on = getState().settings.instructorUnlocked;
  document.body.classList.toggle("instructor-on", on);
}

function bindShell() {
  const side = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  document.getElementById("menu-btn").onclick = () => {
    side.classList.add("open");
    overlay.classList.add("show");
  };
  overlay.onclick = () => {
    side.classList.remove("open");
    overlay.classList.remove("show");
  };
  document.getElementById("btn-instructor").onclick = () => {
    if (getState().settings.instructorUnlocked) {
      update((s) => {
        s.settings.instructorUnlocked = false;
      });
      setInstructorUi();
      toast("Modo instructor bloqueado.");
      return;
    }
    openModal(`
      <h3>Modo instructor</h3>
      <p class="muted">PIN local de esta copia del curso. No es una cuenta ni un servidor.</p>
      <div class="field"><label>PIN</label><input id="pin" type="password" /></div>
      <div class="btn-row"><button class="btn btn-primary" type="button" id="pin-ok">Entrar</button></div>
    `);
    document.getElementById("pin-ok").onclick = () => {
      const pin = document.getElementById("pin").value;
      if (pin === data.instructor.pin) {
        update((s) => {
          s.settings.instructorUnlocked = true;
        });
        setInstructorUi();
        closeModal();
        toast("Notas de facilitación visibles.");
        window.dispatchEvent(new Event("app:refresh"));
      } else toast("PIN incorrecto.");
    };
  };
  document.getElementById("btn-lock-instructor").onclick = () => {
    update((s) => {
      s.settings.instructorUnlocked = false;
    });
    setInstructorUi();
  };
}

function highlightNav(pathName) {
  const map = {
    dashboard: "/",
    modules: "/modulos",
    module: "/modulos",
    challenges: "/retos",
    quiz: "/quiz",
    promptLab: "/prompt-lab",
    comparator: "/comparador",
    library: "/biblioteca",
    project: "/proyecto",
    progress: "/progreso",
  };
  const active = map[pathName] || "/";
  document.querySelectorAll(".nav-link").forEach((a) => {
    const r = a.getAttribute("data-route");
    a.classList.toggle("active", r === active);
  });
}

function render() {
  const route = parseHash();
  const root = document.getElementById("app-root");
  document.getElementById("header-title").textContent = TITLES[route.name] || "AI Business Lab";
  document.getElementById("header-user").textContent = getState().profile.displayName || "";
  document.getElementById("header-progress").style.width = globalPct(data) + "%";
  highlightNav(route.name);
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
  setInstructorUi();

  if (route.name === "dashboard") {
    root.innerHTML = renderDashboard(data);
    bindDashboard();
  } else if (route.name === "modules") {
    root.innerHTML = renderModulesIndex(data);
  } else if (route.name === "module") {
    root.innerHTML = renderModule(data, route.params);
  } else if (route.name === "challenges") {
    root.innerHTML = renderChallengesIndex(data, route.params.moduleId);
    bindChallengesIndex();
  } else if (route.name === "quiz") {
    if (route.params.quizId) {
      root.innerHTML = renderQuizPlay(data, route.params.quizId);
      bindQuizPlay(data, route.params.quizId);
    } else {
      root.innerHTML = renderQuizIndex(data);
    }
  } else if (route.name === "promptLab") {
    root.innerHTML = renderPromptLab(data);
    bindPromptLab(data);
  } else if (route.name === "comparator") {
    root.innerHTML = renderComparator(data);
    bindComparator(data);
  } else if (route.name === "library") {
    root.innerHTML = renderLibrary(data);
    bindLibrary(data);
  } else if (route.name === "project") {
    root.innerHTML = renderProject(data, route.params.step);
    bindProject(data, route.params.step);
  } else if (route.name === "progress") {
    root.innerHTML = renderProgress(data);
    bindProgress(data);
  }

  document.getElementById("btn-continue")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const moduleId = btn.dataset.module;
    const lessonId = btn.dataset.lesson;
    if (!moduleId) return;
    markLessonDone(moduleId, lessonId);
    const full = data.modules[moduleId];
    const p = moduleProgress(full);
    if (p.complete) completeModule(moduleId, p.avg);
    recountChallenges();
    checkBadges(data);
    if (btn.dataset.next) location.hash = `#/modulo/${moduleId}/leccion/${btn.dataset.next}`;
    else if (btn.dataset.firstCh) location.hash = `#/modulo/${moduleId}/reto/${btn.dataset.firstCh}`;
    else location.hash = `#/modulos`;
  });

  // Inserta y anima los avatares de los agentes tutores (si la vista tiene).
  hydrateAgents(root);
}

async function main() {
  try {
    data = await loadAll();
  } catch (err) {
    document.getElementById("app-root").innerHTML = `
      <div class="page-head">
        <h2>Abre el laboratorio con un servidor local</h2>
        <p>El navegador bloquea los archivos JSON si abres index.html con doble clic. En una terminal, dentro de esta carpeta:</p>
        <pre class="prompt-preview show">python -m http.server 8080</pre>
        <p>Luego visita <code>http://localhost:8080</code></p>
        <p class="muted">${String(err.message || err)}</p>
      </div>`;
    return;
  }
  bindShell();
  onRoute(render);
  window.addEventListener("app:refresh", render);
}

main();
