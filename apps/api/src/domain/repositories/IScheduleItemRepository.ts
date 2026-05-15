import type { ScheduleItem, NewScheduleItem } from "@seat-snaps/db";

export type UpdateScheduleItemData = Partial<
  Pick<NewScheduleItem, "title" | "description" | "startTime" | "endTime" | "position">
>;

export interface IScheduleItemRepository {
  findById(id: string): Promise<ScheduleItem | null>;
  findByEventId(eventId: string): Promise<ScheduleItem[]>;
  create(data: NewScheduleItem): Promise<ScheduleItem>;
  update(id: string, data: UpdateScheduleItemData): Promise<ScheduleItem>;
  delete(id: string): Promise<void>;
}

export const SCHEDULE_ITEM_REPOSITORY = Symbol("IScheduleItemRepository");
