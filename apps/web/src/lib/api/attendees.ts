"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendeeResponse,
  CreateAttendeeInput,
  UpdateAttendeeInput,
  RsvpRegistrationInput,
} from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";
import { toast } from "sonner";

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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      toast.success("Attendee added");
    },
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
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      toast.success(`${data.length} attendees imported`);
    },
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      toast.success("Attendee updated");
    },
  });
}

export function useDeleteAttendee(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (attendeeId) =>
      fetchApi(`/events/${eventId}/attendees/${attendeeId}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      toast.success("Attendee removed");
    },
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
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      toast.success(`${data.name} checked in`);
    },
  });
}

export function useRsvpRegister(eventId: string) {
  return useMutation<{ attendeeId: string; eventId: string; name: string }, Error, RsvpRegistrationInput>({
    mutationFn: async (data) => {
      const res = await fetch(`/api/rsvp/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = Array.isArray((err as { message?: string | string[] }).message)
          ? (err as { message: string[] }).message.join(", ")
          : (err as { message?: string }).message;
        throw new Error(message ?? `Registration failed (${res.status})`);
      }
      return res.json();
    },
  });
}

export function useUnassignAttendee(eventId: string) {
  const qc = useQueryClient();
  return useMutation<AttendeeResponse, Error, string>({
    mutationFn: (attendeeId) =>
      fetchApi(`/events/${eventId}/attendees/${attendeeId}/unassign`, { method: "PATCH" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees"] });
      void qc.invalidateQueries({ queryKey: ["events", eventId, "tables"] });
      toast.success("Attendee unassigned");
    },
  });
}
