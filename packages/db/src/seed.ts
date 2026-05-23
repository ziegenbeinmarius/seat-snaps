import { eq } from "drizzle-orm";
import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createDb } from "./index.js";
import { users, events, eventMemberships, attendees, tables, seats, pricingTiers, userCredits } from "./schema/index.js";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
    break;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const db = createDb(DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  // Users
  const [alice, bob] = await db
    .insert(users)
    .values([
      {
        email: "alice@example.com",
        name: "Alice Organizer",
        passwordHash: "$2b$10$placeholder_hash_alice",
        avatarUrl: null,
      },
      {
        email: "bob@example.com",
        name: "Bob Organizer",
        passwordHash: "$2b$10$placeholder_hash_bob",
        avatarUrl: null,
      },
    ])
    .returning();

  console.log(`Created users: ${alice.name}, ${bob.name}`);

  // Pricing tiers
  await db.insert(pricingTiers).values([
    { name: "Starter", eventCount: 2, priceSek: 499, currency: "SEK" },
    { name: "Pro", eventCount: 5, priceSek: 999, currency: "SEK" },
    { name: "Business", eventCount: 20, priceSek: 1999, currency: "SEK" },
  ]);

  console.log("Created pricing tiers");

  // Give Alice some credits (simulating a purchase)
  await db.insert(userCredits).values({
    userId: alice.id,
    totalCredits: 5,
    usedCredits: 1,
    freeTrialUsed: true,
  });

  console.log("Created user credits for Alice");

  // Event
  const [event] = await db
    .insert(events)
    .values({
      title: "Smith & Johnson Wedding",
      description: "A celebration of love and commitment",
      date: new Date("2026-09-15T16:00:00Z"),
      endDate: new Date("2026-09-15T23:00:00Z"),
      location: "Grand Ballroom, The Royal Hotel",
      type: "wedding",
      settings: { allowGuestPhotos: true, requireApproval: false },
    })
    .returning();

  console.log(`Created event: ${event.title}`);

  // Memberships
  await db.insert(eventMemberships).values([
    { userId: alice.id, eventId: event.id, role: "owner", status: "active" },
    { userId: bob.id, eventId: event.id, role: "organizer", status: "active" },
  ]);

  console.log("Created memberships");

  // Tables
  const [tableA, tableB, tableC] = await db
    .insert(tables)
    .values([
      { eventId: event.id, name: "Table 1", label: "Bride's Family", capacity: 8, positionX: 100, positionY: 100 },
      { eventId: event.id, name: "Table 2", label: "Groom's Family", capacity: 8, positionX: 300, positionY: 100 },
      { eventId: event.id, name: "Table 3", label: "Friends", capacity: 10, positionX: 200, positionY: 250 },
    ])
    .returning();

  console.log(`Created tables: ${tableA.name}, ${tableB.name}, ${tableC.name}`);

  // Seats
  const tableASeats = await db
    .insert(seats)
    .values(
      Array.from({ length: 8 }, (_, i) => ({
        tableId: tableA.id,
        eventId: event.id,
        label: `${tableA.name}-${i + 1}`,
        position: i + 1,
      })),
    )
    .returning();

  const tableBSeats = await db
    .insert(seats)
    .values(
      Array.from({ length: 8 }, (_, i) => ({
        tableId: tableB.id,
        eventId: event.id,
        label: `${tableB.name}-${i + 1}`,
        position: i + 1,
      })),
    )
    .returning();

  console.log(`Created ${tableASeats.length + tableBSeats.length} seats`);

  // Attendees
  const attendeeData = [
    {
      eventId: event.id,
      name: "Emma Smith",
      email: "emma@example.com",
      groupLabel: "Bride's Family",
      tableId: tableA.id,
      seatId: tableASeats[0].id,
      qrToken: "qr_emma_" + Math.random().toString(36).slice(2, 10),
      conversationStarters: ["What's your favourite memory with the bride?", "How did you meet the family?"],
    },
    {
      eventId: event.id,
      name: "James Smith",
      email: "james@example.com",
      groupLabel: "Bride's Family",
      tableId: tableA.id,
      seatId: tableASeats[1].id,
      qrToken: "qr_james_" + Math.random().toString(36).slice(2, 10),
      conversationStarters: ["Are you a morning person or night owl?", "Favourite travel destination?"],
    },
    {
      eventId: event.id,
      name: "Olivia Johnson",
      email: "olivia@example.com",
      groupLabel: "Groom's Family",
      tableId: tableB.id,
      seatId: tableBSeats[0].id,
      qrToken: "qr_olivia_" + Math.random().toString(36).slice(2, 10),
      conversationStarters: ["How long have you known the groom?", "Funniest story about him?"],
    },
    {
      eventId: event.id,
      name: "Lucas Johnson",
      email: "lucas@example.com",
      groupLabel: "Groom's Family",
      tableId: tableB.id,
      seatId: tableBSeats[1].id,
      qrToken: "qr_lucas_" + Math.random().toString(36).slice(2, 10),
    },
    {
      eventId: event.id,
      name: "Sophie Williams",
      groupLabel: "Friends",
      tableId: tableC.id,
      qrToken: "qr_sophie_" + Math.random().toString(36).slice(2, 10),
      conversationStarters: ["How do you know the couple?", "Best wedding you've been to before this one?"],
    },
  ];

  const createdAttendees = await db.insert(attendees).values(attendeeData).returning();

  // Assign attendees to their seats
  for (const attendee of createdAttendees) {
    if (attendee.seatId) {
      await db
        .update(seats)
        .set({ attendeeId: attendee.id })
        .where(eq(seats.id, attendee.seatId));
    }
  }

  console.log(`Created ${createdAttendees.length} attendees`);
  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
