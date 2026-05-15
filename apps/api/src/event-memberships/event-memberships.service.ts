import { Injectable, Inject, ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipService, MemberWithUser } from "./domain/IEventMembershipService";

@Injectable()
export class EventMembershipsService implements IEventMembershipService {
  constructor(
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async listMembers(eventId: string, requesterId: string): Promise<MemberWithUser[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(requesterId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");

    return this.membershipRepository.findByEventIdWithUsers(eventId);
  }

  async removeMember(eventId: string, targetUserId: string, requesterId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const requesterMembership = await this.membershipRepository.findByUserAndEvent(
      requesterId,
      eventId,
    );
    if (!requesterMembership || requesterMembership.role !== "owner") {
      throw new ForbiddenException("Only the event owner can remove members");
    }

    if (targetUserId === requesterId) {
      throw new BadRequestException("Event owner cannot remove themselves");
    }

    await this.membershipRepository.remove(targetUserId, eventId);
  }
}
