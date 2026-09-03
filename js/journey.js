import { getState } from "./store.js";

export function lessonsComplete(full) {
  if (!full) return false;
  const st = getState().progress.modules[full.id] || { lessonsDone: [] };
  const lessons = full.lessons || [];
  if (!lessons.length) return false;
  return lessons.every((l) => st.lessonsDone.includes(l.id));
}

export function isPrivileged() {
  const s = getState();
  return !!(s.profile.isInstructor || s.settings.instructorUnlocked);
}

export function isModuleUnlocked(data, moduleId) {
  if (isPrivileged()) return true;
  const mods = data.course.modules;
  const idx = mods.findIndex((m) => m.id === moduleId);
  if (idx <= 0) return true;
  const prev = mods[idx - 1];
  return lessonsComplete(data.modules[prev.id]);
}

export function nextPathStep(data) {
  const s = getState();
  if (!s.profile.introDone) {
    return { href: "#/perfil", title: "Conocernos", detail: "Quién eres, tu cargo y tu caso de práctica." };
  }
  if (!s.progress.freeTiersAck) {
    return { href: "#/cuentas", title: "Cuentas gratis", detail: "Hasta dónde llegan ChatGPT y Claude sin pagar." };
  }
  const locked = data.course.modules.find((m) => !lessonsComplete(data.modules[m.id]));
  if (locked) {
    const full = data.modules[locked.id];
    const label = locked.number === 0 ? "Inicio" : `Módulo ${locked.number}`;
    return {
      href: `#/modulo/${locked.id}/leccion/${full.lessons[0].id}`,
      title: `${label}: ${locked.title}`,
      detail: locked.subtitle,
      moduleId: locked.id,
    };
  }
  return { href: "#/proyecto", title: "Proyecto final", detail: "Cierra tu ficha con un problema real de tu área." };
}

export function assignedTask(data) {
  const id = getState().profile.assignedTaskId;
  return (data.tasks || []).find((t) => t.id === id) || null;
}
