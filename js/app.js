import { ensureTrailingSlash } from "./paths.js";
import { initTheme, toggleTheme, currentTheme } from "./theme.js";
import { loadAll } from "./content.js";
import { parseHash, onRoute } from "./router.js";
import { getState, update, markLessonDone, completeModule, recountChallenges, loadUser, readSession, writeSession, logActivity, storageWorks, seedInstructorGuide } from "./store.js";
import { toast, openModal, closeModal } from "./ui.js";
import { renderDashboard, bindDashboard, renderProgress, bindProgress, globalPct } from "./views/dashboard.js";
import { renderModulesIndex, renderModule, bindModuleView } from "./views/modules.js";
import { checkBadges } from "./badges.js";
import { moduleProgress } from "./views/modules.js";
import { renderChallengesIndex, bindChallengesIndex } from "./views/challenges.js";
import { renderPromptLab, bindPromptLab } from "./views/prompt-lab-view.js";
import { renderComparator, bindComparator } from "./views/comparator.js";
import { renderLibrary, bindLibrary } from "./views/library.js";
import { renderProject, bindProject } from "./views/project.js";
import { renderQuizIndex, renderQuizPlay, bindQuizPlay } from "./views/quiz.js";
import { hydrateAgents, sectionAgent, coachSectionForRoute } from "./agents.js";
import { loadStudents, isLoggedIn, renderLogin, logout, gateRedirect } from "./auth.js";
import { renderPerfil, bindPerfil, renderCuentas, bindCuentas, renderManual, bindManual, renderAdmin, bindAdmin } from "./views/guides.js";
import { renderActivities, bindActivities } from "./views/activities.js";
import { renderCronograma } from "./views/schedule.js";

const TITLES = {
  dashboard: "Ruta",
  modules: "Módulos",
  module: "Módulo",
  challenges: "Retos",
  quiz: "Quiz",
  promptLab: "Prompt Lab",
  comparator: "Comparador",
  library: "Biblioteca",
  project: "Proyecto final",
  progress: "Progreso",
  perfil: "Conocernos",
  cuentas: "Cuentas gratis",
  manual: "Manual de prompts",
  admin: "Instructor",
  actividades: "Actividades",
  cronograma: "Cronograma",
};

let data = null;

function setInstructorUi() {
  const inst = !!getState().profile.isInstructor;
  const notes = inst || !!getState().settings.instructorUnlocked;
  document.body.classList.toggle("instructor-on", notes);
  document.getElementById("nav-admin")?.classList.toggle("is-hidden", !notes);
  document.getElementById("nav-cronograma")?.classList.toggle("is-hidden", !inst);
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
  document.getElementById("btn-theme")?.addEventListener("click", () => {
    toggleTheme();
    const btn = document.getElementById("btn-theme");
    if (btn) btn.textContent = currentTheme() === "light" ? "Oscuro" : "Claro";
  });
  const themeBtn = document.getElementById("btn-theme");
  if (themeBtn) themeBtn.textContent = currentTheme() === "light" ? "Oscuro" : "Claro";
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
    perfil: "/perfil",
    cuentas: "/cuentas",
    manual: "/manual",
    admin: "/admin",
    actividades: "/actividades",
    cronograma: "/cronograma",
  };
  const active = map[pathName] || "/";
  document.querySelectorAll(".nav-link").forEach((a) => {
    const r = a.getAttribute("data-route");
    a.classList.toggle("active", r === active);
  });
}

function render() {
  try {
    renderInner();
  } catch (err) {
    const root = document.getElementById("app-root");
    if (root) {
      root.innerHTML = `<div class="page-head"><h2>No se pudo pintar esta vista</h2><p>Recarga la página. Si sigue, avisa al instructor.</p><p class="muted">${String(err.message || err)}</p></div>`;
    }
    console.error(err);
  }
}

function renderInner() {
  const bounce = gateRedirect();
  if (bounce) {
    const here = location.hash || "#/";
    if (here !== bounce) {
      location.hash = bounce;
      return;
    }
  }
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
    bindModuleView(data, route.params);
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
  } else if (route.name === "perfil") {
    root.innerHTML = renderPerfil(data);
    bindPerfil(data);
  } else if (route.name === "cuentas") {
    root.innerHTML = renderCuentas(data);
    bindCuentas();
  } else if (route.name === "manual") {
    root.innerHTML = renderManual(data);
    bindManual();
  } else if (route.name === "admin") {
    root.innerHTML = renderAdmin(data);
    bindAdmin();
  } else if (route.name === "actividades") {
    root.innerHTML = renderActivities(data);
    bindActivities();
  } else if (route.name === "cronograma") {
    if (!getState().profile.isInstructor) {
      root.innerHTML = `<div class="page-head"><h2>Solo instructor</h2><p>El cronograma de las 16 horas no se muestra a los participantes. Sigue tu ruta, módulos y actividades.</p><p><a class="btn btn-primary" href="#/">Volver a la ruta</a></p></div>`;
    } else {
      root.innerHTML = renderCronograma(data);
    }
  }

  if (!root.querySelector(".agent-card") && !root.querySelector(".quiz-stage") && !root.querySelector(".quiz-play")) {
    root.insertAdjacentHTML("afterbegin", sectionAgent(data, coachSectionForRoute(route.name)));
  }

  document.getElementById("btn-continue")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    const moduleId = btn.dataset.module;
    const lessonId = btn.dataset.lesson;
    if (!moduleId) return;
    markLessonDone(moduleId, lessonId);
    logActivity("leccion", `${moduleId}/${lessonId}`);
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

let splashAt = Date.now();
function hideSplash() {
  const wait = Math.max(0, 800 - (Date.now() - splashAt));
  setTimeout(() => document.getElementById("boot-splash")?.classList.add("is-done"), wait);
}

async function main() {
  initTheme();
  if (ensureTrailingSlash()) return;
  try {
    data = await loadAll();
  } catch (err) {
    hideSplash();
    document.getElementById("app-root").innerHTML = `
      <div class="page-head">
        <h2>Abre el laboratorio con un servidor local</h2>
        <p>El navegador bloquea los archivos JSON si abres index.html con doble clic. En una terminal, dentro de esta carpeta:</p>
        <pre class="prompt-preview show">python -m http.server 8080</pre>
        <p>Usa la URL con barra final: <code>https://xander0408.github.io/CURSOS/</code></p>
        <p class="muted">${String(err.message || err)}</p>
      </div>`;
    return;
  }
  const students = await loadStudents();

  if (!isLoggedIn()) {
    document.body.classList.add("logged-out");
    renderLogin(document.getElementById("app-root"), students, () => {
      document.body.classList.remove("logged-out");
      if (getState().profile.isInstructor) seedInstructorGuide(data);
      startSuite();
    });
    hideSplash();
    return;
  }
  document.body.classList.remove("logged-out");
  const sess = readSession();
  loadUser(sess.userId);
  writeSession({ userId: sess.userId, at: Date.now() });
  if (getState().profile.isInstructor) seedInstructorGuide(data);
  startSuite();
  hideSplash();
}

let suiteStarted = false;
function startSuite() {
  if (!suiteStarted) {
    bindShell();
    bindLogout();
    onRoute(render);
    window.addEventListener("app:refresh", render);
    suiteStarted = true;
  } else {
    render();
  }

  // Aviso si el navegador no permite guardar el progreso (modo incognito
  // estricto o almacenamiento bloqueado).
  if (!storageWorks()) {
    setTimeout(
      () => toast("Aviso: este navegador no guarda tu progreso (¿modo incógnito?)."),
      600
    );
  }
}

function bindLogout() {
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    logout();
    location.reload();
  });
}

main();
