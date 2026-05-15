"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

// 30s in-memory cache so we don't hit /api/token on every request
let tokenCache: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;
  try {
    const res = await fetch("/api/token");
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string } | null;
    const token = data?.token ?? null;
    if (token) tokenCache = { value: token, expiresAt: Date.now() + 30_000 };
    return token;
  } catch {
    return null;
  }
}

export async function clientFetch<T>(path: string, label: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const url = `${API_BASE}/api${path}`;
  const method = init?.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers, credentials: "include" }).catch(
    (error: unknown) => {
      console.error(`[${label} api] network failure`, { method, path, url, error });
      throw new Error(
        `Could not reach API for ${method} ${path}. Check NEXT_PUBLIC_API_URL (${API_BASE}) and API availability.`,
      );
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray((err as { message?: string | string[] }).message)
      ? (err as { message: string[] }).message.join(", ")
      : (err as { message?: string }).message;

    console.error(`[${label} api] request failed`, {
      method,
      path,
      url,
      status: res.status,
      statusText: res.statusText,
      errorBody: err,
    });

    throw new Error(message ?? `Request failed (${res.status} ${res.statusText}) for ${method} ${path}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
