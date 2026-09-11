/** Base publica del sitio (local o GitHub Pages /CURSOS/). */
export function siteBase() {
  let path = location.pathname || "/";
  if (/index\.html$/i.test(path)) path = path.replace(/index\.html$/i, "");
  if (!path.endsWith("/")) path += "/";
  return path;
}

export function assetVer() {
  if (!window.__ABL_ASSET_V) window.__ABL_ASSET_V = String(Date.now());
  return window.__ABL_ASSET_V;
}

export function publicUrl(file) {
  return siteBase() + String(file || "").replace(/^\//, "");
}

/** Misma ruta + ?v= para que un logo/avatar reemplazado con el mismo nombre se vea al refrescar. */
export function assetUrl(file) {
  const u = publicUrl(file);
  const sep = u.includes("?") ? "&" : "?";
  return u + sep + "v=" + assetVer();
}

export const BRAND_LOGO_FILES = [
  "avatares/magnatic-perfil-vertical.png",
  "avatares/magnatic-perfil-vertical.gif",
  "avatares/magnatic-perfil-vertical.svg",
  "avatares/magnatic-logo.png",
  "avatares/magnatic-logo-vertical.svg",
];

export function bindBrandImages(root = document) {
  const files = BRAND_LOGO_FILES;
  const v = assetVer();
  root.querySelectorAll("[data-brand-logo]").forEach((img) => {
    if (img.dataset.assetV === v && img.complete && img.naturalWidth > 0) return;
    img.dataset.assetV = v;
    let i = 0;
    const next = () => {
      if (i >= files.length) return;
      const f = files[i++];
      img.onerror = next;
      img.onload = () => {
        img.onerror = null;
      };
      img.src = publicUrl(f) + "?v=" + v;
    };
    next();
  });
}

const SPA_HEADS = new Set([
  "timer",
  "modulos",
  "modulo",
  "retos",
  "quiz",
  "prompt-lab",
  "comparador",
  "biblioteca",
  "proyecto",
  "progreso",
  "perfil",
  "cuentas",
  "manual",
  "admin",
  "actividades",
  "cronograma",
]);

export function ensureTrailingSlash() {
  const p = location.pathname || "/";
  const segs = p.split("/").filter(Boolean).filter((s) => s !== "index.html");
  const spaIdx = segs.findIndex((s) => SPA_HEADS.has(String(s).toLowerCase()));
  if (spaIdx >= 0) {
    const repo = spaIdx > 0 ? segs[0] : "";
    const extra = segs.slice(spaIdx).join("/");
    const base = repo ? `/${repo}/` : "/";
    const hash = location.hash && location.hash !== "#" && location.hash !== "#/" ? location.hash : `#/${extra.replace(/\/+$/, "")}`;
    location.replace(base + (location.search || "") + hash);
    return true;
  }
  if (p.endsWith("/") || /\.html$/i.test(p)) return false;
  location.replace(p + "/" + (location.search || "") + (location.hash || ""));
  return true;
}
