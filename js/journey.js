import { getState } from "./store.js";

export function lessonsComplete(full) {
  if (!full) return false;
  const st = getState().progress.modules[full.id] || { lessonsDone: [] };
  const lessons = full.lessons || [];
  if (!lessons.length) return false;
  return lessons.every((l) => st.lessonsDone.includes(l.id));
}

export function isPrivileged() {
  return !!getState().profile.isInstructor;
}

export const OFFICE_NAME = "Oficina + IA";
export const OFFICE_HOME = "#/oficina";
const JORNADA_KEY = "aiBusinessLab.jornada";

export function readJornada() {
  try {
    return Number(localStorage.getItem(JORNADA_KEY)) === 2 ? 2 : 1;
  } catch {
    return 1;
  }
}

export function writeJornada(day) {
  try {
    localStorage.setItem(JORNADA_KEY, String(Number(day) === 2 ? 2 : 1));
  } catch {
    /* el avance de los alumnos no depende de esta clave */
  }
}

export function jornadaFromRoute(data, route) {
  const name = route?.name || "";
  if (name === "admin" || name === "cronograma" || name === "timer") return readJornada();
  if (
    name === "friday2" ||
    name === "officeHome" ||
    name === "officeModules" ||
    name === "officeTasks" ||
    name === "officeChallenges" ||
    name === "officeQuiz" ||
    name === "officePrompts" ||
    name === "project"
  ) {
    return 2;
  }
  if (name === "module" && isDay2Module(data, route.params?.moduleId)) return 2;
  if ((name === "quiz" || name === "officeQuiz") && route.params?.quizId) {
    const qz = (data.quizzes || []).find((q) => q.id === route.params.quizId);
    if (qz && (qz.id === "qf" || qz.id === "q-cierre" || qz.id === "q-pitch" || isDay2Module(data, qz.moduleId))) return 2;
  }
  if (name === "comparator" || name === "progress") return readJornada();
  return 1;
}

export function applyJornada(day) {
  const d = Number(day) === 2 ? 2 : 1;
  writeJornada(d);
  document.body.classList.toggle("jornada-1", d === 1);
  document.body.classList.toggle("jornada-2", d === 2);
  document.querySelectorAll("[data-jornada]").forEach((el) => {
    el.classList.toggle("is-on", Number(el.getAttribute("data-jornada")) === d);
  });
}

export function modulesOfDay(data, day) {
  return (data.course?.modules || []).filter((m) => (Number(day) === 2 ? m.day === 2 : m.day !== 2));
}

export function isDay2Module(data, moduleId) {
  return data.course?.modules?.find((m) => m.id === moduleId)?.day === 2;
}

export function quizzesOfDay(data, day) {
  const day2 = new Set(modulesOfDay(data, 2).map((m) => m.id));
  return (data.quizzes || []).filter((qz) => {
    if (qz.id === "qf" || qz.id === "q-cierre" || qz.id === "q-pitch") return Number(day) === 2;
    if (qz.id === "q-rapido") return Number(day) !== 2;
    if (qz.moduleId && day2.has(qz.moduleId)) return Number(day) === 2;
    return Number(day) !== 2;
  });
}

export function isModuleUnlocked(data, moduleId) {
  if (isPrivileged()) return true;
  const mods = data.course.modules;
  const idx = mods.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return true;
  const prev = mods[idx - 1];
  return lessonsComplete(data.modules[prev.id]);
}

function lockedModuleStep(data, locked) {
  const full = data.modules[locked.id];
  const label = locked.number === 0 ? "Inicio" : `Módulo ${locked.number}`;
  return {
    href: `#/modulo/${locked.id}/leccion/${full.lessons[0].id}`,
    title: `${label}: ${locked.title}`,
    detail: locked.subtitle,
    moduleId: locked.id,
  };
}

export function nextPathStep(data) {
  const s = getState();
  if (!s.profile.introDone) {
    return { href: "#/perfil", title: "Conocernos", detail: "Quién eres, tu cargo y tu caso de práctica." };
  }
  if (!s.progress.freeTiersAck) {
    return { href: "#/cuentas", title: "Cuentas gratis", detail: "Hasta dónde llegan ChatGPT y Claude sin pagar." };
  }
  const locked = modulesOfDay(data, 1).find((m) => !lessonsComplete(data.modules[m.id]));
  if (locked) return lockedModuleStep(data, locked);
  return {
    href: "#/progreso",
    title: "Ruta de este viernes lista",
    detail: "Ya puedes repasar quiz y tareas de esta pestaña. El otro viernes está en su pestaña, arriba del menú.",
  };
}

export function nextFriday2Step(data) {
  const locked = modulesOfDay(data, 2).find((m) => !lessonsComplete(data.modules[m.id]));
  if (locked) return lockedModuleStep(data, locked);
  const checks = getState().progress.labs?.checks || {};
  const caseIds = (data.officeCases?.cases || []).map((c) => c.activityId);
  if (caseIds.length && !caseIds.some((id) => checks[id])) {
    return {
      href: "#/oficina/tareas",
      title: "Caso de mesa",
      detail: "Lean la hoja de su mesa. 40 minutos a mano, sin internet. Luego lo mismo con IA. Esto no es el examen.",
    };
  }
  if (!getState().progress.project?.ficheReady) {
    return { href: "#/proyecto", title: "Proyecto final", detail: "Usa el Word de tu usuario en la carpeta proyectos. No el caso de mesa." };
  }
  return { href: "#/proyecto", title: "Proyecto listo", detail: "Repasa la ficha o un quiz si el instructor lo pide." };
}

export function assignedTask(data) {
  const id = getState().profile.assignedTaskId;
  return (data.tasks || []).find((t) => t.id === id) || null;
}
