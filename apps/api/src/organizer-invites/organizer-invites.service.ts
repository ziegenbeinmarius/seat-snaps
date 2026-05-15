import { randomBytes } from "crypto";
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import type { OrganizerInvite } from "@seat-snaps/db";
import type { SessionUser } from "@seat-snaps/shared";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IOrganizerInviteRepository } from "../domain/repositories/IOrganizerInviteRepository";
import { ORGANIZER_INVITE_REPOSITORY } from "../domain/repositories/IOrganizerInviteRepository";
import type { IOrganizerInviteService, InviteWithEvent } from "./domain/IOrganizerInviteService";
import { AuthService } from "../auth/auth.service";

@Injectable()
export class OrganizerInvitesService implements IOrganizerInviteService {
  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    @Inject(ORGANIZER_INVITE_REPOSITORY)
    private readonly inviteRepository: IOrganizerInviteRepository,
    private readonly authService: AuthService,
  ) {}

  async listForEvent(eventId: string, requesterId: string): Promise<OrganizerInvite[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(requesterId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");

    return this.inviteRepository.findByEventId(eventId);
  }

  async createInvite(
    eventId: string,
    email: string,
    role: string,
    expiresInDays: number,
    requesterId: string,
  ): Promise<OrganizerInvite> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(requesterId, eventId);
    if (!membership || membership.role !== "owner") {
      throw new ForbiddenException("Only event owners can create invites");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return this.inviteRepository.create({ eventId, email, role, token, expiresAt });
  }

  async getByToken(token: string): Promise<InviteWithEvent> {
    const invite = await this.inviteRepository.findByToken(token);
    if (!invite) throw new NotFoundException("Invite not found");

    if (invite.status === "accepted") {
      throw new BadRequestException("Invite has already been accepted");
    }

    if (invite.status === "expired" || new Date() > invite.expiresAt) {
      if (invite.status !== "expired") {
        await this.inviteRepository.markExpired(invite.id);
      }
      throw new BadRequestException("Invite has expired");
    }

    const event = await this.eventRepository.findById(invite.eventId);
    if (!event) throw new NotFoundException("Event not found");

    return { ...invite, event };
  }

  async acceptInvite(token: string, userId: string): Promise<void> {
    const invite = await this.inviteRepository.findByToken(token);
    if (!invite) throw new NotFoundException("Invite not found");

    if (invite.status === "accepted") {
      throw new BadRequestException("Invite has already been accepted");
    }

    if (invite.status === "expired" || new Date() > invite.expiresAt) {
      if (invite.status !== "expired") {
        await this.inviteRepository.markExpired(invite.id);
      }
      throw new BadRequestException("Invite has expired");
    }

    const existing = await this.membershipRepository.findByUserAndEvent(userId, invite.eventId);
    if (existing) {
      throw new ConflictException("You are already a member of this event");
    }

    await this.membershipRepository.create({
      userId,
      eventId: invite.eventId,
      role: invite.role as "organizer",
      status: "active",
    });

    await this.inviteRepository.markAccepted(invite.id);
  }

  async acceptWithRegistration(
    token: string,
    data: { name: string; email: string; password: string },
  ): Promise<SessionUser> {
    const invite = await this.inviteRepository.findByToken(token);
    if (!invite) throw new NotFoundException("Invite not found");

    if (invite.status === "accepted") {
      throw new BadRequestException("Invite has already been accepted");
    }

    if (invite.status === "expired" || new Date() > invite.expiresAt) {
      if (invite.status !== "expired") {
        await this.inviteRepository.markExpired(invite.id);
      }
      throw new BadRequestException("Invite has expired");
    }

    const user = await this.authService.register(data);

    await this.membershipRepository.create({
      userId: user.id,
      eventId: invite.eventId,
      role: invite.role as "organizer",
      status: "active",
    });

    await this.inviteRepository.markAccepted(invite.id);

    return user;
  }
}
