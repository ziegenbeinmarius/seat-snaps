import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Attendee } from "@seat-snaps/db";

export const CurrentAttendee = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Attendee => {
    const request = ctx.switchToHttp().getRequest<{ attendee: Attendee }>();
    return request.attendee;
  },
);
