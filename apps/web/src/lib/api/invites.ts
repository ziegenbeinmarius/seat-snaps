"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InviteResponse, InviteDetail, CreateInviteInput } from "@seat-snaps/shared";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "invites"] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });
}
