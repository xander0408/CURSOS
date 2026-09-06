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
  const el = document.getElementById("class-clock");
  if (!el) return;
  const left = remainMs(clock);
  const running = !!clock?.running && left > 0;
  el.classList.toggle("is-on", running);
  el.classList.toggle("is-warn", running && left <= 60 * 1000);
  el.classList.toggle("is-up", !!clock?.running && left === 0);
  if (!clock?.running) {
    el.hidden = true;
    el.textContent = "";
    el.title = "";
    return;
  }
  el.hidden = false;
  const label = clock.label ? `${clock.label} · ` : "";
  if (left === 0) {
    el.textContent = `${label}Tiempo`;
    el.title = "Se acabó el tiempo de esta actividad";
    return;
  }
  el.textContent = `${label}${fmt(left)}`;
  el.title = "Tiempo de la actividad en curso";
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
  const start = document.getElementById("clock-start");
  const stop = document.getElementById("clock-stop");
  if (!start) return;
  start.onclick = async () => {
    const minutes = document.getElementById("clock-min")?.value;
    const label = document.getElementById("clock-label")?.value;
    const r = await pushClock({ minutes, label, action: "start" });
    paintFace(readLocal());
    toast(r.localOnly && !syncEnabled() ? "Reloj local. Con servidor, lo ven todos los alumnos." : "Reloj en marcha. Los alumnos lo ven arriba.");
  };
  stop.onclick = async () => {
    await pushClock({ action: "stop", minutes: 1, label: "Actividad" });
    paintFace(readLocal());
    toast("Reloj detenido.");
  };
}
