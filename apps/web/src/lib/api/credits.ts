"use client";

import { useQuery } from "@tanstack/react-query";
import type { CreditBalanceResponse } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "credits", init);

export function useCredits() {
  return useQuery<CreditBalanceResponse>({
    queryKey: ["credits"],
    queryFn: () => fetchApi("/credits"),
  });
}
