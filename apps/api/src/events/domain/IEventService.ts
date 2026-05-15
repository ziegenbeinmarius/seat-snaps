import type { Event } from "@seat-snaps/db";
import type { CreateEventInput, UpdateEventInput } from "@seat-snaps/shared";

export interface IEventService {
  listForUser(userId: string): Promise<Event[]>;
  getPublicInfo(id: string): Promise<Event>;
  getById(id: string, userId: string): Promise<Event>;
  create(data: CreateEventInput, userId: string): Promise<Event>;
  update(id: string, data: UpdateEventInput, userId: string): Promise<Event>;
  delete(id: string, userId: string): Promise<void>;
}

export const EVENT_SERVICE = Symbol("IEventService");
