import type { EventTheme } from "@seat-snaps/db";
import type { UpdateThemeInput } from "@seat-snaps/shared";

export interface IThemeService {
  getTheme(eventId: string): Promise<EventTheme | null>;
  updateTheme(eventId: string, data: UpdateThemeInput, userId: string): Promise<EventTheme>;
}

export const THEME_SERVICE = Symbol("IThemeService");
