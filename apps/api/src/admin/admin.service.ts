import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import type { Database } from "@seat-snaps/db";
import { sql, eq, users, events, eventMemberships, attendees, photos } from "@seat-snaps/db";
import { DB_PROVIDER } from "../database/database.module";
import type { IAdminService } from "./domain/IAdminService";
import type {
  AdminUserResponse,
  AdminEventResponse,
  AdminMetricsResponse,
} from "@seat-snaps/shared";

@Injectable()
export class AdminService implements IAdminService {
  constructor(
    @Inject(DB_PROVIDER)
    private readonly db: Database,
  ) {}

  async getUsers(): Promise<AdminUserResponse[]> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        eventCount: sql<number>`cast(count(distinct ${eventMemberships.eventId}) as int)`,
      })
      .from(users)
      .leftJoin(eventMemberships, eq(users.id, eventMemberships.userId))
      .groupBy(users.id)
      .orderBy(users.createdAt);

    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      isAdmin: r.isAdmin,
      createdAt: r.createdAt.toISOString(),
      eventCount: r.eventCount,
    }));
  }

  async getEvents(): Promise<AdminEventResponse[]> {
    const rows = await this.db
      .select({
        id: events.id,
        title: events.title,
        type: events.type,
        date: events.date,
        location: events.location,
        createdAt: events.createdAt,
        attendeeCount: sql<number>`cast(count(distinct ${attendees.id}) as int)`,
        photoCount: sql<number>`cast(count(distinct ${photos.id}) as int)`,
      })
      .from(events)
      .leftJoin(attendees, eq(events.id, attendees.eventId))
      .leftJoin(photos, eq(events.id, photos.eventId))
      .groupBy(events.id)
      .orderBy(events.createdAt);

    const eventIds = rows.map((r) => r.id);
    const ownerMap = new Map<string, { name: string; email: string }>();

    if (eventIds.length > 0) {
      const owners = await this.db
        .select({
          eventId: eventMemberships.eventId,
          name: users.name,
          email: users.email,
        })
        .from(eventMemberships)
        .innerJoin(users, eq(eventMemberships.userId, users.id))
        .where(eq(eventMemberships.role, "owner"));

      for (const o of owners) {
        ownerMap.set(o.eventId, { name: o.name, email: o.email });
      }
    }

    return rows.map((r) => {
      const owner = ownerMap.get(r.id);
      return {
        id: r.id,
        title: r.title,
        type: r.type,
        date: r.date.toISOString(),
        location: r.location,
        ownerName: owner?.name ?? null,
        ownerEmail: owner?.email ?? null,
        attendeeCount: r.attendeeCount,
        photoCount: r.photoCount,
        createdAt: r.createdAt.toISOString(),
      };
    });
  }

  async getMetrics(): Promise<AdminMetricsResponse> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [userStats] = await this.db
      .select({
        total: sql<number>`cast(count(*) as int)`,
        thisMonth: sql<number>`cast(count(*) filter (where ${users.createdAt} >= ${startOfMonth}) as int)`,
      })
      .from(users);

    const [eventStats] = await this.db
      .select({
        total: sql<number>`cast(count(*) as int)`,
        thisMonth: sql<number>`cast(count(*) filter (where ${events.createdAt} >= ${startOfMonth}) as int)`,
      })
      .from(events);

    const [attendeeStats] = await this.db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(attendees);

    const [photoStats] = await this.db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(photos);

    const eventsByType = await this.db
      .select({
        type: events.type,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(events)
      .groupBy(events.type);

    const recentEvents = await this.db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        attendeeCount: sql<number>`cast(count(distinct ${attendees.id}) as int)`,
      })
      .from(events)
      .leftJoin(attendees, eq(events.id, attendees.eventId))
      .groupBy(events.id)
      .orderBy(sql`${events.createdAt} desc`)
      .limit(5);

    return {
      totalUsers: userStats.total,
      totalEvents: eventStats.total,
      totalAttendees: attendeeStats.total,
      totalPhotos: photoStats.total,
      eventsThisMonth: eventStats.thisMonth,
      usersThisMonth: userStats.thisMonth,
      eventsByType: eventsByType.map((r) => ({ type: r.type, count: r.count })),
      recentEvents: recentEvents.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.date.toISOString(),
        attendeeCount: r.attendeeCount,
      })),
    };
  }

  async forceDeleteUser(id: string): Promise<void> {
    const user = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user[0]) throw new NotFoundException("User not found");
    await this.db.delete(users).where(eq(users.id, id));
  }

  async forceDeleteEvent(id: string): Promise<void> {
    const event = await this.db.select().from(events).where(eq(events.id, id)).limit(1);
    if (!event[0]) throw new NotFoundException("Event not found");
    await this.db.delete(events).where(eq(events.id, id));
  }
}
