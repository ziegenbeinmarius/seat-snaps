"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ThemeResponse, UpdateThemeInput } from "@seat-snaps/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?? (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function useEventTheme(eventId: string) {
  return useQuery<ThemeResponse | null>({
    queryKey: ["events", eventId, "theme"],
    queryFn: () => fetchApi(`/events/${eventId}/theme`),
    enabled: !!eventId,
  });
}

export function useUpdateTheme(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ThemeResponse, Error, UpdateThemeInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/theme`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "theme"] }),
  });
}
