"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BroadcastResponse, CreateBroadcastInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";
import { toast } from "sonner";

const fetchApi = <T>(path: string, init?: RequestInit) =>
  clientFetch<T>(path, "broadcasts", init);

export function useBroadcasts(eventId: string) {
  return useQuery<BroadcastResponse[]>({
    queryKey: ["events", eventId, "broadcasts"],
    queryFn: () => fetchApi(`/events/${eventId}/broadcasts`),
    enabled: !!eventId,
  });
}

export function useAttendeeBroadcasts(eventId: string) {
  return useQuery<BroadcastResponse[]>({
    queryKey: ["events", eventId, "broadcasts", "feed"],
    queryFn: () => fetchApi(`/events/${eventId}/broadcasts/feed`),
    enabled: !!eventId,
  });
}

export function useCreateBroadcast(eventId: string) {
  const qc = useQueryClient();
  return useMutation<BroadcastResponse, Error, CreateBroadcastInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/broadcasts`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "broadcasts"] });
      toast.success("Broadcast sent");
    },
  });
}
