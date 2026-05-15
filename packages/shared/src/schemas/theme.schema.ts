import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color");

export const ThemePresetSchema = z.enum(["wedding", "birthday", "corporate", "default"]);
export type ThemePreset = z.infer<typeof ThemePresetSchema>;

export const UpdateThemeSchema = z.object({
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  logoUrl: z.string().url().optional().nullable(),
  backgroundUrl: z.string().url().optional().nullable(),
  preset: ThemePresetSchema.optional(),
});
export type UpdateThemeInput = z.infer<typeof UpdateThemeSchema>;

export const ThemeResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  logoUrl: z.string().nullable(),
  backgroundUrl: z.string().nullable(),
  customCss: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type ThemeResponse = z.infer<typeof ThemeResponseSchema>;
