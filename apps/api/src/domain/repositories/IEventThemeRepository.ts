import type { EventTheme, NewEventTheme } from "@seat-snaps/db";

export type UpdateEventThemeData = Partial<
  Pick<NewEventTheme, "primaryColor" | "secondaryColor" | "logoUrl" | "backgroundUrl" | "customCss">
>;

export interface IEventThemeRepository {
  findByEventId(eventId: string): Promise<EventTheme | null>;
  upsert(eventId: string, data: UpdateEventThemeData): Promise<EventTheme>;
}

export const EVENT_THEME_REPOSITORY = Symbol("IEventThemeRepository");
