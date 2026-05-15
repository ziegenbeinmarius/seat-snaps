"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ThemeResponse, UpdateThemeInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "themes", init);

export function useEventTheme(eventId: string) {
  return useQuery<ThemeResponse | null>({
    queryKey: ["events", eventId, "theme"],
    queryFn: () => fetchApi(`/events/${eventId}/theme`),
    enabled: !!eventId,
  });
}

export function useUpdateTheme(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ThemeResponse, Error, UpdateThemeInput>({
    mutationFn: (data) =>
      fetchApi(`/events/${eventId}/theme`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events", eventId, "theme"] }),
  });
}
