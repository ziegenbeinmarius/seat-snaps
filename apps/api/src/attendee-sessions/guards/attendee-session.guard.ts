import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import type { IAttendeeSessionService } from "../domain/IAttendeeSessionService";
import { ATTENDEE_SESSION_SERVICE } from "../domain/IAttendeeSessionService";

export const ATTENDEE_SESSION_COOKIE = "attendee-session";

@Injectable()
export class AttendeeSessionGuard implements CanActivate {
  constructor(
    @Inject(ATTENDEE_SESSION_SERVICE)
    private readonly sessionService: IAttendeeSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { attendee?: unknown; attendeeSession?: unknown }>();

    const token =
      (request.cookies as Record<string, string>)?.[ATTENDEE_SESSION_COOKIE] ??
      this.extractBearerToken(request);

    if (!token) throw new UnauthorizedException("No attendee session");

    const result = await this.sessionService.getByToken(token);
    request.attendee = result.attendee;
    request.attendeeSession = result.session;
    return true;
  }

  private extractBearerToken(request: FastifyRequest): string | null {
    const auth = request.headers.authorization;
    return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  }
}
