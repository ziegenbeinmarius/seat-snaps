import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { ATTENDEE_SESSION_COOKIE } from "./attendee-session.guard";

export const CSRF_COOKIE = "XSRF-TOKEN";
export const CSRF_HEADER = "x-xsrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (SAFE_METHODS.has(request.method)) return true;

    const cookies = request.cookies as Record<string, string> | undefined;
    const hasSessionCookie = !!cookies?.[ATTENDEE_SESSION_COOKIE];
    if (!hasSessionCookie) return true;

    const cookieToken = cookies?.[CSRF_COOKIE];
    const headerToken = request.headers[CSRF_HEADER] as string | undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException("Invalid or missing CSRF token");
    }

    return true;
  }
}
