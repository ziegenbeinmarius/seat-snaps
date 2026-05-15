"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  AttendeeResponse,
  CreateAttendeeSessionInput,
  ScheduleItemResponse,
} from "@seat-snaps/shared";

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `/api/proxy${path}`;
  const method = init?.method ?? "GET";

  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  }).catch((error: unknown) => {
    console.error("[attendee-session api] network failure", {
      method,
      path,
      url,
      error,
    });
    throw new Error(
      `Could not reach API for ${method} ${path}.`,
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

export function useEventAttendeesPublic(eventId: string) {
  return useQuery<AttendeeResponse[]>({
    queryKey: ["events", eventId, "attendees", "public"],
    queryFn: () => fetchApi(`/events/${eventId}/attendees`),
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
