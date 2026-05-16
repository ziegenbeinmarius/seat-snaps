import { Injectable, Inject, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { Broadcast } from "@seat-snaps/db";
import type { CreateBroadcastInput } from "@seat-snaps/shared";
import type { IBroadcastRepository } from "../domain/repositories/IBroadcastRepository";
import { BROADCAST_REPOSITORY } from "../domain/repositories/IBroadcastRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IBroadcastService } from "./domain/IBroadcastService";
import { EventGateway } from "./event.gateway";

@Injectable()
export class BroadcastsService implements IBroadcastService {
  constructor(
    @Inject(BROADCAST_REPOSITORY)
    private readonly broadcastRepository: IBroadcastRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    private readonly gateway: EventGateway,
  ) {}

  async create(eventId: string, data: CreateBroadcastInput, userId: string): Promise<Broadcast> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership) throw new ForbiddenException("Not a member of this event");

    const broadcast = await this.broadcastRepository.create({
      eventId,
      createdById: userId,
      title: data.title,
      content: data.content,
      targetType: data.targetType,
      targetId: data.targetId ?? null,
    });

    this.emitBroadcast(broadcast);

    return broadcast;
  }

  async listByEvent(
    eventId: string,
    requesterId: string,
    requesterType: "user" | "attendee",
  ): Promise<Broadcast[]> {
    if (requesterType === "user") {
      const membership = await this.membershipRepository.findByUserAndEvent(requesterId, eventId);
      if (!membership) throw new ForbiddenException("Not a member of this event");
    }
    // For attendees, the controller already verified attendee.eventId === eventId

    return this.broadcastRepository.findByEventId(eventId);
  }

  private emitBroadcast(broadcast: Broadcast) {
    const payload = {
      id: broadcast.id,
      eventId: broadcast.eventId,
      title: broadcast.title,
      content: broadcast.content,
      targetType: broadcast.targetType,
      targetId: broadcast.targetId,
      createdAt: broadcast.createdAt,
    };

    if (broadcast.targetType === "table" && broadcast.targetId) {
      this.gateway.emitToTable(broadcast.eventId, broadcast.targetId, payload);
    } else {
      this.gateway.emitToEvent(broadcast.eventId, payload);
    }
  }
}
