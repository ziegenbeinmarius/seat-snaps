import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import type { ScheduleItem } from "@seat-snaps/db";
import type { CreateScheduleItemInput, UpdateScheduleItemInput } from "@seat-snaps/shared";
import type { IScheduleItemRepository } from "../domain/repositories/IScheduleItemRepository";
import { SCHEDULE_ITEM_REPOSITORY } from "../domain/repositories/IScheduleItemRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IScheduleItemService } from "./domain/IScheduleItemService";

@Injectable()
export class ScheduleItemsService implements IScheduleItemService {
  constructor(
    @Inject(SCHEDULE_ITEM_REPOSITORY)
    private readonly scheduleItemRepository: IScheduleItemRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
  ) {}

  async listForEvent(eventId: string): Promise<ScheduleItem[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    return this.scheduleItemRepository.findByEventId(eventId);
  }

  async getById(id: string, eventId: string): Promise<ScheduleItem> {
    const item = await this.scheduleItemRepository.findById(id);
    if (!item || item.eventId !== eventId) throw new NotFoundException("Schedule item not found");
    return item;
  }

  async create(
    eventId: string,
    data: CreateScheduleItemInput,
    userId: string,
  ): Promise<ScheduleItem> {
    await this.requireMember(eventId, userId);
    return this.scheduleItemRepository.create({
      eventId,
      title: data.title,
      description: data.description ?? null,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : null,
      position: data.position ?? 0,
    });
  }

  async update(
    id: string,
    eventId: string,
    data: UpdateScheduleItemInput,
    userId: string,
  ): Promise<ScheduleItem> {
    await this.requireMember(eventId, userId);
    const item = await this.scheduleItemRepository.findById(id);
    if (!item || item.eventId !== eventId) throw new NotFoundException("Schedule item not found");

    return this.scheduleItemRepository.update(id, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startTime !== undefined && { startTime: new Date(data.startTime) }),
      ...(data.endTime !== undefined && { endTime: new Date(data.endTime) }),
      ...(data.position !== undefined && { position: data.position }),
    });
  }

  async delete(id: string, eventId: string, userId: string): Promise<void> {
    await this.requireMember(eventId, userId);
    const item = await this.scheduleItemRepository.findById(id);
    if (!item || item.eventId !== eventId) throw new NotFoundException("Schedule item not found");
    await this.scheduleItemRepository.delete(id);
  }

  private async requireMember(eventId: string, userId: string): Promise<void> {
    const [event, membership] = await Promise.all([
      this.eventRepository.findById(eventId),
      this.membershipRepository.findByUserAndEvent(userId, eventId),
    ]);
    if (!event) throw new NotFoundException("Event not found");
    if (!membership) throw new ForbiddenException("Access denied");
  }
}
