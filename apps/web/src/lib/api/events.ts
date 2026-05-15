"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventResponse, CreateEventInput, UpdateEventInput, EventMember } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "events", init);

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
