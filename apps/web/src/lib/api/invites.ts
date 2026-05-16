"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InviteResponse, InviteDetail, CreateInviteInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";
import { toast } from "sonner";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "invites", init);

export function useEventInvites(eventId: string) {
  return useQuery<InviteResponse[]>({
    queryKey: ["events", eventId, "invites"],
    queryFn: () => fetchApi(`/events/${eventId}/invites`),
    enabled: !!eventId,
  });
}

export function useCreateInvite(eventId: string) {
  const qc = useQueryClient();
  return useMutation<InviteResponse, Error, CreateInviteInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/invites`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events", eventId, "invites"] });
      toast.success("Invite sent");
    },
  });
}

export function useInviteByToken(token: string) {
  return useQuery<InviteDetail>({
    queryKey: ["invites", token],
    queryFn: () => fetchApi(`/invites/${token}`),
    enabled: !!token,
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (token) =>
      fetchApi(`/invites/${token}/accept`, { method: "POST" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Invite accepted");
    },
  });
}
