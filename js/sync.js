import { getState, replaceState } from "./store.js";

const CRED_PREFIX = "aiBusinessLab.cred.";

let apiUrl = "";
let pushTimer = null;
let pushing = false;

export function setSyncApi(url) {
  apiUrl = String(url || "").replace(/\/+$/, "");
}

export function syncEnabled() {
  return !!apiUrl;
}

export function rememberPassword(username, password) {
  try {
    if (username && password) localStorage.setItem(CRED_PREFIX + username, password);
  } catch {
    /* ignorar */
  }
}

export function forgetPassword(username) {
  try {
    if (username) localStorage.removeItem(CRED_PREFIX + username);
  } catch {
    /* ignorar */
  }
}

function creds() {
  const u = getState().profile.username;
  if (!u) return null;
  try {
    const p = localStorage.getItem(CRED_PREFIX + u);
    if (!p) return null;
    return { username: u, password: p };
  } catch {
    return null;
  }
}

export function schedulePush() {
  if (!apiUrl) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushNow();
  }, 1500);
}

export async function pushNow() {
  if (!apiUrl || pushing) return { ok: false };
  const c = creds();
  if (!c) return { ok: false };
  pushing = true;
  try {
    const res = await fetch(apiUrl + "/v1/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: c.username, password: c.password, state: getState() }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  } finally {
    pushing = false;
  }
}

export async function pullIntoLocal() {
  if (!apiUrl) return false;
  const c = creds();
  if (!c) return false;
  try {
    const q = new URLSearchParams({ username: c.username, password: c.password });
    const res = await fetch(apiUrl + "/v1/load?" + q.toString(), { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.state) return false;
    const remoteTs = Number(data.updatedAt || data.state.progress?.updatedAt || 0);
    const localTs = Number(getState().progress?.updatedAt || 0);
    if (remoteTs >= localTs) {
      replaceState(data.state, { skipCloud: true });
      return true;
    }
  } catch {
    /* red */
  }
  return false;
}

export async function fetchAdminSaves() {
  if (!apiUrl) return { error: "sin-servidor", saves: [] };
  const c = creds();
  if (!c) return { error: "sin-clave", saves: [] };
  try {
    const q = new URLSearchParams({ username: c.username, password: c.password });
    const res = await fetch(apiUrl + "/v1/admin?" + q.toString(), { cache: "no-store" });
    if (res.status === 403) return { error: "no-admin", saves: [] };
    if (!res.ok) return { error: "http", saves: [] };
    const data = await res.json();
    return { error: null, saves: data.saves || [] };
  } catch {
    return { error: "red", saves: [] };
  }
}
