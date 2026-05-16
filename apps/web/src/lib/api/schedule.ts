"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScheduleItemResponse, CreateScheduleItemInput, UpdateScheduleItemInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";
import { toast } from "sonner";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "schedule", init);

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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "schedule"] });
      toast.success("Schedule item added");
    },
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "schedule"] });
      toast.success("Schedule item updated");
    },
  });
}

export function useDeleteScheduleItem(eventId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (itemId) =>
      fetchApi(`/events/${eventId}/schedule/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "schedule"] });
      toast.success("Schedule item deleted");
    },
  });
}
