import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Inject, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Server, Socket } from "socket.io";
import type { IAttendeeSessionRepository } from "../domain/repositories/IAttendeeSessionRepository";
import { ATTENDEE_SESSION_REPOSITORY } from "../domain/repositories/IAttendeeSessionRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IUserRepository } from "../domain/repositories/IUserRepository";
import { USER_REPOSITORY } from "../domain/repositories/IUserRepository";

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3005"];

@WebSocketGateway({
  cors: { origin: allowedOrigins, credentials: true },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(ATTENDEE_SESSION_REPOSITORY)
    private readonly sessionRepository: IAttendeeSessionRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async handleConnection(socket: Socket) {
    const auth = socket.handshake.auth as Record<string, string | undefined>;
    const token = auth["token"] ?? this.extractBearerToken(socket);
    const queriedEventId = auth["eventId"] ?? (socket.handshake.query["eventId"] as string | undefined);

    if (!token) {
      socket.disconnect(true);
      return;
    }

    const context = await this.resolveContext(token, queriedEventId);
    if (!context) {
      socket.disconnect(true);
      return;
    }

    const { eventId, tableId } = context;
    socket.join(`event:${eventId}`);
    if (tableId) socket.join(`event:${eventId}:table:${tableId}`);

    this.logger.log(`Socket ${socket.id} joined event:${eventId}${tableId ? `:table:${tableId}` : ""}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  emitToEvent(eventId: string, payload: unknown) {
    this.server.to(`event:${eventId}`).emit("broadcast", payload);
  }

  emitToTable(eventId: string, tableId: string, payload: unknown) {
    this.server.to(`event:${eventId}:table:${tableId}`).emit("broadcast", payload);
  }

  emitSeatingUpdate(eventId: string) {
    this.server.to(`event:${eventId}`).emit("seating_update", { eventId });
  }

  private extractBearerToken(socket: Socket): string | null {
    const auth = socket.handshake.headers.authorization;
    return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  }

  private async resolveContext(
    token: string,
    queriedEventId?: string,
  ): Promise<{ eventId: string; tableId: string | null } | null> {
    // Try organizer JWT
    try {
      const payload = this.jwtService.verify<{ id?: string; tokenVersion?: number }>(token);
      const userId = payload?.id;
      if (userId && queriedEventId) {
        const user = await this.userRepository.findById(userId);
        if (!user) return null;

        const jwtVersion = typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0;
        if (jwtVersion < (user.tokenVersion ?? 0)) return null;

        const membership = await this.membershipRepository.findByUserAndEvent(userId, queriedEventId);
        if (membership) return { eventId: queriedEventId, tableId: null };
      }
      return null;
    } catch {
      // not a JWT, fall through to attendee session
    }

    // Try attendee session token
    try {
      const session = await this.sessionRepository.findByToken(token);
      if (!session || session.expiresAt < new Date()) return null;
      if (queriedEventId && session.eventId !== queriedEventId) return null;

      const attendee = await this.attendeeRepository.findById(session.attendeeId);
      return { eventId: session.eventId, tableId: attendee?.tableId ?? null };
    } catch {
      return null;
    }
  }
}
