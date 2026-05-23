import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import type { Event } from "@seat-snaps/db";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import { CreditsService } from "../credits/credits.service";
import type { IEventService, PublicEventInfo } from "./domain/IEventService";
import type { CreateEventInput, UpdateEventInput } from "@seat-snaps/shared";

const SOFT_DELETE_GRACE_DAYS = 30;

@Injectable()
export class EventsService implements IEventService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    private readonly creditsService: CreditsService,
  ) {}

  async listForUser(userId: string): Promise<Event[]> {
    const events = await this.eventRepository.findByMemberId(userId);
    return events.filter((e) => !e.deletedAt);
  }

  async getPublicInfo(id: string): Promise<PublicEventInfo> {
    const event = await this.eventRepository.findById(id);
    if (!event || event.deletedAt) throw new NotFoundException("Event not found");
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
      location: event.location,
      timezone: event.timezone,
      type: event.type,
      hasSeating: event.hasSeating,
      rsvpEnabled: event.rsvpEnabled,
    };
  }

  async getById(id: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event || event.deletedAt) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(userId, id);
    if (!membership) throw new ForbiddenException("Access denied");

    return event;
  }

  async create(data: CreateEventInput, userId: string, isAdmin = false): Promise<Event> {
    let isFreeTrial = false;

    if (!isAdmin) {
      // Auto-grant free trial credit if eligible
      const granted = await this.creditsService.grantFreeTrialIfEligible(userId);
      isFreeTrial = granted;

      const hasCredits = await this.creditsService.hasAvailableCredits(userId);
      if (!hasCredits) {
        throw new BadRequestException(
          "No available event credits. Please purchase a plan to create events.",
        );
      }

      await this.creditsService.consumeCredit(userId);
    }

    const event = await this.eventRepository.create({
      title: data.title,
      description: data.description ?? null,
      date: data.date,
      endDate: data.endDate ?? null,
      location: data.location ?? null,
      timezone: data.timezone ?? "Europe/Stockholm",
      type: data.type,
      hasSeating: data.hasSeating ?? true,
      rsvpEnabled: data.rsvpEnabled ?? false,
      isFreeTrial,
    });

    await this.membershipRepository.create({
      userId,
      eventId: event.id,
      role: "owner",
      status: "active",
    });

    return event;
  }

  async update(id: string, data: UpdateEventInput, userId: string): Promise<Event> {
    await this.requireOwner(id, userId);
    return this.eventRepository.update(id, {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date !== undefined && { date: data.date }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.isFinished !== undefined && { isFinished: data.isFinished }),
      ...(data.hasSeating !== undefined && { hasSeating: data.hasSeating }),
      ...(data.rsvpEnabled !== undefined && { rsvpEnabled: data.rsvpEnabled }),
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.requireOwner(id, userId);
    await this.eventRepository.softDelete(id);
  }

  async reactivate(id: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) throw new NotFoundException("Event not found");
    if (!event.deletedAt) throw new BadRequestException("Event is not deleted");

    const membership = await this.membershipRepository.findByUserAndEvent(userId, id);
    if (!membership || membership.role !== "owner") {
      throw new ForbiddenException("Only the event owner can reactivate");
    }

    const daysSinceDelete = Math.floor(
      (Date.now() - event.deletedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceDelete > SOFT_DELETE_GRACE_DAYS) {
      throw new BadRequestException(
        "Reactivation period has expired. This event can no longer be restored.",
      );
    }

    return this.eventRepository.reactivate(id);
  }

  private async requireOwner(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event || event.deletedAt) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership || membership.role !== "owner") {
      throw new ForbiddenException("Only the event owner can perform this action");
    }
  }
}
