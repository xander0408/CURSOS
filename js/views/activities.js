import { getState, update, logActivity } from "../store.js";
import { escapeHtml, toast, copyText } from "../ui.js";
import { checkBadges } from "../badges.js";
import { assetUrl } from "../paths.js";

const OFFICE_GROUPS = [
  { id: "oficina", title: "Oficina del día", match: ["Minuta", "Audiencia", "Cifras", "Decisión humana", "Agenda", "Seguimiento", "Riesgos", "Gerencia"] },
  { id: "excel", title: "Excel", match: ["Excel"] },
  { id: "ppt", title: "PowerPoint", match: ["PowerPoint", "Guion"] },
  { id: "invest", title: "Investigación", match: ["Investigación"] },
  { id: "areas", title: "Casos por área", match: ["Calidad", "RR. HH.", "Finanzas", "Logística", "RSE", "Laboratorio", "Comercial"] },
  { id: "cierre", title: "Cierre y proyecto", match: ["Proyecto"] },
];

function groupChats(chats) {
  const used = new Set();
  const blocks = OFFICE_GROUPS.map((g) => {
    const items = chats.filter((t) => g.match.includes(t.focus));
    items.forEach((t) => used.add(t.id));
    return { ...g, items };
  });
  const rest = chats.filter((t) => !used.has(t.id));
  if (rest.length) blocks.push({ id: "mas", title: "Más prácticas", match: [], items: rest });
  return blocks.filter((b) => b.items.length);
}

export function renderActivities(data, { day = 1 } = {}) {
  const pack = data.activities;
  const done = getState().progress.labs?.checks || {};
  const wantDay2 = Number(day) === 2;
  const chats = (pack.chatTasks || []).filter((t) => (wantDay2 ? t.day === 2 : t.day !== 2));
  const chatOk = chats.filter((i) => done[i.id]).length;
  const extras = (pack.items || []).filter((it) => (wantDay2 ? it.day === 2 : it.day !== 2));
  const officeIds = ["a13", "a14", "a15"];
  const office = extras.filter((it) => officeIds.includes(it.id));
  const versus = extras.filter((it) => it.versus);
  const groups = extras.filter((it) => it.group && !it.versus);
  const rest = extras.filter((it) => !officeIds.includes(it.id) && !it.group && !it.versus);
  const n = extras.length;
  const ok = extras.filter((i) => done[i.id]).length;

  const order = new Map(chats.map((t, i) => [t.id, i + 1]));

  function chatCard(it) {
    const on = !!done[it.id];
    const num = order.get(it.id) || it.n;
    return `<div class="card activity-card chat-task ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">Tarea ${num} de ${chats.length} · ${escapeHtml(it.focus || "Práctica")} · ${it.mins} min</p>
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          <p><strong>Qué mirar:</strong> ${escapeHtml(it.look)}</p>
          <pre class="prompt-preview show" id="chat-prompt-${escapeHtml(it.id)}">${escapeHtml(it.prompt)}</pre>
          <div class="btn-row">
            <button class="btn btn-primary" type="button" data-copy-chat="${escapeHtml(it.id)}">Copiar y pegar en los dos chats</button>
            <a class="btn" href="https://chatgpt.com/" target="_blank" rel="noopener">Abrir ChatGPT</a>
            <a class="btn" href="https://claude.ai/" target="_blank" rel="noopener">Abrir Claude</a>
            <a class="btn" href="#/comparador/${escapeHtml(it.id)}">Ver comparativo en vivo</a>
          </div>
        </div>
      </div>`;
  }

  function itemCard(it) {
    const on = !!done[it.id];
    const resources = Array.isArray(it.resources)
      ? `<div class="btn-row">${it.resources
          .map((resource) => {
            const path = typeof resource === "string" ? resource : resource?.path;
            if (!path) return "";
            const label =
              typeof resource === "string"
                ? resource.split("/").pop() || "Descargar recurso"
                : resource.label || "Descargar recurso";
            const fname = path.split("/").pop() || "recurso";
            return `<a class="btn btn-primary" href="${escapeHtml(assetUrl(path))}" download="${escapeHtml(fname)}">${escapeHtml(label)}</a>`;
          })
          .join("")}</div>`
      : "";
    const checklist = Array.isArray(it.checklist)
      ? `<div class="activity-checklist">
            <strong>Lista de verificación:</strong>
            <ul>${it.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>`
      : "";
    const group = it.group
      ? `<p class="pill ok">En grupo · ${escapeHtml(it.group.size)}</p>
          <p><strong>Roles:</strong> ${escapeHtml(it.group.roles)}</p>`
      : "";
    const times = getState().progress.labs?.versus?.[it.id] || {};
    const versusBox = it.versus && it.id !== "g-versus-regla"
      ? `<div class="activity-checklist" style="margin-top:14px">
            <strong>Cronómetro de la mesa</strong>
            <p class="muted">Fase A: 40 minutos. Solo Word, Excel y PowerPoint. Sin IA y sin internet.</p>
            <div class="field"><label>Minutos reales de la Fase A (manual)</label>
              <input data-versus="${escapeHtml(it.id)}" data-versus-field="manualMin" type="number" min="0" max="120" value="${escapeHtml(times.manualMin || "")}" placeholder="40" /></div>
            <p class="muted">Fase B: la misma entrega, ahora sí pueden usar ChatGPT y Claude. Midan el reloj.</p>
            <div class="field"><label>Minutos reales de la Fase B (con IA)</label>
              <input data-versus="${escapeHtml(it.id)}" data-versus-field="aiMin" type="number" min="0" max="120" value="${escapeHtml(times.aiMin || "")}" placeholder="ej. 18" /></div>
            <div class="field"><label>Tres diferencias que vieron (velocidad, calidad, huecos, riesgo)</label>
              <textarea data-versus="${escapeHtml(it.id)}" data-versus-field="notes" rows="4" placeholder="Ej. Con IA salió más rápido, pero inventó una fecha; a mano el Excel quedó más simple y honesto.">${escapeHtml(times.notes || "")}</textarea></div>
          </div>`
      : "";
    return `<div class="card activity-card ${on ? "done" : ""}">
        <input type="checkbox" data-act="${escapeHtml(it.id)}" ${on ? "checked" : ""} />
        <div>
          <p class="muted">${it.versus ? "Manual vs IA" : it.group ? "Práctica en grupo" : "Individual"} · ${it.mins} min</p>
          ${group}
          <h3>${escapeHtml(it.title)}</h3>
          <p>${escapeHtml(it.do)}</p>
          ${resources}
          ${checklist}
          ${versusBox}
        </div>
      </div>`;
  }

  const chatHtml = wantDay2
    ? groupChats(chats)
        .map((g) => `<h3 style="margin-top:28px">${escapeHtml(g.title)}</h3><div class="activity-grid">${g.items.map(chatCard).join("")}</div>`)
        .join("")
    : `<div class="activity-grid">${chats.map(chatCard).join("")}</div>`;

  return `
    <div class="page-head">
      <h2>${wantDay2 ? "Tareas · Oficina + IA" : "Tareas en ChatGPT y Claude"}</h2>
      <p>${
        wantDay2
          ? "Un viernes completo: oficina del día, Excel, PowerPoint, investigación, casos por área y cierre. El mismo texto en los dos chats, salvo que la tarjeta diga otra cosa."
          : "Prácticas de esta jornada. En la mayoría, el mismo texto en los dos chats."
      } No envíes el resultado.</p>
      <p><strong>${chatOk} de ${chats.length}</strong> tareas de chat · <strong>${ok} de ${n}</strong> prácticas de lista.</p>
    </div>
    ${chatHtml}
    ${
      wantDay2 && office.length
        ? `<div class="page-head" style="margin-top:28px">
      <h2>Tres prácticas con archivos de Office</h2>
      <p>Excel, PowerPoint y Word de práctica. Ábralos en Microsoft Office. No use libros reales.</p>
    </div>
    <div class="activity-grid">${office.map(itemCard).join("")}</div>`
        : ""
    }
    <div class="page-head" style="margin-top:28px">
      <h2>${wantDay2 ? "Más prácticas de esta jornada" : escapeHtml(pack.title)}</h2>
      <p>${wantDay2 ? "Marca cada una al terminar. Son el puente entre el chat y el proyecto." : escapeHtml(pack.subtitle)}</p>
    </div>
    <div class="activity-grid">${(wantDay2 ? rest : extras).map(itemCard).join("")}</div>
    ${
      wantDay2 && versus.length
        ? `<div class="page-head" style="margin-top:28px">
      <h2>En grupo: 40 minutos a mano, luego con IA</h2>
      <p>Cuatro casos. El instructor asigna uno por mesa. Primero cierran internet y la IA: solo Word, Excel y PowerPoint. Después repiten la misma entrega con IA y comparan minutos.</p>
    </div>
    <div class="activity-grid">${versus.map(itemCard).join("")}</div>`
        : ""
    }
    ${
      wantDay2 && groups.length
        ? `<div class="page-head" style="margin-top:28px">
      <h2>Otras prácticas en grupo</h2>
      <p>Mesas de 3 o 4. El proyecto final es de cada persona.</p>
    </div>
    <div class="activity-grid">${groups.map(itemCard).join("")}</div>`
        : ""
    }
  `;
}

export function bindActivities(data) {
  document.querySelectorAll("[data-act]").forEach((el) => {
    el.addEventListener("change", () => {
      const id = el.getAttribute("data-act");
      update((s) => {
        s.progress.labs = s.progress.labs || {};
        s.progress.labs.checks = s.progress.labs.checks || {};
        s.progress.labs.checks[id] = el.checked;
      });
      logActivity("actividad", `${id}: ${el.checked ? "hecha" : "desmarcada"}`);
      toast(el.checked ? "Actividad marcada." : "Actividad desmarcada.");
      if (data) checkBadges(data);
    });
  });
  document.querySelectorAll("[data-copy-chat]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute("data-copy-chat");
      copyText(document.getElementById("chat-prompt-" + id)?.innerText || "");
    });
  });
  document.querySelectorAll("[data-versus]").forEach((el) => {
    const save = () => {
      const id = el.getAttribute("data-versus");
      const field = el.getAttribute("data-versus-field");
      update((s) => {
        s.progress.labs = s.progress.labs || {};
        s.progress.labs.versus = s.progress.labs.versus || {};
        s.progress.labs.versus[id] = { ...(s.progress.labs.versus[id] || {}), [field]: el.value };
      });
    };
    el.addEventListener("input", save);
    el.addEventListener("change", save);
  });
}
