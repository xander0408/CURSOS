const KEY = "aiBusinessLab.theme";

export function currentTheme() {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme) {
  const v = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", v);
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* ignorar */
  }
}

export function initTheme() {
  applyTheme(currentTheme());
}

export function toggleTheme() {
  applyTheme(currentTheme() === "light" ? "dark" : "light");
}
