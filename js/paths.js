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
  "avatares/magnatic-perfil-vertical.svg",
  "avatares/magnatic-perfil-vertical.png",
  "avatares/magnatic-perfil-vertical.gif",
  "avatares/magnatic-logo-vertical.svg",
  "avatares/magnatic-logo.png",
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

export function ensureTrailingSlash() {
  const p = location.pathname || "/";
  if (p.endsWith("/") || /\.html$/i.test(p)) return false;
  location.replace(p + "/" + (location.search || "") + (location.hash || ""));
  return true;
}
