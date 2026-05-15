"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TableResponse, CreateTableInput, UpdateTableInput, SeatResponse, BulkUpdateTablePositionsInput } from "@seat-snaps/shared";

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
    console.error("[tables api] network failure", {
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

    console.error("[tables api] request failed", {
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

export function useTables(eventId: string) {
  return useQuery<TableResponse[]>({
    queryKey: ["events", eventId, "tables"],
    queryFn: () => fetchApi(`/events/${eventId}/tables`),
    enabled: !!eventId,
  });
}

export function useCreateTable(eventId: string) {
  const qc = useQueryClient();
  return useMutation<TableResponse, Error, CreateTableInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/tables`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "seats"] });
    },
  });
}

export function useUpdateTable(eventId: string) {
  const qc = useQueryClient();
  return useMutation<TableResponse, Error, { tableId: string; data: UpdateTableInput }>({
    mutationFn: ({ tableId, data }) =>
      fetchApi(`/events/${eventId}/tables/${tableId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] }),
  });
}

export function useDeleteTable(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (tableId) =>
      fetchApi(`/events/${eventId}/tables/${tableId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "seats"] });
    },
  });
}

export function useBulkUpdatePositions(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, BulkUpdateTablePositionsInput>({
    mutationFn: (positions) =>
      fetchApi(`/events/${eventId}/tables/positions`, {
        method: "PATCH",
        body: JSON.stringify({ positions }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] }),
  });
}

export function useSeats(eventId: string) {
  return useQuery<SeatResponse[]>({
    queryKey: ["events", eventId, "seats"],
    queryFn: () => fetchApi(`/events/${eventId}/seats`),
    enabled: !!eventId,
  });
}

export function useAssignSeat(eventId: string) {
  const qc = useQueryClient();
  return useMutation<SeatResponse, Error, { seatId: string; attendeeId: string }>({
    mutationFn: ({ seatId, attendeeId }) =>
      fetchApi(`/events/${eventId}/seats/${seatId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ attendeeId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", eventId, "seats"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
    },
  });
}

export function useUnassignSeat(eventId: string) {
  const qc = useQueryClient();
  return useMutation<SeatResponse, Error, string>({
    mutationFn: (seatId) =>
      fetchApi(`/events/${eventId}/seats/${seatId}/unassign`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", eventId, "seats"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
    },
  });
}
