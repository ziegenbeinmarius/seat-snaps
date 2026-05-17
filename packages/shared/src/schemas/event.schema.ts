import { z } from "zod";

export const EventTypeSchema = z.enum(["wedding", "birthday", "corporate", "other"]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  location: z.string().optional(),
  type: EventTypeSchema,
});
export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  isFinished: z.boolean().optional(),
});
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;

export const EventResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  location: z.string().nullable(),
  type: EventTypeSchema,
  isFinished: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type EventResponse = z.infer<typeof EventResponseSchema>;

export const EventMemberUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

export const EventMemberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  role: z.enum(["owner", "organizer"]),
  status: z.enum(["active", "invited", "removed"]),
  createdAt: z.coerce.date(),
  user: EventMemberUserSchema.optional(),
});
export type EventMember = z.infer<typeof EventMemberSchema>;

export const CreateInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.literal("organizer"),
  expiresInDays: z.number().int().positive().max(30).default(7),
});
export type CreateInviteInput = z.infer<typeof CreateInviteSchema>;

export const InviteResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  token: z.string(),
  status: z.enum(["pending", "accepted", "expired"]),
  expiresAt: z.coerce.date(),
  acceptedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type InviteResponse = z.infer<typeof InviteResponseSchema>;

export const InviteDetailSchema = InviteResponseSchema.extend({
  event: EventResponseSchema,
});
export type InviteDetail = z.infer<typeof InviteDetailSchema>;

export const AcceptWithRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type AcceptWithRegistrationInput = z.infer<typeof AcceptWithRegistrationSchema>;
