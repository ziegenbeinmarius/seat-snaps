"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AdminUserResponse,
  AdminEventResponse,
  AdminMetricsResponse,
} from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) =>
  clientFetch<T>(path, "admin", init);

export function useAdminMetrics() {
  return useQuery<AdminMetricsResponse>({
    queryKey: ["admin", "metrics"],
    queryFn: () => fetchApi("/admin/metrics"),
  });
}

export function useAdminUsers() {
  return useQuery<AdminUserResponse[]>({
    queryKey: ["admin", "users"],
    queryFn: () => fetchApi("/admin/users"),
  });
}

export function useAdminEvents() {
  return useQuery<AdminEventResponse[]>({
    queryKey: ["admin", "events"],
    queryFn: () => fetchApi("/admin/events"),
  });
}

export function useForceDeleteUser() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchApi(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

export function useForceDeleteEvent() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchApi(`/admin/events/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
