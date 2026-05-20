import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color");

export const ThemePresetSchema = z.enum(["wedding", "birthday", "corporate", "default"]);
export type ThemePreset = z.infer<typeof ThemePresetSchema>;

export const FontFamilySchema = z.enum([
  "Inter",
  "Lato",
  "Montserrat",
  "Merriweather",
  "Playfair Display",
  "Roboto",
  "Open Sans",
]);
export type FontFamily = z.infer<typeof FontFamilySchema>;

export const ButtonBorderRadiusSchema = z.enum(["none", "sm", "md", "lg", "full"]);
export type ButtonBorderRadius = z.infer<typeof ButtonBorderRadiusSchema>;

export const HeaderStyleSchema = z.enum(["compact", "spacious"]);
export type HeaderStyle = z.infer<typeof HeaderStyleSchema>;

export const UpdateThemeSchema = z.object({
  primaryColor: hexColor.optional(),
  secondaryColor: hexColor.optional(),
  accentColor: hexColor.optional().nullable(),
  textColor: hexColor.optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  backgroundUrl: z.string().url().optional().nullable(),
  fontFamily: FontFamilySchema.optional().nullable(),
  buttonBorderRadius: ButtonBorderRadiusSchema.optional().nullable(),
  headerStyle: HeaderStyleSchema.optional().nullable(),
  customCss: z.string().optional().nullable(),
  preset: ThemePresetSchema.optional(),
});
export type UpdateThemeInput = z.infer<typeof UpdateThemeSchema>;

export const ThemeResponseSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  accentColor: z.string().nullable(),
  textColor: z.string().nullable(),
  logoUrl: z.string().nullable(),
  backgroundUrl: z.string().nullable(),
  fontFamily: z.string().nullable(),
  buttonBorderRadius: z.string().nullable(),
  headerStyle: z.string().nullable(),
  customCss: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type ThemeResponse = z.infer<typeof ThemeResponseSchema>;
