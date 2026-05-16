import type { ScheduleItem } from "@seat-snaps/db";
import type { CreateScheduleItemInput, UpdateScheduleItemInput } from "@seat-snaps/shared";

export interface IScheduleItemService {
  listForEvent(eventId: string): Promise<ScheduleItem[]>;
  getById(id: string, eventId: string): Promise<ScheduleItem>;
  create(eventId: string, data: CreateScheduleItemInput): Promise<ScheduleItem>;
  update(id: string, eventId: string, data: UpdateScheduleItemInput): Promise<ScheduleItem>;
  delete(id: string, eventId: string): Promise<void>;
}

export const SCHEDULE_ITEM_SERVICE = Symbol("IScheduleItemService");
