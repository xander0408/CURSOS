import { syncEnabled, fetchClockRemote, pushClockRemote } from "./sync.js";
import { toast } from "./ui.js";

const LOCAL_KEY = "aiBusinessLab.classClock";
let tickTimer = null;
let pollTimer = null;

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
  } catch {
    return null;
  }
}

function writeLocal(obj) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(obj));
  } catch {
    /* ignorar */
  }
}

export async function fetchClock() {
  const remote = await fetchClockRemote();
  if (remote && typeof remote.running === "boolean") {
    writeLocal(remote);
    return remote;
  }
  return readLocal();
}

export async function pushClock({ minutes, label, action }) {
  const payload = {
    minutes: Number(minutes) || 10,
    label: String(label || "Actividad").slice(0, 40),
    action: action || "start",
  };
  const now = Date.now();
  const local =
    action === "stop"
      ? { running: false, endsAt: 0, label: payload.label, minutes: payload.minutes, startedAt: now }
      : {
          running: true,
          minutes: payload.minutes,
          label: payload.label,
          startedAt: now,
          endsAt: now + payload.minutes * 60 * 1000,
        };
  writeLocal(local);
  const r = await pushClockRemote(payload);
  if (r.ok && r.data?.clock) writeLocal(r.data.clock);
  return { ok: true, localOnly: !r.ok };
}

function remainMs(clock) {
  if (!clock?.running || !clock.endsAt) return 0;
  return Math.max(0, Number(clock.endsAt) - Date.now());
}

function fmt(ms) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function paintFace(clock) {
  const el = document.getElementById("module-clock");
  if (!el) return;
  const timeEl = el.querySelector(".module-clock-time");
  const labelEl = el.querySelector(".module-clock-label");
  const statusEl = el.querySelector(".module-clock-status");
  const left = remainMs(clock);
  const running = !!clock?.running && left > 0;
  const ended = !!clock?.running && left === 0;
  el.classList.toggle("is-on", running);
  el.classList.toggle("is-warn", running && left <= 60 * 1000);
  el.classList.toggle("is-up", ended);
  el.hidden = false;
  if (!clock?.running) {
    if (timeEl) timeEl.textContent = "00:00";
    if (labelEl) labelEl.textContent = "Reloj del aula";
    if (statusEl) statusEl.textContent = "Sin actividad en curso. El instructor inicia el tiempo aquí.";
    return;
  }
  if (labelEl) labelEl.textContent = clock.label || "Actividad";
  if (ended) {
    if (timeEl) timeEl.textContent = "00:00";
    if (statusEl) statusEl.textContent = "Se acabó el tiempo.";
    return;
  }
  if (timeEl) timeEl.textContent = fmt(left);
  if (statusEl) statusEl.textContent = left <= 60 * 1000 ? "Último minuto." : "Tiempo de la actividad en curso.";
}

export async function refreshClockFace() {
  const clock = await fetchClock();
  paintFace(clock);
}

export function startClockLoop() {
  stopClockLoop();
  refreshClockFace();
  tickTimer = window.setInterval(() => {
    paintFace(readLocal() || { running: false });
  }, 250);
  pollTimer = window.setInterval(refreshClockFace, syncEnabled() ? 2500 : 8000);
}

export function stopClockLoop() {
  window.clearInterval(tickTimer);
  window.clearInterval(pollTimer);
  tickTimer = null;
  pollTimer = null;
}

export function bindInstructorClock() {
  if (window.__ablClockBound) return;
  window.__ablClockBound = true;
  document.addEventListener("click", async (e) => {
    const start = e.target.closest("#clock-start");
    const stop = e.target.closest("#clock-stop");
    if (start) {
      const minutes = document.getElementById("clock-min")?.value;
      const label = document.getElementById("clock-label")?.value;
      const r = await pushClock({ minutes, label, action: "start" });
      paintFace(readLocal());
      toast(r.localOnly && !syncEnabled() ? "Temporizador iniciado en este equipo." : "Temporizador iniciado.");
    }
    if (stop) {
      await pushClock({ action: "stop", minutes: 1, label: "Actividad" });
      paintFace(readLocal());
      toast("Temporizador detenido.");
    }
  });
}
