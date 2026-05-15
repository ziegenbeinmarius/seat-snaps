"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AttendeeResponse, CreateAttendeeInput, UpdateAttendeeInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "attendees", init);

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

export function useCheckinByQrToken(eventId: string) {
  const qc = useQueryClient();
  return useMutation<AttendeeResponse, Error, string>({
    mutationFn: (qrToken) =>
      fetchApi(`/events/${eventId}/attendees/checkin`, {
        method: "POST",
        body: JSON.stringify({ qrToken }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] }),
  });
}

export function useUnassignAttendee(eventId: string) {
  const qc = useQueryClient();
  return useMutation<AttendeeResponse, Error, string>({
    mutationFn: (attendeeId) =>
      fetchApi(`/events/${eventId}/attendees/${attendeeId}/unassign`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] });
    },
  });
}
