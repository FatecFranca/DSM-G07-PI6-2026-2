import type { AuthResponse } from "./api";

const SESSION_KEY = "cafe-pi-session";

export function readSession(): AuthResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthResponse;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthResponse) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
