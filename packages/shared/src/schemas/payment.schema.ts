import { z } from "zod";

export const PaymentStatusSchema = z.enum(["pending", "completed", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

export const PricingTierResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  eventCount: z.number().int(),
  priceSek: z.number().int(),
  currency: z.string(),
  active: z.boolean(),
});
export type PricingTierResponse = z.infer<typeof PricingTierResponseSchema>;

export const CheckoutRequestSchema = z.object({
  tierId: z.string().uuid(),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const PaymentResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tierId: z.string().uuid(),
  amount: z.number().int(),
  currency: z.string(),
  status: PaymentStatusSchema,
  creditsGranted: z.number().int(),
  paymentProvider: z.string().nullable(),
  providerPaymentId: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
