import { getState, update } from "./store.js";
import { escapeHtml } from "./ui.js";

// Nota: en un sitio estatico esto es identificacion, no seguridad real.
// La contraseña vive en students.json (visible en el codigo). Sirve para
// que cada alumno entre con su sesion y personalice su progreso.

let studentsData = null;

export async function loadStudents() {
  if (studentsData) return studentsData;
  try {
    const res = await fetch("content/students.json");
    if (!res.ok) throw new Error();
    studentsData = await res.json();
  } catch {
    studentsData = { students: [], accessPassword: "" };
  }
  return studentsData;
}

export function isLoggedIn() {
  return !!getState().profile.loggedIn;
}

function norm(s) {
  return String(s || "").trim().toLowerCase();
}

// Valida credenciales contra la lista. Devuelve el alumno o null.
export function validate(data, emailOrName, password) {
  const pass = data.accessPassword || "";
  if (norm(password) !== norm(pass)) return null;
  const q = norm(emailOrName);
  return (
    data.students.find((s) => norm(s.email) === q || norm(s.name) === q) || null
  );
}

export function logout() {
  update((s) => {
    s.profile.loggedIn = false;
  });
}

// Pantalla de acceso. Llama onSuccess() cuando el login es correcto.
export function renderLogin(root, data, onSuccess) {
  const options = data.students
    .map((s) => `<option value="${escapeHtml(s.email)}">${escapeHtml(s.name)} — ${escapeHtml(s.role)}</option>`)
    .join("");

  root.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="login-logo">
          <img src="avatares/magnatic-logo-vertical.svg" alt="MagnaTic" />
        </div>
        <h1>AI Business Lab</h1>
        <p class="login-sub">Inteligencia Artificial Aplicada al Negocio</p>
        <p class="login-org">${escapeHtml(data.org || "")} · ${escapeHtml(data.city || "")}</p>

        <div class="field">
          <label>Selecciona tu nombre</label>
          <select id="login-user">
            <option value="">— Elige de la lista —</option>
            ${options}
          </select>
        </div>
        <div class="field">
          <label>Contraseña del curso</label>
          <input id="login-pass" type="password" placeholder="Te la da el instructor" />
        </div>
        <button class="btn btn-primary login-btn" type="button" id="login-go">Entrar</button>
        <p class="login-msg" id="login-msg"></p>
        <p class="login-foot">Tu progreso se guarda en este navegador. MagnaTic · Think Evolution.</p>
      </div>
    </div>
  `;

  const msg = document.getElementById("login-msg");
  const go = () => {
    const user = document.getElementById("login-user").value;
    const pass = document.getElementById("login-pass").value;
    if (!user) { msg.textContent = "Selecciona tu nombre de la lista."; return; }
    if (!pass) { msg.textContent = "Escribe la contraseña del curso."; return; }
    const student = validate(data, user, pass);
    if (!student) { msg.textContent = "Contraseña incorrecta. Pídela al instructor."; return; }
    update((s) => {
      s.profile.loggedIn = true;
      s.profile.email = student.email;
      s.profile.role = student.role || "";
      if (!s.profile.displayName) s.profile.displayName = student.name;
    });
    onSuccess();
  };

  document.getElementById("login-go").addEventListener("click", go);
  document.getElementById("login-pass").addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
  });
}
