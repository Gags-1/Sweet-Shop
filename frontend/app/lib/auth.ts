// Simple client-side role management for demo/dev purposes.
// In production, replace with real auth (JWT/cookies + server checks).

const ROLE_KEY = "role";

export type UserRole = "admin" | "user" | null;

export function getUserRole(): UserRole {
  try {
    if (typeof localStorage === "undefined") return null;
    const value = localStorage.getItem(ROLE_KEY);
    if (value === "admin" || value === "user") return value;
    return null;
  } catch {
    return null;
  }
}

export function setUserRole(role: Exclude<UserRole, null>) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    // ignore
  }
}

export function clearUserRole() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(ROLE_KEY);
  } catch {
    // ignore
  }
}

export function isAdmin() {
  return getUserRole() === "admin";
}
