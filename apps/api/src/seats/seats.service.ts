import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import type { Seat } from "@seat-snaps/db";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { ISeatService } from "./domain/ISeatService";
import { EventGateway } from "../broadcasts/event.gateway";

@Injectable()
export class SeatsService implements ISeatService {
  constructor(
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    private readonly broadcastGateway: EventGateway,
  ) {}

  async listForEvent(eventId: string, userId: string): Promise<Seat[]> {
    await this.requireMember(eventId, userId);
    return this.seatRepository.findByEventId(eventId);
  }

  async assign(seatId: string, eventId: string, attendeeId: string, userId: string): Promise<Seat> {
    await this.requireMember(eventId, userId);

    const seat = await this.seatRepository.findById(seatId);
    if (!seat || seat.eventId !== eventId) throw new NotFoundException("Seat not found");

    if (seat.attendeeId) throw new ConflictException("Seat is already occupied");

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");

    const existingSeat = await this.seatRepository.findByAttendeeId(attendeeId);
    if (existingSeat) throw new ConflictException("Attendee is already assigned to a seat");

    const updated = await this.seatRepository.assignAttendee(seatId, attendeeId);
    await this.attendeeRepository.update(attendeeId, {
      seatId,
      tableId: seat.tableId,
    });
    this.broadcastGateway.emitSeatingUpdate(eventId);
    return updated;
  }

  async unassign(seatId: string, eventId: string, userId: string): Promise<Seat> {
    await this.requireMember(eventId, userId);

    const seat = await this.seatRepository.findById(seatId);
    if (!seat || seat.eventId !== eventId) throw new NotFoundException("Seat not found");

    const updated = await this.seatRepository.unassignAttendee(seatId);

    if (seat.attendeeId) {
      await this.attendeeRepository.update(seat.attendeeId, {
        seatId: null,
        tableId: null,
      });
    }

    this.broadcastGateway.emitSeatingUpdate(eventId);
    return updated;
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
