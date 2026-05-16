import { z } from "zod";

export const BroadcastTargetTypeSchema = z.enum(["all", "table", "custom"]);
export type BroadcastTargetType = z.infer<typeof BroadcastTargetTypeSchema>;

export const CreateBroadcastSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  targetType: BroadcastTargetTypeSchema,
  targetId: z.string().uuid().optional(),
});
export type CreateBroadcastInput = z.infer<typeof CreateBroadcastSchema>;

export const BroadcastResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  createdById: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  targetType: BroadcastTargetTypeSchema,
  targetId: z.string().uuid().nullable(),
  createdAt: z.string().or(z.date()),
  recipientCount: z.number().optional(),
});
export type BroadcastResponse = z.infer<typeof BroadcastResponseSchema>;
