import { syncEnabled, fetchClockRemote, pushClockRemote } from "./sync.js";
import { toast } from "./ui.js";
import { assetUrl } from "./paths.js";

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
    if (labelEl) labelEl.textContent = "Timer";
    if (statusEl) statusEl.textContent = "Sin actividad en curso.";
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

export function renderTimerPage() {
  return `
    <section class="timer-page" id="module-clock" aria-live="polite">
      <figure class="timer-nova" aria-label="Nova vigilando el aula">
        <div class="timer-nova-frame" id="timer-nova"></div>
      </figure>
      <div class="timer-digits">
        <p class="module-clock-label">Timer</p>
        <p class="module-clock-time">00:00</p>
        <p class="module-clock-status">Sin actividad en curso.</p>
        <div class="clock-controls module-clock-instructor">
          <label>Minutos <input id="clock-min" type="number" min="1" max="180" value="10" /></label>
          <label>Etiqueta <input id="clock-label" maxlength="40" value="Actividad" /></label>
          <button class="btn btn-primary" type="button" id="clock-start">Iniciar</button>
          <button class="btn btn-ghost" type="button" id="clock-stop">Detener</button>
        </div>
      </div>
    </section>
  `;
}

let novaRaf = 0;
let novaMove = null;
let novaBlinkT = 0;

export function stopTimerNova() {
  if (novaRaf) cancelAnimationFrame(novaRaf);
  novaRaf = 0;
  if (novaMove) {
    window.removeEventListener("pointermove", novaMove);
    novaMove = null;
  }
}

export async function bindTimerNova() {
  stopTimerNova();
  const host = document.getElementById("timer-nova");
  if (!host) return;
  try {
    const res = await fetch(assetUrl("avatares/nova-timer.svg"), { cache: "no-store" });
    if (!res.ok) return;
    host.innerHTML = await res.text();
    if (!host.isConnected) return;
  } catch {
    return;
  }
  const svg = host.querySelector("svg");
  if (!svg) return;
  const pupils = host.querySelectorAll(".nova-pupils");
  const lids = host.querySelector(".nova-lids");
  const mouth = host.querySelector(".nova-mouth-line");
  const yawn = host.querySelector(".nova-yawn");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let targetX = 0;
  let targetY = 0.28;
  let curX = 0;
  let curY = 0.28;
  let lastPtr = 0;
  novaMove = (e) => {
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.34;
    targetX = Math.max(-1, Math.min(1, (e.clientX - cx) / Math.max(80, r.width * 0.55)));
    targetY = Math.max(-0.7, Math.min(1, (e.clientY - cy) / Math.max(80, r.height * 0.5)));
    lastPtr = performance.now();
  };
  window.addEventListener("pointermove", novaMove, { passive: true });
  novaBlinkT = 1800 + Math.random() * 2200;
  const yawnEvery = 7800;
  const tick = (t) => {
    if (reduce) {
      pupils.forEach((p) => p.setAttribute("transform", "translate(0 1.2)"));
      return;
    }
    if (t - lastPtr > 1600) {
      targetX = Math.sin(t / 2400) * 0.72;
      targetY = 0.32 + Math.sin(t / 3100) * 0.18;
    }
    curX += (targetX - curX) * 0.07;
    curY += (targetY - curY) * 0.07;
    const dx = curX * 2.35;
    const dy = 0.4 + curY * 1.85;
    pupils.forEach((p) => p.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`));

    const yawnPhase = (t + novaBlinkT) % yawnEvery;
    const yawning = yawnPhase > yawnEvery - 1600;
    let yawnAmt = 0;
    if (yawning) {
      const u = (yawnPhase - (yawnEvery - 1600)) / 1600;
      yawnAmt = u < 0.35 ? u / 0.35 : u < 0.62 ? 1 : 1 - (u - 0.62) / 0.38;
      yawnAmt = Math.max(0, Math.min(1, yawnAmt));
    }
    if (mouth) {
      const talk = 40.4 + Math.sin(t / 280) * 1.6 + Math.sin(t / 510) * 0.8;
      const dip = yawning ? 41 + yawnAmt * 8.5 : talk;
      mouth.setAttribute("d", `M${34 - yawnAmt * 1.2} 37 Q40 ${dip.toFixed(2)} ${46 + yawnAmt * 1.2} 37`);
      mouth.setAttribute("opacity", String(0.72 - yawnAmt * 0.55));
    }
    if (yawn) {
      yawn.setAttribute("ry", (0.5 + yawnAmt * 6.2).toFixed(2));
      yawn.setAttribute("rx", (4.1 + yawnAmt * 2.4).toFixed(2));
      yawn.setAttribute("cy", (39.2 + yawnAmt * 2.2).toFixed(2));
      yawn.setAttribute("opacity", (yawnAmt * 0.82).toFixed(2));
    }
    if (lids) {
      const blink = (t + novaBlinkT) % 5200;
      const blinking = blink > 5020 && blink < 5120;
      lids.setAttribute("opacity", blinking || yawnAmt > 0.35 ? (blinking ? "1" : String(0.25 + yawnAmt * 0.55)) : "0");
    }
    novaRaf = requestAnimationFrame(tick);
  };
  novaRaf = requestAnimationFrame(tick);
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
