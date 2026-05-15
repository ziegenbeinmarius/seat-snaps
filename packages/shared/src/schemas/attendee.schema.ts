import { z } from "zod";

export const TableShapeSchema = z.enum(["round", "rectangular", "long"]);
export type TableShape = z.infer<typeof TableShapeSchema>;

export const CreateAttendeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  groupLabel: z.string().optional(),
  relationInfo: z.string().optional(),
  conversationStarters: z.array(z.string()).optional(),
  photoLimit: z.number().int().positive().optional(),
});
export type CreateAttendeeInput = z.infer<typeof CreateAttendeeSchema>;

export const UpdateAttendeeSchema = CreateAttendeeSchema.partial();
export type UpdateAttendeeInput = z.infer<typeof UpdateAttendeeSchema>;

export const AttendeeResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string(),
  email: z.string().nullable(),
  groupLabel: z.string().nullable(),
  relationInfo: z.string().nullable(),
  conversationStarters: z.array(z.string()).nullable(),
  tableId: z.string().uuid().nullable(),
  seatId: z.string().uuid().nullable(),
  qrToken: z.string(),
  photoLimit: z.number(),
  checkedInAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type AttendeeResponse = z.infer<typeof AttendeeResponseSchema>;

export const CreateTableSchema = z.object({
  name: z.string().min(1, "Name is required"),
  label: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  shape: TableShapeSchema.optional(),
  rotation: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});
export type CreateTableInput = z.infer<typeof CreateTableSchema>;

export const UpdateTableSchema = CreateTableSchema.partial();
export type UpdateTableInput = z.infer<typeof UpdateTableSchema>;

export const BulkUpdateTablePositionSchema = z.object({
  tableId: z.string().uuid(),
  positionX: z.number(),
  positionY: z.number(),
  rotation: z.number().optional(),
});
export type BulkUpdateTablePositionItem = z.infer<typeof BulkUpdateTablePositionSchema>;

export const BulkUpdateTablePositionsSchema = z.array(BulkUpdateTablePositionSchema);
export type BulkUpdateTablePositionsInput = z.infer<typeof BulkUpdateTablePositionsSchema>;

export const SeatResponseSchema = z.object({
  id: z.string().uuid(),
  tableId: z.string().uuid(),
  eventId: z.string().uuid(),
  label: z.string().nullable(),
  position: z.number().nullable(),
  attendeeId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});
export type SeatResponse = z.infer<typeof SeatResponseSchema>;

export const TableResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string(),
  label: z.string().nullable(),
  capacity: z.number().nullable(),
  positionX: z.number().nullable(),
  positionY: z.number().nullable(),
  shape: TableShapeSchema.nullable(),
  rotation: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  createdAt: z.coerce.date(),
  seats: z.array(SeatResponseSchema).optional(),
});
export type TableResponse = z.infer<typeof TableResponseSchema>;

export const AssignSeatSchema = z.object({
  attendeeId: z.string().uuid(),
});
export type AssignSeatInput = z.infer<typeof AssignSeatSchema>;
