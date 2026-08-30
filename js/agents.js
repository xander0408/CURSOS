import { escapeHtml } from "./ui.js";
import { publicUrl } from "./paths.js";
import { getState } from "./store.js";

export function agentForSection(data, section) {
  if (!data.agents) return null;
  return data.agents.find((a) => a.section === section) || data.agents.find((a) => a.section === "dashboard") || null;
}

function liveTip(data, section) {
  const s = getState();
  if (section === "dashboard" && !s.profile.introDone) {
    return "Recomendación: 3 minutos en Conocernos (una tarea que te quite tiempo, sin datos internos). El menú no se bloquea.";
  }
  if (section === "dashboard" && !s.progress.freeTiersAck) {
    return "Recomendación: entra a Cuentas gratis y pulsa entendido. ChatGPT Free para volumen; Claude para comparar.";
  }
  if (section === "modules" || section === "module") {
    return "Sugerencia: pulsa Continuar en cada lección. Los retos no cierran el módulo siguiente. El proyecto final es viernes 2.";
  }
  if (section === "quiz") {
    return "Sugerencia: un quiz por bloque (historia, fundamentos, cierre). El de calentamiento se puede repetir en cada receso.";
  }
  if (section === "comparator") {
    return "Sugerencia: carga ambos ejemplos para ver barras distintas; luego pega TUS respuestas reales del mismo prompt.";
  }
  if (section === "project") {
    return "Esto es el examen del viernes 2. Hoy (si es viernes 1) solo anota el caso anónimo; no cierres la ficha todavía.";
  }
  if (section === "cuentas") {
    return "Si la app muestra otro modelo o un tope, gana lo que ves en pantalla. No memorices nombres de modelo.";
  }
  if (section === "actividades") {
    return "Marca misiones al terminarlas. Viernes 1: a1–a7. Viernes 2: a8–a12 y la ficha.";
  }
  return "";
}

export function agentCard(agent, { variant = "banner", tip = "" } = {}) {
  if (!agent) return "";
  const tasks = (agent.tasks || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  const skill = agent.skill
    ? `<p class="agent-skill"><span>Skill</span> ${escapeHtml(agent.skill)}</p>`
    : "";
  const how = agent.skillHow ? `<p class="muted" style="margin:0 0 8px">${escapeHtml(agent.skillHow)}</p>` : "";
  const rec = tip
    ? `<div class="agent-rec"><strong>Ahora</strong> ${escapeHtml(tip)}</div>`
    : "";
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
        ${skill}
        ${how}
        <p class="agent-intro">${escapeHtml(agent.intro)}</p>
        ${rec}
        ${tasks ? `<div class="agent-tasks-label">Qué hacer con ${escapeHtml(agent.name)}</div><ul class="agent-tasks">${tasks}</ul>` : ""}
      </div>
    </div>
  `;
}

export function sectionAgent(data, section, opts) {
  const agent = agentForSection(data, section);
  return agentCard(agent, { ...opts, tip: liveTip(data, section) });
}

const svgCache = new Map();

async function loadSvg(path) {
  if (svgCache.has(path)) return svgCache.get(path);
  const res = await fetch(publicUrl(path));
  if (!res.ok) throw new Error("no svg " + path);
  const text = await res.text();
  svgCache.set(path, text);
  return text;
}

export async function hydrateAgents(root = document) {
  const holders = root.querySelectorAll("[data-agent-avatar]");
  for (const holder of holders) {
    if (holder.dataset.hydrated) continue;
    const path = holder.getAttribute("data-agent-avatar");
    try {
      const svgText = await loadSvg(path);
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
      holder.dataset.hydrated = "1";
    }
  }
}

function animateEyes(svg) {
  const circles = [...svg.querySelectorAll("circle")];
  const pupils = circles.filter((c) => {
    const r = parseFloat(c.getAttribute("r"));
    const cy = parseFloat(c.getAttribute("cy"));
    return r >= 3.5 && r <= 5.5 && cy >= 20 && cy <= 34;
  });
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
  pupils.forEach((p) => p.classList.add("agent-pupil"));
}

export function coachSectionForRoute(name) {
  const map = {
    dashboard: "dashboard",
    perfil: "dashboard",
    cuentas: "cuentas",
    modules: "modules",
    module: "modules",
    challenges: "modules",
    quiz: "quiz",
    promptLab: "promptLab",
    comparator: "comparator",
    library: "library",
    project: "project",
    progress: "dashboard",
    actividades: "actividades",
    cronograma: "dashboard",
    admin: "dashboard",
    manual: "promptLab",
  };
  return map[name] || "dashboard";
}
