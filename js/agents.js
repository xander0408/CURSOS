import { escapeHtml } from "./ui.js";

// Devuelve el agente asignado a una seccion, o null.
export function agentForSection(data, section) {
  if (!data.agents) return null;
  return data.agents.find((a) => a.section === section) || null;
}

// Tarjeta de tutor: avatar (SVG inline animado) + rol + mensaje + tareas.
// variant "banner" (ancho, para cabecera de seccion) o "compact".
export function agentCard(agent, { variant = "banner" } = {}) {
  if (!agent) return "";
  const tasks = (agent.tasks || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  return `
    <div class="agent-card ${variant}" style="--agent:${agent.color}">
      <div class="agent-avatar" data-agent-avatar="${escapeHtml(agent.avatar)}">
        <span class="agent-status" title="En línea"></span>
      </div>
      <div class="agent-body">
        <div class="agent-head">
          <strong>${escapeHtml(agent.name)}</strong>
          <span class="agent-role">${escapeHtml(agent.role)}</span>
        </div>
        <p class="agent-intro">${escapeHtml(agent.intro)}</p>
        ${tasks ? `<div class="agent-tasks-label">Tus tareas con ${escapeHtml(agent.name)}</div><ul class="agent-tasks">${tasks}</ul>` : ""}
      </div>
    </div>
  `;
}

// Atajo: renderiza directamente el agente de una seccion.
export function sectionAgent(data, section, opts) {
  return agentCard(agentForSection(data, section), opts);
}

// Cache de SVG ya cargados para no pedirlos dos veces.
const svgCache = new Map();

async function loadSvg(path) {
  if (svgCache.has(path)) return svgCache.get(path);
  const res = await fetch(path);
  if (!res.ok) throw new Error("no svg " + path);
  const text = await res.text();
  svgCache.set(path, text);
  return text;
}

// Inserta los SVG inline y anima los ojos.
// Debe llamarse despues de pintar el HTML de la vista.
export async function hydrateAgents(root = document) {
  const holders = root.querySelectorAll("[data-agent-avatar]");
  for (const holder of holders) {
    if (holder.dataset.hydrated) continue;
    const path = holder.getAttribute("data-agent-avatar");
    try {
      const svgText = await loadSvg(path);
      // Inserta el SVG conservando el status indicator.
      const status = holder.querySelector(".agent-status");
      holder.insertAdjacentHTML("afterbegin", svgText);
      const svg = holder.querySelector("svg");
      if (svg) {
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.classList.add("agent-svg");
        animateEyes(svg);
      }
      if (status) holder.appendChild(status);
      holder.dataset.hydrated = "1";
    } catch {
      // Si falla la carga, deja el hueco con el color del agente.
      holder.dataset.hydrated = "1";
    }
  }
}

// Detecta las pupilas del avatar (circulos medianos + brillos) y las agrupa
// para animarlas: pequeño vaiven horizontal + parpadeo.
function animateEyes(svg) {
  const circles = [...svg.querySelectorAll("circle")];
  // Pupilas: radio entre 3.5 y 5.5, aprox a la altura de los ojos (cy 22-32).
  const pupils = circles.filter((c) => {
    const r = parseFloat(c.getAttribute("r"));
    const cy = parseFloat(c.getAttribute("cy"));
    return r >= 3.5 && r <= 5.5 && cy >= 20 && cy <= 34;
  });
  // Brillos: radio pequeño cerca de la misma zona.
  const glints = circles.filter((c) => {
    const r = parseFloat(c.getAttribute("r"));
    const cy = parseFloat(c.getAttribute("cy"));
    return r >= 1.2 && r <= 2.4 && cy >= 20 && cy <= 34;
  });
  const eyeParts = [...pupils, ...glints];
  if (!eyeParts.length) return;

  eyeParts.forEach((el) => {
    el.style.transformBox = "fill-box";
    el.style.transformOrigin = "center";
    el.classList.add("agent-eye");
  });

  // Parpadeo: escala vertical de las pupilas cada cierto tiempo.
  pupils.forEach((p) => p.classList.add("agent-pupil"));
}
