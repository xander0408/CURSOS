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

export function modulesOfDay(data, day) {
  return (data.course?.modules || []).filter((m) => (Number(day) === 2 ? m.day === 2 : m.day !== 2));
}

export function isDay2Module(data, moduleId) {
  return data.course?.modules?.find((m) => m.id === moduleId)?.day === 2;
}

export function quizzesOfDay(data, day) {
  const day2 = new Set(modulesOfDay(data, 2).map((m) => m.id));
  return (data.quizzes || []).filter((qz) => {
    if (qz.id === "qf") return Number(day) === 2;
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
    href: OFFICE_HOME,
    title: OFFICE_NAME,
    detail: "Excel, PowerPoint, investigación y proyecto están en su propia jornada.",
  };
}

export function nextFriday2Step(data) {
  const locked = modulesOfDay(data, 2).find((m) => !lessonsComplete(data.modules[m.id]));
  if (locked) return lockedModuleStep(data, locked);
  return { href: "#/proyecto", title: "Proyecto final", detail: "Cierra tu ficha con un problema real de tu área." };
}

export function assignedTask(data) {
  const id = getState().profile.assignedTaskId;
  return (data.tasks || []).find((t) => t.id === id) || null;
}
