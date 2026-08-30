import { escapeHtml } from "../ui.js";

function slots(list) {
  return `<ol class="crono-list">${list
    .map((x) => `<li><span class="crono-t">${escapeHtml(x.t)}</span><span>${escapeHtml(x.what)}</span></li>`)
    .join("")}</ol>`;
}

export function renderCronograma(data) {
  const s = data.schedule;
  return `
    <div class="page-head">
      <h2>${escapeHtml(s.title)}</h2>
      <p>${escapeHtml(s.hours)} · ${escapeHtml(s.goal)}</p>
    </div>
    <div class="card">
      <h3>Antes del primer viernes</h3>
      <ul>${s.before.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <h3>Viernes 1</h3>
        ${slots(s.friday1)}
      </div>
      <div class="card">
        <h3>Viernes 2</h3>
        ${slots(s.friday2)}
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Cómo manejar el aula</h3>
      <ul>${s.facilitate.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
    </div>
  `;
}
