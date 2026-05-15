import { z } from "zod";

export const PhotoStatusSchema = z.enum(["pending", "approved", "rejected", "deleted"]);
export type PhotoStatus = z.infer<typeof PhotoStatusSchema>;

export const PhotoResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  attendeeId: z.string().uuid(),
  attendeeName: z.string(),
  s3Key: z.string(),
  thumbnailKey: z.string().nullable(),
  caption: z.string().nullable(),
  status: PhotoStatusSchema,
  isHighlight: z.boolean(),
  highlightOrder: z.number().nullable(),
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  createdAt: z.string(),
});
export type PhotoResponse = z.infer<typeof PhotoResponseSchema>;

export const RequestUploadUrlSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
});
export type RequestUploadUrlInput = z.infer<typeof RequestUploadUrlSchema>;

export const UploadUrlResponseSchema = z.object({
  uploadUrl: z.string(),
  key: z.string(),
  photoId: z.string().uuid(),
});
export type UploadUrlResponse = z.infer<typeof UploadUrlResponseSchema>;

export const UpdatePhotoStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});
export type UpdatePhotoStatusInput = z.infer<typeof UpdatePhotoStatusSchema>;

export const ToggleHighlightSchema = z.object({
  isHighlight: z.boolean(),
});
export type ToggleHighlightInput = z.infer<typeof ToggleHighlightSchema>;
