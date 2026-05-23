import { z } from "zod";

export const CreditBalanceResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  totalCredits: z.number().int(),
  usedCredits: z.number().int(),
  availableCredits: z.number().int(),
  freeTrialUsed: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CreditBalanceResponse = z.infer<typeof CreditBalanceResponseSchema>;
