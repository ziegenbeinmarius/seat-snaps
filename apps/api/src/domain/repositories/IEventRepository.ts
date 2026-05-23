import type { Event, NewEvent } from "@seat-snaps/db";

export type UpdateEventData = Partial<
  Pick<NewEvent, "title" | "description" | "date" | "endDate" | "location" | "timezone" | "type" | "settings" | "isFinished" | "hasSeating" | "rsvpEnabled">
>;

export interface EventFilters {
  type?: NewEvent["type"];
  status?: string;
}

export interface IEventRepository {
  findById(id: string): Promise<Event | null>;
  findAll(filters?: EventFilters): Promise<Event[]>;
  findByMemberId(userId: string): Promise<Event[]>;
  create(data: NewEvent): Promise<Event>;
  update(id: string, data: UpdateEventData): Promise<Event>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  reactivate(id: string): Promise<Event>;
}

export const EVENT_REPOSITORY = Symbol("IEventRepository");
