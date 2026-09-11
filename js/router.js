export function parseHash() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  let parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) {
    const segs = (location.pathname || "/").split("/").filter(Boolean);
    const extra = segs.filter((s) => s !== "CURSOS" && s !== "index.html");
    if (extra[0]) parts = extra;
  }
  if (parts.length === 0) return { name: "dashboard", params: {} };
  const head = String(parts[0] || "").toLowerCase();
  if (head === "modulos") return { name: "modules", params: {} };
  if (head === "timer") return { name: "timer", params: {} };
  if (head === "modulo") {
    return {
      name: "module",
      params: {
        moduleId: parts[1],
        kind: parts[2] || "leccion",
        itemId: parts[3] || "",
      },
    };
  }
  if (head === "retos") return { name: "challenges", params: { moduleId: parts[1] || "" } };
  if (head === "quiz") {
    const rawId = parts.slice(1).join("/") || "";
    let quizId = rawId;
    try {
      quizId = decodeURIComponent(rawId);
    } catch {
      quizId = rawId;
    }
    return { name: "quiz", params: { quizId } };
  }
  if (head === "prompt-lab") return { name: "promptLab", params: {} };
  if (head === "comparador") return { name: "comparator", params: { caseId: parts[1] || "" } };
  if (head === "biblioteca") return { name: "library", params: {} };
  if (head === "proyecto") {
    const step = parts[1] ? Number(parts[1]) : 0;
    return { name: "project", params: { step } };
  }
  if (head === "progreso") return { name: "progress", params: {} };
  if (head === "perfil") return { name: "perfil", params: {} };
  if (head === "cuentas") return { name: "cuentas", params: {} };
  if (head === "manual") return { name: "manual", params: {} };
  if (head === "admin") return { name: "admin", params: {} };
  if (head === "actividades") return { name: "actividades", params: {} };
  if (head === "cronograma") return { name: "cronograma", params: {} };
  return { name: "dashboard", params: {} };
}

export function go(path) {
  location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function onRoute(handler) {
  window.addEventListener("hashchange", handler);
  handler();
}
