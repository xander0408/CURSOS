export const ACTIVA = [
  { id: "A1", letter: "A", name: "Analizar" },
  { id: "C", letter: "C", name: "Contextualizar" },
  { id: "T", letter: "T", name: "Transformar" },
  { id: "I", letter: "I", name: "Iterar" },
  { id: "V", letter: "V", name: "Verificar" },
  { id: "A2", letter: "A", name: "Aplicar" },
];

export function activaBar(activeIndex = 0) {
  return `<div class="activa" aria-label="Metodología A.C.T.I.V.A.">
    ${ACTIVA.map(
      (s, i) => `<span class="${i === activeIndex ? "on" : ""}">
        <span class="letter">${s.letter}</span>${s.name}
      </span>`
    ).join("")}
  </div>`;
}

export function progressBar(pct) {
  const n = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="progress"><span style="width:${n}%"></span></div>`;
}

export function pillForDifficulty(d) {
  const map = { basico: "ok", intermedio: "warn", avanzado: "hard" };
  return `<span class="pill ${map[d] || ""}">${d === "basico" ? "básico" : d || "básico"}</span>`;
}

export function html(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}

export function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

export function openModal(innerHtml) {
  const back = document.getElementById("modal-back");
  document.getElementById("modal").innerHTML = innerHtml;
  back.classList.add("show");
  back.onclick = (e) => {
    if (e.target === back) closeModal();
  };
}

export function closeModal() {
  document.getElementById("modal-back").classList.remove("show");
}

export function copyText(text) {
  const t = String(text || "");
  if (!t.trim()) {
    toast("No hay texto para copiar. Completa el prompt o selecciona una plantilla.");
    return false;
  }
  const done = () => toast("Copiado. Pégalo en ChatGPT o Claude.");
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(t).then(done).catch(() => fallbackCopy(t) && done());
  }
  if (fallbackCopy(t)) done();
  else toast("Selecciona el texto del recuadro y cópialo con Ctrl+C.");
  return true;
}

function fallbackCopy(t) {
  try {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderBlocks(blocks = []) {
  return blocks
    .map((b) => {
      if (b.type === "text") return `<div class="lesson-block">${b.html}</div>`;
      if (b.type === "callout") {
        return `<div class="callout ${b.kind}"><strong>${escapeHtml(b.title)}</strong>${escapeHtml(b.text)}</div>`;
      }
      if (b.type === "list") {
        return `<ul>${b.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
      }
      return "";
    })
    .join("");
}
