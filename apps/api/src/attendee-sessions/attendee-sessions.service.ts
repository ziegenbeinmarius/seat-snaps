import { Injectable, Inject, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "crypto";
import type { Attendee } from "@seat-snaps/db";
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

    return this.issueSession(attendee, deviceFingerprint);
  }

  private async issueSession(
    attendee: Attendee,
    deviceFingerprint?: string,
  ): Promise<AttendeeSessionWithAttendee> {
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

    // Auto check-in on first join; preserve the original timestamp afterwards
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

  async updateSelf(
    attendeeId: string,
    data: { description?: string; conversationStarters?: string[] },
  ) {
    return this.attendeeRepository.update(attendeeId, {
      ...(data.description !== undefined && { description: data.description }),
      ...(data.conversationStarters !== undefined && {
        conversationStarters: data.conversationStarters,
      }),
    });
  }
}
