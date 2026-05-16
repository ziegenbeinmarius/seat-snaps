import { z } from "zod";

export const AdminUserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  isAdmin: z.boolean(),
  createdAt: z.string(),
  eventCount: z.number(),
});
export type AdminUserResponse = z.infer<typeof AdminUserResponseSchema>;

export const AdminEventResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.string(),
  date: z.string(),
  location: z.string().nullable(),
  ownerName: z.string().nullable(),
  ownerEmail: z.string().nullable(),
  attendeeCount: z.number(),
  photoCount: z.number(),
  createdAt: z.string(),
});
export type AdminEventResponse = z.infer<typeof AdminEventResponseSchema>;

export const AdminMetricsResponseSchema = z.object({
  totalUsers: z.number(),
  totalEvents: z.number(),
  totalAttendees: z.number(),
  totalPhotos: z.number(),
  eventsThisMonth: z.number(),
  usersThisMonth: z.number(),
  eventsByType: z.array(z.object({ type: z.string(), count: z.number() })),
  recentEvents: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      date: z.string(),
      attendeeCount: z.number(),
    }),
  ),
});
export type AdminMetricsResponse = z.infer<typeof AdminMetricsResponseSchema>;
