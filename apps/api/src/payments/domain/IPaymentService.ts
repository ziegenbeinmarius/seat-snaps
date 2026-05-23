import type { PricingTierResponse, PaymentResponse } from "@seat-snaps/shared";

export interface IPaymentService {
  listTiers(): Promise<PricingTierResponse[]>;
  checkout(tierId: string, userId: string): Promise<PaymentResponse>;
  listPayments(userId: string): Promise<PaymentResponse[]>;
}

export const PAYMENT_SERVICE = Symbol("IPaymentService");
