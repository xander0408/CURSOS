import { getState, update, loadUser, writeSession, clearSession, readSession, logActivity } from "./store.js";
import { escapeHtml } from "./ui.js";
import { publicUrl } from "./paths.js";

let studentsData = null;

export async function loadStudents() {
  if (studentsData) return studentsData;
  try {
    const res = await fetch(publicUrl("content/students.json"));
    if (!res.ok) throw new Error();
    studentsData = await res.json();
  } catch {
    studentsData = { students: [], instructor: null };
  }
  return studentsData;
}

export function accountsOf(data) {
  const list = [...(data.students || [])];
  if (data.instructor) list.push(data.instructor);
  return list;
}

export function isLoggedIn() {
  return !!readSession()?.userId;
}

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

export function validate(data, user, password) {
  const q = norm(user);
  const acc = accountsOf(data).find(
    (s) => norm(s.username) === q || norm(s.email) === q || norm(s.name) === q
  );
  if (!acc) return null;
  if (String(password) !== String(acc.password)) return null;
  return acc;
}

export function applyLogin(acc) {
  loadUser(acc.username || acc.email);
  writeSession({ userId: acc.username || acc.email, at: Date.now() });
  update((s) => {
    s.profile.loggedIn = true;
    s.profile.email = acc.email || "";
    s.profile.username = acc.username || "";
    s.profile.role = acc.role || "";
    s.profile.displayName = acc.name || s.profile.displayName;
    s.profile.isInstructor = !!acc.isInstructor;
    if (acc.taskId) s.profile.assignedTaskId = acc.taskId;
    if (acc.isInstructor) {
      s.profile.introDone = true;
      s.progress.freeTiersAck = true;
      s.settings.instructorUnlocked = true;
    }
  });
  logActivity("login", acc.username || acc.email || "");
}

export function logout() {
  clearSession();
}

export function renderLogin(root, data, onSuccess) {
  root.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo">
          <img src="avatares/magnatic-logo-vertical.svg" alt="MagnaTic" />
        </div>
        <h1>AI Business Lab</h1>
        <p class="login-sub">Inteligencia Artificial Aplicada al Negocio</p>
        <p class="login-org">${escapeHtml(data.city || "Curso in-company")}</p>

        <div class="field">
          <label>Usuario</label>
          <input id="login-user" autocomplete="username" placeholder="Tu usuario (ej. gmejia)" />
        </div>
        <div class="field">
          <label>Contraseña</label>
          <input id="login-pass" type="password" autocomplete="current-password" placeholder="La que te dio el instructor" />
        </div>
        <button class="btn btn-primary login-btn" type="button" id="login-go">Entrar</button>
        <p class="login-msg" id="login-msg"></p>
        <p class="login-foot">Tu progreso se guarda en este navegador, separado por usuario.</p>
      </div>
    </div>
  `;

  const msg = document.getElementById("login-msg");
  const userInput = document.getElementById("login-user");

  const go = () => {
    const user = userInput.value.trim();
    const pass = document.getElementById("login-pass").value;
    if (!user) {
      msg.textContent = "Escribe o elige tu usuario.";
      return;
    }
    if (!pass) {
      msg.textContent = "Escribe tu contraseña.";
      return;
    }
    const acc = validate(data, user, pass);
    if (!acc) {
      msg.textContent = "Usuario o contraseña incorrectos.";
      return;
    }
    applyLogin(acc);
    onSuccess();
  };

  document.getElementById("login-go").addEventListener("click", go);
  document.getElementById("login-pass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
  });
}

export function gateRedirect() {
  const s = getState();
  const route = (location.hash || "#/").replace(/^#/, "") || "/";
  if (s.profile.isInstructor) return null;
  if (route.startsWith("/cronograma") || route.startsWith("/admin")) return "#/";
  return null;
}
