"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfileResponse, UpdateProfileInput } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "profile", init);

export function useProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => fetchApi("/auth/me"),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<UserProfileResponse, Error, UpdateProfileInput>({
    mutationFn: (data) =>
      fetchApi("/auth/me", { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (updated) => {
      qc.setQueryData(["profile"], updated);
    },
  });
}
