import { cookies } from "next/headers";

// Cookie names differ between dev (HTTP) and prod (HTTPS)
const SESSION_COOKIE = process.env.NODE_ENV === "production"
  ? "__Secure-authjs.session-token"
  : "authjs.session-token";

/**
 * Returns the raw JWT session token for passing to the NestJS API as Bearer.
 * Call from Server Components or Server Actions only.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Makes an authenticated request to the NestJS API.
 * Automatically attaches the session JWT as Bearer token.
 */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  const token = await getSessionToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiUrl}/api${path}`, { ...init, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API request failed");
  }
  return res.json() as Promise<T>;
}
