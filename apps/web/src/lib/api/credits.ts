"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreditBalanceResponse } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "credits", init);

export function useCredits() {
  return useQuery<CreditBalanceResponse>({
    queryKey: ["credits"],
    queryFn: () => fetchApi("/credits"),
  });
}

export function useClaimTrial() {
  const qc = useQueryClient();
  return useMutation<CreditBalanceResponse, Error, void>({
    mutationFn: () =>
      fetchApi("/credits/trial", { method: "POST" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}
