import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { IEventRepository } from "../../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../../domain/repositories/IEventMembershipRepository";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Injectable()
export class EventMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      user?: SessionUser;
      params?: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) return true;

    const eventId = request.params?.eventId;
    if (!eventId) return true;

    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const membership = await this.membershipRepository.findByUserAndEvent(user.id, eventId);
    if (!membership) throw new ForbiddenException("Access denied");

    return true;
  }
}
