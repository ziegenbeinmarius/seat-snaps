import { Injectable, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
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

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

    const session = await this.sessionRepository.create({
      attendeeId: attendee.id,
      eventId: attendee.eventId,
      token,
      deviceFingerprint: deviceFingerprint ?? null,
      expiresAt,
    });

    // Auto check-in on first QR scan; preserve the original timestamp on subsequent scans
    if (!attendee.checkedInAt) {
      await this.attendeeRepository.update(attendee.id, { checkedInAt: new Date() });
    }

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
