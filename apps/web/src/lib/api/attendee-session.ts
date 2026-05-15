"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  AttendeeResponse,
  AttendeeSessionResponse,
  CreateAttendeeSessionInput,
  ScheduleItemResponse,
} from "@seat-snaps/shared";

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

export function useCreateAttendeeSession() {
  return useMutation<AttendeeSessionResponse, Error, CreateAttendeeSessionInput>({
    mutationFn: (data) =>
      fetchApi("/attendee-sessions", { method: "POST", body: JSON.stringify(data) }),
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
