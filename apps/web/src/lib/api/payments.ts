"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PricingTierResponse, PaymentResponse, CheckoutRequest } from "@seat-snaps/shared";
import { clientFetch } from "@/lib/client-api";
import { toast } from "sonner";

const fetchApi = <T>(path: string, init?: RequestInit) => clientFetch<T>(path, "payments", init);

export function usePricingTiers() {
  return useQuery<PricingTierResponse[]>({
    queryKey: ["pricing-tiers"],
    queryFn: () => fetchApi("/payments/tiers"),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation<PaymentResponse, Error, CheckoutRequest>({
    mutationFn: (data) =>
      fetchApi("/payments/checkout", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (payment) => {
      void qc.invalidateQueries({ queryKey: ["credits"] });
      void qc.invalidateQueries({ queryKey: ["payment-history"] });
      toast.success(`${payment.creditsGranted} event credits added!`);
    },
  });
}

export function usePaymentHistory() {
  return useQuery<PaymentResponse[]>({
    queryKey: ["payment-history"],
    queryFn: () => fetchApi("/payments/history"),
  });
}
