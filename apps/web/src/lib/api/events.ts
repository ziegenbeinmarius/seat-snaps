"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventResponse, CreateEventInput, UpdateEventInput, EventMember } from "@seat-snaps/shared";

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
    console.error("[events api] network failure", {
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

    console.error("[events api] request failed", {
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

export function useEvents() {
  return useQuery<EventResponse[]>({
    queryKey: ["events"],
    queryFn: () => fetchApi("/events"),
  });
}

export function useEvent(id: string) {
  return useQuery<EventResponse>({
    queryKey: ["events", id],
    queryFn: () => fetchApi(`/events/${id}`),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation<EventResponse, Error, CreateEventInput>({
    mutationFn: (data) =>
      fetchApi("/events", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient();
  return useMutation<EventResponse, Error, UpdateEventInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (updatedEvent) => {
      qc.setQueryData(["events", id], updatedEvent);
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchApi(`/events/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}

export function useEventMembers(eventId: string) {
  return useQuery<EventMember[]>({
    queryKey: ["events", eventId, "members"],
    queryFn: () => fetchApi(`/events/${eventId}/members`),
    enabled: !!eventId,
  });
}

export function useRemoveMember(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (userId) =>
      fetchApi(`/events/${eventId}/members/${userId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "members"] }),
  });
}
