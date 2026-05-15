"use client";

export async function clientFetch<T>(path: string, label: string, init?: RequestInit): Promise<T> {
  const url = `/api/proxy${path}`;
  const method = init?.method ?? "GET";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  const res = await fetch(url, { ...init, headers }).catch(
    (error: unknown) => {
      console.error(`[${label} api] network failure`, { method, path, url, error });
      throw new Error(
        `Could not reach API for ${method} ${path}.`,
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
