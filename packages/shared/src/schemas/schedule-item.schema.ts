import { z } from "zod";

export const CreateScheduleItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  position: z.number().int().min(0).optional(),
});
export type CreateScheduleItemInput = z.infer<typeof CreateScheduleItemSchema>;

export const UpdateScheduleItemSchema = CreateScheduleItemSchema.partial();
export type UpdateScheduleItemInput = z.infer<typeof UpdateScheduleItemSchema>;

export const ScheduleItemResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().nullable(),
  position: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ScheduleItemResponse = z.infer<typeof ScheduleItemResponseSchema>;

export const CreateAttendeeSessionSchema = z.object({
  qrToken: z.string().optional(),
  attendeeId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  deviceFingerprint: z.string().optional(),
});
export type CreateAttendeeSessionInput = z.infer<typeof CreateAttendeeSessionSchema>;

export const AttendeeSessionResponseSchema = z.object({
  token: z.string(),
  attendeeId: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string(),
});
export type AttendeeSessionResponse = z.infer<typeof AttendeeSessionResponseSchema>;
