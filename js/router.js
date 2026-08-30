export function parseHash() {
  const raw = (location.hash || "#/").replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "dashboard", params: {} };
  const head = parts[0];
  if (head === "modulos") return { name: "modules", params: {} };
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
  if (head === "quiz") return { name: "quiz", params: { quizId: parts[1] || "" } };
  if (head === "prompt-lab") return { name: "promptLab", params: {} };
  if (head === "comparador") return { name: "comparator", params: {} };
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
  return { name: "dashboard", params: {} };
}

export function go(path) {
  location.hash = path.startsWith("#") ? path : `#${path}`;
}

export function onRoute(handler) {
  window.addEventListener("hashchange", handler);
  handler();
}
