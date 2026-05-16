"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TableResponse, CreateTableInput, UpdateTableInput, SeatResponse, BulkUpdateTablePositionsInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "tables", init);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function usePublicTables(eventId: string) {
  return useQuery<TableResponse[]>({
    queryKey: ["events", eventId, "tables", "public"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/tables/public`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tables");
      return res.json() as Promise<TableResponse[]>;
    },
    enabled: !!eventId,
  });
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
