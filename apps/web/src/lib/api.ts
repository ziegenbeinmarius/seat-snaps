import { cookies } from "next/headers";

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

/**
 * Returns the raw JWT session token for passing to the NestJS API as Bearer.
 * Call from Server Components or Server Actions only.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const baseName of SESSION_COOKIE_NAMES) {
    const direct = cookieStore.get(baseName)?.value;
    if (direct) return direct;

    const chunks = allCookies
      .filter((cookie) => cookie.name.startsWith(`${baseName}.`))
      .map((cookie) => {
        const index = Number(cookie.name.slice(baseName.length + 1));
        return { index, value: cookie.value };
      })
      .filter((chunk) => Number.isInteger(chunk.index))
      .sort((a, b) => a.index - b.index)
      .map((chunk) => chunk.value);

    if (chunks.length > 0) return chunks.join("");
  }

  return null;
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
    ...(init?.headers as Record<string, string>),
  };

  if (init?.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${apiUrl}/api${path}`, { ...init, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? "API request failed");
  }
  if (res.status === 204) return undefined as T;

  const bodyText = await res.text();
  if (!bodyText) return undefined as T;
  return JSON.parse(bodyText) as T;
}
