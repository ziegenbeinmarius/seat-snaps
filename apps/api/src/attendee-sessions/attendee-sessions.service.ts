import { Injectable, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { IAttendeeSessionRepository } from "../domain/repositories/IAttendeeSessionRepository";
import { ATTENDEE_SESSION_REPOSITORY } from "../domain/repositories/IAttendeeSessionRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type {
  IAttendeeSessionService,
  AttendeeSessionWithAttendee,
} from "./domain/IAttendeeSessionService";

const SESSION_TTL_DAYS = 90;

@Injectable()
export class AttendeeSessionsService implements IAttendeeSessionService {
  constructor(
    @Inject(ATTENDEE_SESSION_REPOSITORY)
    private readonly sessionRepository: IAttendeeSessionRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
  ) {}

  async createFromQrToken(
    qrToken: string,
    deviceFingerprint?: string,
  ): Promise<AttendeeSessionWithAttendee> {
    const attendee = await this.attendeeRepository.findByQrToken(qrToken);
    if (!attendee) throw new NotFoundException("Invalid QR token");

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

    const session = await this.sessionRepository.create({
      attendeeId: attendee.id,
      eventId: attendee.eventId,
      token,
      deviceFingerprint: deviceFingerprint ?? null,
      expiresAt,
    });

    return { session, attendee };
  }

  async createFromManualSelection(
    attendeeId: string,
    eventId: string,
    deviceFingerprint?: string,
  ): Promise<AttendeeSessionWithAttendee> {
    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

    const session = await this.sessionRepository.create({
      attendeeId: attendee.id,
      eventId: attendee.eventId,
      token,
      deviceFingerprint: deviceFingerprint ?? null,
      expiresAt,
    });

    return { session, attendee };
  }

  async getByToken(token: string): Promise<AttendeeSessionWithAttendee> {
    const session = await this.sessionRepository.findByToken(token);
    if (!session) throw new UnauthorizedException("Invalid session");
    if (session.expiresAt < new Date()) throw new UnauthorizedException("Session expired");

    const attendee = await this.attendeeRepository.findById(session.attendeeId);
    if (!attendee) throw new UnauthorizedException("Attendee not found");

    return { session, attendee };
  }
}
