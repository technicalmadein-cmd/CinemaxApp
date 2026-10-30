import { authStore } from "./storage";

export const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL as string;

let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = async (v: string | null) => {
  accessToken = v;
  await authStore.setAccess(v);
};

export type ApiUser = { id: string; email: string; role: "user" | "admin"; name?: string };

async function raw(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

export async function apiRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  let r = await raw(path, init);
  if (r.status === 401 && path !== "/api/auth/refresh") {
    const refresh = await authStore.getRefresh();
    if (refresh) {
      const rr = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (rr.ok) {
        const t = await rr.json();
        await setAccessToken(t.access_token);
        await authStore.setRefresh(t.refresh_token);
        r = await raw(path, init);
      }
    }
  }
  if (!r.ok) {
    let detail = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      detail = j.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  if (r.status === 204) return undefined as any;
  return r.json();
}

export async function login(email: string, password: string): Promise<ApiUser> {
  const body = new URLSearchParams({ username: email, password });
  const r = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error("Incorrect email or password");
  const t = await r.json();
  await setAccessToken(t.access_token);
  await authStore.setRefresh(t.refresh_token);
  return t.user as ApiUser;
}

export async function signup(email: string, password: string, name?: string): Promise<ApiUser> {
  const r = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!r.ok) {
    let msg = "Signup failed";
    try {
      msg = (await r.json()).detail || msg;
    } catch {}
    throw new Error(msg);
  }
  const t = await r.json();
  await setAccessToken(t.access_token);
  await authStore.setRefresh(t.refresh_token);
  return t.user as ApiUser;
}

export async function logout() {
  const refresh = await authStore.getRefresh();
  if (refresh) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
    } catch {}
  }
  await setAccessToken(null);
  await authStore.setRefresh(null);
}

export async function restoreSession(): Promise<ApiUser | null> {
  const refresh = await authStore.getRefresh();
  if (!refresh) return null;
  try {
    const rr = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!rr.ok) throw new Error();
    const t = await rr.json();
    await setAccessToken(t.access_token);
    await authStore.setRefresh(t.refresh_token);
    return t.user as ApiUser;
  } catch {
    await setAccessToken(null);
    await authStore.setRefresh(null);
    return null;
  }
}

// Build an absolute streaming URL from a backend-relative "/api/files/..."
export function mediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}
