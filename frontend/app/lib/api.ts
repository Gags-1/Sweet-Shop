const BASE_URL = "https://sweet-shop-ulq1.onrender.com";

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText;
    const error: any = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function login(email: string, password: string): Promise<string> {
  const body = { email, password };
  const data = await fetchJson(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // returns { access_token, token_type }
  return data.access_token as string;
}

export async function register(username: string, email: string, password: string) {
  const body = { username, email, password };
  return fetchJson(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function isAdmin(token: string): Promise<boolean> {
  // Probe an admin-only endpoint without side effects:
  // POST /api/sweets/0/restock expects body { quantity }, and requires admin.
  // - If admin: missing body => 422 Unprocessable Entity
  // - If not admin: 403 Forbidden
  // - If not authenticated: 401 Unauthorized
  const url = `${BASE_URL}/api/sweets/0/restock`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: "{}", // intentionally invalid to trigger 422 for admins
  });
  if (res.status === 401 || res.status === 403) return false;
  if (res.status === 422) return true;
  // Fallback: if server responds OK (unlikely), treat as admin
  if (res.ok) return true;
  return false;
}

export function saveToken(token: string) {
  try {
    localStorage.setItem("token", token);
  } catch {}
}

export function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem("token");
  } catch {}
}

export async function getSweets(token?: string) {
  const url = `${BASE_URL}/api/sweets`;
  const withAuth = token
    ? { headers: { Authorization: `Bearer ${token}` } as Record<string, string> }
    : undefined;
  try {
    return await fetchJson(url, withAuth);
  } catch (e: any) {
    // If we sent a token and got 401, retry without auth to allow public access
    if (token && e?.status === 401) {
      return fetchJson(url);
    }
    throw e;
  }
}

export async function searchSweets(
  token: string | undefined,
  query: { name?: string; category?: string; min_price?: number; max_price?: number }
) {
  const params = new URLSearchParams();
  if (query.name) params.set("name", query.name);
  if (query.category) params.set("category", query.category);
  if (typeof query.min_price === "number") params.set("min_price", String(query.min_price));
  if (typeof query.max_price === "number") params.set("max_price", String(query.max_price));
  const qs = params.toString();
  const url = `${BASE_URL}/api/sweets/search${qs ? `?${qs}` : ""}`;
  const withAuth = token
    ? { headers: { Authorization: `Bearer ${token}` } as Record<string, string> }
    : undefined;
  try {
    return await fetchJson(url, withAuth);
  } catch (e: any) {
    if (token && e?.status === 401) {
      return fetchJson(url);
    }
    throw e;
  }
}

// Admin/user sweets mutations
export async function createSweet(
  token: string,
  body: { name: string; category: string; price: number; quantity: number }
) {
  return fetchJson(`${BASE_URL}/api/sweets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function updateSweet(
  token: string,
  id: number | string,
  body: { name: string; category: string; price: number; quantity: number }
) {
  return fetchJson(`${BASE_URL}/api/sweets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

export async function deleteSweet(token: string, id: number | string) {
  const res = await fetch(`${BASE_URL}/api/sweets/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}

export async function restockSweet(
  token: string,
  id: number | string,
  quantity: number
) {
  return fetchJson(`${BASE_URL}/api/sweets/${id}/restock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });
}

export async function purchaseSweet(
  token: string,
  id: number | string,
  quantity: number
) {
  return fetchJson(`${BASE_URL}/api/sweets/${id}/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });
}

export function getUsernameFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodeBase64 = (b64: string) => {
      // Browser or Node
      if (typeof atob === "function") return atob(b64);
      // eslint-disable-next-line no-undef
      if (typeof Buffer !== "undefined") return Buffer.from(b64, "base64").toString("binary");
      return "";
    };
    const bin = decodeBase64(base64);
    const jsonPayload = decodeURIComponent(
      bin
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return typeof payload?.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// Cookie helpers for SSR-aware auth
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(/;\s*/);
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = decodeURIComponent(part.slice(0, idx));
    const v = decodeURIComponent(part.slice(idx + 1));
    out[k] = v;
  }
  return out;
}

export function getTokenFromCookieHeader(cookieHeader: string | null): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies["token"] || null;
}

export function clearAuthCookie() {
  try {
    // Expire immediately
    document.cookie = "token=; Max-Age=0; Path=/";
  } catch {}
}
