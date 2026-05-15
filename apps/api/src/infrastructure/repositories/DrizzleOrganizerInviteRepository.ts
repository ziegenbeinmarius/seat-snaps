import { eq } from "@seat-snaps/db";
import type { Database, OrganizerInvite, NewOrganizerInvite } from "@seat-snaps/db";
import { organizerInvites } from "@seat-snaps/db";
import type { IOrganizerInviteRepository } from "../../domain/repositories/IOrganizerInviteRepository";

export class DrizzleOrganizerInviteRepository implements IOrganizerInviteRepository {
  constructor(private readonly db: Database) {}

  async findByEventId(eventId: string): Promise<OrganizerInvite[]> {
    return this.db
      .select()
      .from(organizerInvites)
      .where(eq(organizerInvites.eventId, eventId));
  }

  async findByToken(token: string): Promise<OrganizerInvite | null> {
    const result = await this.db
      .select()
      .from(organizerInvites)
      .where(eq(organizerInvites.token, token))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewOrganizerInvite): Promise<OrganizerInvite> {
    const result = await this.db.insert(organizerInvites).values(data).returning();
    return result[0];
  }

  async markAccepted(id: string): Promise<OrganizerInvite> {
    const result = await this.db
      .update(organizerInvites)
      .set({ status: "accepted", acceptedAt: new Date() })
      .where(eq(organizerInvites.id, id))
      .returning();
    if (!result[0]) throw new Error(`Invite ${id} not found`);
    return result[0];
  }

  async markExpired(id: string): Promise<OrganizerInvite> {
    const result = await this.db
      .update(organizerInvites)
      .set({ status: "expired" })
      .where(eq(organizerInvites.id, id))
      .returning();
    if (!result[0]) throw new Error(`Invite ${id} not found`);
    return result[0];
  }
}
