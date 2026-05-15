"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendeeResponse, CreateAttendeeInput, UpdateAttendeeInput } from "@seat-snaps/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ?? (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${path}`;
  const method = init?.method ?? "GET";

  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  }).catch((error: unknown) => {
    console.error("[attendees api] network failure", {
      method,
      path,
      url,
      error,
    });
    throw new Error(
      `Could not reach API for ${method} ${path}. Check NEXT_PUBLIC_API_URL (${API_BASE}) and API availability.`,
    );
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray((err as { message?: string | string[] }).message)
      ? (err as { message: string[] }).message.join(", ")
      : (err as { message?: string }).message;

    console.error("[attendees api] request failed", {
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

export function useAttendees(eventId: string) {
  return useQuery<AttendeeResponse[]>({
    queryKey: ["events", eventId, "attendees"],
    queryFn: () => fetchApi(`/events/${eventId}/attendees`),
    enabled: !!eventId,
  });
}

export function useCreateAttendee(eventId: string) {
  const qc = useQueryClient();
  return useMutation<AttendeeResponse, Error, CreateAttendeeInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/attendees`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] }),
  });
}

export function useImportAttendees(eventId: string) {
  const qc = useQueryClient();
  return useMutation<AttendeeResponse[], Error, string>({
    mutationFn: (csv) =>
      fetchApi(`/events/${eventId}/attendees/import`, {
        method: "POST",
        body: JSON.stringify({ csv }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] }),
  });
}

export function useUpdateAttendee(eventId: string) {
  const qc = useQueryClient();
  return useMutation<AttendeeResponse, Error, { attendeeId: string; data: UpdateAttendeeInput }>({
    mutationFn: ({ attendeeId, data }) =>
      fetchApi(`/events/${eventId}/attendees/${attendeeId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] }),
  });
}

export function useDeleteAttendee(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (attendeeId) =>
      fetchApi(`/events/${eventId}/attendees/${attendeeId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] }),
  });
}
