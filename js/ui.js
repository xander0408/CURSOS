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
      (s, i) => `<button type="button" class="${i === activeIndex ? "on" : ""}" tabindex="-1">
        <span class="letter">${s.letter}</span>${s.name}
      </button>`
    ).join("")}
  </div>`;
}

export function progressBar(pct) {
  const n = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="progress"><span style="width:${n}%"></span></div>`;
}

export function pillForDifficulty(d) {
  const map = { basico: "ok", intermedio: "warn", avanzado: "hard" };
  return `<span class="pill ${map[d] || ""}">${d || "basico"}</span>`;
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

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copiado. Pégalo en ChatGPT o Claude.");
  } catch {
    toast("No se pudo copiar. Selecciona el texto manualmente.");
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
