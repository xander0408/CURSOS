/** Base publica del sitio (local o GitHub Pages /CURSOS/). */
export function siteBase() {
  let path = location.pathname || "/";
  if (/index\.html$/i.test(path)) path = path.replace(/index\.html$/i, "");
  if (!path.endsWith("/")) path += "/";
  return path;
}

export function publicUrl(file) {
  return siteBase() + String(file || "").replace(/^\//, "");
}

export function ensureTrailingSlash() {
  const p = location.pathname || "/";
  if (p.endsWith("/") || /\.html$/i.test(p)) return false;
  location.replace(p + "/" + (location.search || "") + (location.hash || ""));
  return true;
}
