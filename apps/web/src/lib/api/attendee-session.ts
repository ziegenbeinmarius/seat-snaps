"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendeeResponse,
  CreateAttendeeSessionInput,
  ScheduleItemResponse,
} from "@seat-snaps/shared";

function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `/api/proxy${path}`;
  const method = init?.method ?? "GET";

  const headers: Record<string, string> = { "Content-Type": "application/json", ...init?.headers as Record<string, string> };
  const xsrf = getXsrfToken();
  if (xsrf && method !== "GET" && method !== "HEAD") headers["x-xsrf-token"] = xsrf;

  const res = await fetch(url, {
    ...init,
    headers,
  }).catch((error: unknown) => {
    console.error("[attendee-session api] network failure", {
      method,
      path,
      url,
      error,
    });
    throw new Error(
      `Could not reach API for ${method} ${path}. Please try again later.`,
    );
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray((err as { message?: string | string[] }).message)
      ? (err as { message: string[] }).message.join(", ")
      : (err as { message?: string }).message;

    console.error("[attendee-session api] request failed", {
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

export function useCreateAttendeeSession() {
  return useMutation<{ attendeeId: string; eventId: string; name: string }, Error, CreateAttendeeSessionInput>({
    mutationFn: async (data) => {
      const res = await fetch("/api/attendee-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = (err as { message?: string }).message;
        throw new Error(message ?? `Request failed (${res.status})`);
      }
      return res.json();
    },
  });
}

export function useCurrentAttendee() {
  return useQuery<AttendeeResponse>({
    queryKey: ["attendee-session", "me"],
    queryFn: () => fetchApi("/attendee-sessions/me"),
    retry: false,
  });
}

export function useUpdateCurrentAttendee() {
  const qc = useQueryClient();
  return useMutation<
    AttendeeResponse,
    Error,
    { relationInfo?: string; conversationStarters?: string[] }
  >({
    mutationFn: (data) =>
      fetchApi("/attendee-sessions/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendee-session", "me"] }),
  });
}

export function useEventAttendeesPublic(eventId: string) {
  return useQuery<AttendeeResponse[]>({
    queryKey: ["events", eventId, "attendees", "public"],
    queryFn: async () => {
      const res = await fetchApi<{ data: AttendeeResponse[] } | AttendeeResponse[]>(`/events/${eventId}/attendees?limit=2000`);
      return Array.isArray(res) ? res : res.data;
    },
    enabled: !!eventId,
  });
}

export function useScheduleItems(eventId: string) {
  return useQuery<ScheduleItemResponse[]>({
    queryKey: ["events", eventId, "schedule"],
    queryFn: () => fetchApi(`/events/${eventId}/schedule`),
    enabled: !!eventId,
  });
}
