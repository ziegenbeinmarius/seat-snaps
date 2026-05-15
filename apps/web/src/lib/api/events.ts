"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventResponse, CreateEventInput, UpdateEventInput, EventMember } from "@seat-snaps/shared";

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
  console.log(res);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["events", id] });
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
