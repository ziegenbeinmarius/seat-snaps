"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScheduleItemResponse, CreateScheduleItemInput, UpdateScheduleItemInput } from "@seat-snaps/shared";

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

export function useScheduleItems(eventId: string) {
  return useQuery<ScheduleItemResponse[]>({
    queryKey: ["events", eventId, "schedule"],
    queryFn: () => fetchApi(`/events/${eventId}/schedule`),
    enabled: !!eventId,
  });
}

export function useCreateScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ScheduleItemResponse, Error, CreateScheduleItemInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/schedule`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "schedule"] }),
  });
}

export function useUpdateScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ScheduleItemResponse, Error, { itemId: string; data: UpdateScheduleItemInput }>({
    mutationFn: ({ itemId, data }) =>
      fetchApi(`/events/${eventId}/schedule/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "schedule"] }),
  });
}

export function useDeleteScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (itemId) =>
      fetchApi(`/events/${eventId}/schedule/${itemId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "schedule"] }),
  });
}
