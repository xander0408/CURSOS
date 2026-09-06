import { escapeHtml } from "./ui.js";
import { assetUrl } from "./paths.js";
import { getState } from "./store.js";

export function agentForSection(data, section) {
  if (!data.agents) return null;
  return (
    data.agents.find((a) => a.section === section || (a.sections || []).includes(section)) ||
    data.agents.find((a) => a.id === "nova") ||
    null
  );
}

function liveTip(data, section) {
  const s = getState();
  if (section === "dashboard" && !s.profile.introDone) {
    return "Completa el perfil para continuar.";
  }
  if (section === "dashboard" && !s.progress.freeTiersAck) {
    return "Revisa los planes gratuitos antes de los módulos.";
  }
  if (section === "modules" || section === "module") {
    return "Marca Continuar al terminar cada lección.";
  }
  if (section === "quiz") {
    return "Un cuestionario por bloque. Puedes repetirlo.";
  }
  if (section === "comparator") {
    return "Mismo texto en ambas herramientas. Pega las respuestas y compara.";
  }
  if (section === "project") {
    return "Completa los pasos y guarda la ficha al final.";
  }
  if (section === "cuentas") {
    return "Usa los límites que ves en pantalla.";
  }
  if (section === "actividades") {
    return "Las cuatro tareas usan el mismo texto en ChatGPT y en Claude.";
  }
  return "";
}

export function agentCard(agent, { variant = "compact", tip = "" } = {}) {
  if (!agent) return "";
  const compact = variant !== "banner";
  const rec = tip
    ? `<div class="agent-rec">${escapeHtml(tip)}</div>`
    : `<p class="agent-intro">${escapeHtml(agent.intro)}</p>`;
  const extra = compact
    ? ""
    : `${agent.skill ? `<p class="agent-skill"><span>Skill</span> ${escapeHtml(agent.skill)}</p>` : ""}`;
  return `
    <div class="agent-card ${compact ? "compact" : "banner"}" style="--agent:${agent.color}">
      <div class="agent-avatar" data-agent-avatar="${escapeHtml(agent.avatar)}">
        <span class="agent-status" title="En línea"></span>
      </div>
      <div class="agent-body">
        <div class="agent-head">
          <strong>${escapeHtml(agent.name)}</strong>
          <span class="agent-role">${escapeHtml(agent.role)}</span>
        </div>
        ${extra}
        ${rec}
      </div>
    </div>
  `;
}

export function sectionAgent(data, section, opts = {}) {
  const agent = agentForSection(data, section);
  const variant = opts.variant || (section === "dashboard" ? "banner" : "compact");
  return agentCard(agent, { ...opts, variant, tip: liveTip(data, section) });
}

const svgCache = new Map();

async function loadSvg(path) {
  const key = assetUrl(path);
  if (svgCache.has(key)) return svgCache.get(key);
  const res = await fetch(key, { cache: "no-store" });
  if (!res.ok) throw new Error("no svg " + path);
  const text = await res.text();
  svgCache.set(key, text);
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
