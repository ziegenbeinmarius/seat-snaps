"use client";

function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function clientFetch<T>(path: string, label: string, init?: RequestInit): Promise<T> {
  const url = `/api/proxy${path}`;
  const method = init?.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
  if (!safeMethods.has(method)) {
    const xsrfToken = getXsrfToken();
    if (xsrfToken) headers["x-xsrf-token"] = xsrfToken;
  }

  const res = await fetch(url, { ...init, headers }).catch(
    (error: unknown) => {
      console.error(`[${label} api] network failure`, { method, path, url, error });
      throw new Error(`Could not reach API for ${method} ${path}. Please try again later.`);
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
