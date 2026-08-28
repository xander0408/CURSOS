import { escapeHtml } from "./ui.js";

// Devuelve el agente asignado a una seccion, o null.
export function agentForSection(data, section) {
  if (!data.agents) return null;
  return data.agents.find((a) => a.section === section) || null;
}

// Tarjeta de tutor: avatar + rol + mensaje + tareas.
// variant "banner" (ancho, para cabecera de seccion) o "compact".
export function agentCard(agent, { variant = "banner" } = {}) {
  if (!agent) return "";
  const tasks = (agent.tasks || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");
  return `
    <div class="agent-card ${variant}" style="--agent:${agent.color}">
      <div class="agent-avatar">
        <img src="${agent.avatar}" alt="${escapeHtml(agent.name)}" loading="lazy" />
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
