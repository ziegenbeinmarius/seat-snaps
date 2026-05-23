import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Test } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomUUID } from "crypto";

import fastifyCookie from "@fastify/cookie";
import { AppModule } from "../src/app.module";
import { DB_PROVIDER } from "../src/database/database.module";

import { USER_REPOSITORY } from "../src/domain/repositories/IUserRepository";
import { EVENT_REPOSITORY } from "../src/domain/repositories/IEventRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../src/domain/repositories/IEventMembershipRepository";
import { ATTENDEE_REPOSITORY } from "../src/domain/repositories/IAttendeeRepository";
import { TABLE_REPOSITORY } from "../src/domain/repositories/ITableRepository";
import { SEAT_REPOSITORY } from "../src/domain/repositories/ISeatRepository";
import { ATTENDEE_SESSION_REPOSITORY } from "../src/domain/repositories/IAttendeeSessionRepository";
import { USER_CREDIT_REPOSITORY } from "../src/domain/repositories/IUserCreditRepository";
import { PAYMENT_REPOSITORY } from "../src/domain/repositories/IPaymentRepository";
import { PRICING_TIER_REPOSITORY } from "../src/domain/repositories/IPricingTierRepository";
import { PHOTO_REPOSITORY } from "../src/domain/repositories/IPhotoRepository";
import { ORGANIZER_INVITE_REPOSITORY } from "../src/domain/repositories/IOrganizerInviteRepository";
import { SCHEDULE_ITEM_REPOSITORY } from "../src/domain/repositories/IScheduleItemRepository";
import { EVENT_THEME_REPOSITORY } from "../src/domain/repositories/IEventThemeRepository";
import { BROADCAST_REPOSITORY } from "../src/domain/repositories/IBroadcastRepository";
import { PUSH_SUBSCRIPTION_REPOSITORY } from "../src/domain/repositories/IPushSubscriptionRepository";
import { S3_SERVICE } from "../src/infrastructure/s3/IS3Service";
import { EventGateway } from "../src/broadcasts/event.gateway";

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

function createInMemoryUserRepo() {
  const users = new Map<string, Record<string, unknown>>();
  const byEmail = new Map<string, string>();
  return {
    findById: vi.fn(async (id: string) => users.get(id) ?? null),
    findByEmail: vi.fn(async (email: string) => {
      const uid = byEmail.get(email.toLowerCase());
      return uid ? users.get(uid) ?? null : null;
    }),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const user = { id: randomUUID(), ...data, avatarUrl: null, isAdmin: false, tokenVersion: 0, createdAt: new Date(), updatedAt: new Date() };
      users.set(user.id as string, user);
      byEmail.set((user.email as string).toLowerCase(), user.id as string);
      return user;
    }),
    update: vi.fn(async (id: string, data: Record<string, unknown>) => {
      const user = users.get(id)!;
      Object.assign(user, data, { updatedAt: new Date() });
      return user;
    }),
    delete: vi.fn(async (id: string) => { users.delete(id); }),
    _store: users,
  };
}

function createInMemoryEventRepo() {
  const events = new Map<string, Record<string, unknown>>();
  return {
    findById: vi.fn(async (id: string) => events.get(id) ?? null),
    findAll: vi.fn(async () => [...events.values()]),
    findByMemberId: vi.fn(async () => [...events.values()]),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const event = { id: randomUUID(), ...data, isFinished: false, settings: null, deletedAt: null, createdAt: new Date(), updatedAt: new Date() };
      events.set(event.id as string, event);
      return event;
    }),
    update: vi.fn(async (id: string, data: Record<string, unknown>) => {
      const event = events.get(id)!;
      Object.assign(event, data, { updatedAt: new Date() });
      return event;
    }),
    delete: vi.fn(async (id: string) => { events.delete(id); }),
    softDelete: vi.fn(async (id: string) => { const e = events.get(id); if (e) e["deletedAt"] = new Date(); }),
    reactivate: vi.fn(async (id: string) => { const e = events.get(id); if (e) e["deletedAt"] = null; return e; }),
  };
}

function createInMemoryMembershipRepo() {
  const memberships = new Map<string, Record<string, unknown>>();
  return {
    findByEventId: vi.fn(async (eventId: string) => [...memberships.values()].filter(m => m["eventId"] === eventId)),
    findByEventIdWithUsers: vi.fn(async (eventId: string) => [...memberships.values()].filter(m => m["eventId"] === eventId)),
    findByUserAndEvent: vi.fn(async (userId: string, eventId: string) =>
      [...memberships.values()].find(m => m["userId"] === userId && m["eventId"] === eventId) ?? null),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const m = { id: randomUUID(), ...data, createdAt: new Date() };
      memberships.set(m.id as string, m);
      return m;
    }),
    remove: vi.fn(async () => {}),
  };
}

function createInMemoryAttendeeRepo() {
  const attendees = new Map<string, Record<string, unknown>>();
  return {
    findById: vi.fn(async (id: string) => attendees.get(id) ?? null),
    findByQrToken: vi.fn(async (token: string) =>
      [...attendees.values()].find(a => a["qrToken"] === token) ?? null),
    findByEventId: vi.fn(async (eventId: string) =>
      [...attendees.values()].filter(a => a["eventId"] === eventId)),
    findByEventAndEmail: vi.fn(async (eventId: string, email: string) =>
      [...attendees.values()].find(a => a["eventId"] === eventId && a["email"] === email) ?? null),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const a = { id: randomUUID(), status: "confirmed", tableId: null, seatId: null, checkedInAt: null, createdAt: new Date(), updatedAt: new Date(), ...data };
      attendees.set(a.id as string, a);
      return a;
    }),
    update: vi.fn(async (id: string, data: Record<string, unknown>) => {
      const a = attendees.get(id)!;
      Object.assign(a, data, { updatedAt: new Date() });
      return a;
    }),
    bulkUpdateStatus: vi.fn(async (ids: string[], status: string) =>
      ids.map(id => { const a = attendees.get(id); if (a) a["status"] = status; return a; })),
    delete: vi.fn(async (id: string) => { attendees.delete(id); }),
  };
}

function createInMemoryTableRepo() {
  const tables = new Map<string, Record<string, unknown>>();
  return {
    findById: vi.fn(async (id: string) => tables.get(id) ?? null),
    findByEventId: vi.fn(async (eventId: string) => [...tables.values()].filter(t => t["eventId"] === eventId)),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const t = { id: randomUUID(), ...data, createdAt: new Date() };
      tables.set(t.id as string, t);
      return t;
    }),
    update: vi.fn(async (id: string, data: Record<string, unknown>) => {
      const t = tables.get(id)!; Object.assign(t, data); return t;
    }),
    delete: vi.fn(async (id: string) => { tables.delete(id); }),
  };
}

function createInMemorySeatRepo() {
  const seats = new Map<string, Record<string, unknown>>();
  return {
    findById: vi.fn(async (id: string) => seats.get(id) ?? null),
    findByTableId: vi.fn(async (tableId: string) => [...seats.values()].filter(s => s["tableId"] === tableId)),
    findByEventId: vi.fn(async (eventId: string) => [...seats.values()].filter(s => s["eventId"] === eventId)),
    assignAttendee: vi.fn(async (seatId: string, attendeeId: string) => {
      const s = seats.get(seatId)!; s["attendeeId"] = attendeeId; return s;
    }),
    unassignAttendee: vi.fn(async (seatId: string) => {
      const s = seats.get(seatId)!; s["attendeeId"] = null; return s;
    }),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const s = { id: randomUUID(), ...data, createdAt: new Date() };
      seats.set(s.id as string, s); return s;
    }),
    update: vi.fn(async (id: string, data: Record<string, unknown>) => { const s = seats.get(id)!; Object.assign(s, data); return s; }),
    delete: vi.fn(async (id: string) => { seats.delete(id); }),
  };
}

function createInMemorySessionRepo() {
  const sessions = new Map<string, Record<string, unknown>>();
  return {
    findByToken: vi.fn(async (token: string) =>
      [...sessions.values()].find(s => s["token"] === token) ?? null),
    findByAttendeeId: vi.fn(async (attendeeId: string) =>
      [...sessions.values()].filter(s => s["attendeeId"] === attendeeId)),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const s = { id: randomUUID(), ...data, createdAt: new Date() };
      sessions.set(s.id as string, s); return s;
    }),
    deleteByToken: vi.fn(async () => {}),
    deleteExpired: vi.fn(async () => {}),
  };
}

function createInMemoryCreditRepo() {
  const credits = new Map<string, Record<string, unknown>>();
  return {
    findByUserId: vi.fn(async (userId: string) =>
      [...credits.values()].find(c => c["userId"] === userId) ?? null),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const c = { id: randomUUID(), totalCredits: 0, usedCredits: 0, freeTrialUsed: false, createdAt: new Date(), updatedAt: new Date(), ...data };
      credits.set(c.id as string, c); return c;
    }),
    incrementCredits: vi.fn(async (userId: string, amount: number) => {
      const c = [...credits.values()].find(c => c["userId"] === userId)!;
      c["totalCredits"] = (c["totalCredits"] as number) + amount; return c;
    }),
    consumeCredit: vi.fn(async (userId: string) => {
      const c = [...credits.values()].find(c => c["userId"] === userId)!;
      c["usedCredits"] = (c["usedCredits"] as number) + 1; return c;
    }),
    consumeCreditAtomically: vi.fn(async (userId: string) => {
      const c = [...credits.values()].find(c => c["userId"] === userId);
      if (!c || (c["totalCredits"] as number) - (c["usedCredits"] as number) <= 0) return false;
      c["usedCredits"] = (c["usedCredits"] as number) + 1; return true;
    }),
    markFreeTrialUsed: vi.fn(async (userId: string) => {
      const c = [...credits.values()].find(c => c["userId"] === userId)!;
      c["freeTrialUsed"] = true; return c;
    }),
    grantTrialAtomically: vi.fn(async (userId: string) => {
      const c = [...credits.values()].find(c => c["userId"] === userId);
      if (!c || c["freeTrialUsed"]) return false;
      c["freeTrialUsed"] = true; c["totalCredits"] = (c["totalCredits"] as number) + 1; return true;
    }),
  };
}

function createInMemoryPaymentRepo() {
  const payments = new Map<string, Record<string, unknown>>();
  return {
    findById: vi.fn(async (id: string) => payments.get(id) ?? null),
    findByUserId: vi.fn(async (userId: string) => [...payments.values()].filter(p => p["userId"] === userId)),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const p = { id: randomUUID(), ...data, createdAt: new Date() };
      payments.set(p.id as string, p); return p;
    }),
    updateStatus: vi.fn(async (id: string, status: string) => {
      const p = payments.get(id)!; p["status"] = status; return p;
    }),
  };
}

function createInMemoryTierRepo() {
  const tiers = new Map<string, Record<string, unknown>>();
  const starter = { id: randomUUID(), name: "Starter", eventCount: 2, priceSek: 499, currency: "SEK", active: true, createdAt: new Date(), updatedAt: new Date() };
  tiers.set(starter.id, starter);
  return {
    findById: vi.fn(async (id: string) => tiers.get(id) ?? null),
    findAllActive: vi.fn(async () => [...tiers.values()].filter(t => t["active"])),
    _starterId: starter.id,
  };
}

function createInMemoryPhotoRepo() {
  const photos = new Map<string, Record<string, unknown>>();
  return {
    findById: vi.fn(async (id: string) => photos.get(id) ?? null),
    findByEventId: vi.fn(async (eventId: string) => [...photos.values()].filter(p => p["eventId"] === eventId)),
    findByAttendeeId: vi.fn(async (attendeeId: string) => [...photos.values()].filter(p => p["attendeeId"] === attendeeId)),
    create: vi.fn(async (data: Record<string, unknown>) => {
      const p = { id: randomUUID(), thumbnailKey: null, caption: null, isHighlight: false, highlightOrder: null, createdAt: new Date(), ...data };
      photos.set(p.id as string, p); return p;
    }),
    updateStatus: vi.fn(async (id: string, status: string) => { const p = photos.get(id)!; p["status"] = status; return p; }),
    updateThumbnailKey: vi.fn(async (id: string, k: string) => { const p = photos.get(id)!; p["thumbnailKey"] = k; return p; }),
    updateHighlight: vi.fn(async (id: string, h: boolean, o?: number | null) => { const p = photos.get(id)!; p["isHighlight"] = h; p["highlightOrder"] = o ?? null; return p; }),
    delete: vi.fn(async (id: string) => { photos.delete(id); }),
  };
}

// ---------------------------------------------------------------------------
// E2E Test Suite
// ---------------------------------------------------------------------------

describe("SeatSnaps E2E — Full User Flow", () => {
  let app: NestFastifyApplication;
  let jwtService: JwtService;
  let tierRepo: ReturnType<typeof createInMemoryTierRepo>;
  let userRepo: ReturnType<typeof createInMemoryUserRepo>;

  const AUTH_SECRET = "e2e-test-secret-key-that-is-at-least-32-chars-long";

  function authHeader(userId: string) {
    const token = jwtService.sign({ id: userId, tokenVersion: 0 });
    return { authorization: `Bearer ${token}` };
  }

  beforeAll(async () => {
    vi.stubEnv("AUTH_SECRET", AUTH_SECRET);
    vi.stubEnv("PAYMENTS_MODE", "dummy");

    userRepo = createInMemoryUserRepo();
    const eventRepo = createInMemoryEventRepo();
    const membershipRepo = createInMemoryMembershipRepo();
    const attendeeRepo = createInMemoryAttendeeRepo();
    const tableRepo = createInMemoryTableRepo();
    const seatRepo = createInMemorySeatRepo();
    const sessionRepo = createInMemorySessionRepo();
    const creditRepo = createInMemoryCreditRepo();
    const paymentRepo = createInMemoryPaymentRepo();
    tierRepo = createInMemoryTierRepo();
    const photoRepo = createInMemoryPhotoRepo();
    const s3Service = {
      getSignedUploadUrl: vi.fn(async () => "https://s3.test/upload"),
      getSignedDownloadUrl: vi.fn(async () => "https://s3.test/download"),
      deleteObject: vi.fn(async () => {}),
      putObject: vi.fn(async () => {}),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DB_PROVIDER).useValue(null)
      .overrideProvider(USER_REPOSITORY).useValue(userRepo)
      .overrideProvider(EVENT_REPOSITORY).useValue(eventRepo)
      .overrideProvider(EVENT_MEMBERSHIP_REPOSITORY).useValue(membershipRepo)
      .overrideProvider(ATTENDEE_REPOSITORY).useValue(attendeeRepo)
      .overrideProvider(TABLE_REPOSITORY).useValue(tableRepo)
      .overrideProvider(SEAT_REPOSITORY).useValue(seatRepo)
      .overrideProvider(ATTENDEE_SESSION_REPOSITORY).useValue(sessionRepo)
      .overrideProvider(USER_CREDIT_REPOSITORY).useValue(creditRepo)
      .overrideProvider(PAYMENT_REPOSITORY).useValue(paymentRepo)
      .overrideProvider(PRICING_TIER_REPOSITORY).useValue(tierRepo)
      .overrideProvider(PHOTO_REPOSITORY).useValue(photoRepo)
      .overrideProvider(ORGANIZER_INVITE_REPOSITORY).useValue({})
      .overrideProvider(SCHEDULE_ITEM_REPOSITORY).useValue({})
      .overrideProvider(EVENT_THEME_REPOSITORY).useValue({})
      .overrideProvider(BROADCAST_REPOSITORY).useValue({})
      .overrideProvider(PUSH_SUBSCRIPTION_REPOSITORY).useValue({})
      .overrideProvider(S3_SERVICE).useValue(s3Service)
      .overrideProvider(EventGateway).useValue({
        emitSeatingUpdate: vi.fn(),
        emitToEvent: vi.fn(),
        emitToTable: vi.fn(),
        handleConnection: vi.fn(),
        handleDisconnect: vi.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(fastifyCookie as never);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix("api");

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app?.close();
    vi.unstubAllEnvs();
  });

  let userId: string;
  let eventId: string;
  let attendeeId: string;
  let attendeeQrToken: string;
  let seatId: string;
  let sessionToken: string;

  // ─── 1. User Creation ────────────────────────────────────────────────────
  describe("1. User Creation", () => {
    it("POST /api/auth/register — creates a new user", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/auth/register",
        payload: { email: "organizer@example.com", name: "Test Organizer", password: "SecurePass123!" },
      });
      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.email).toBe("organizer@example.com");
      expect(body.name).toBe("Test Organizer");
      userId = body.id;
    });

    it("POST /api/auth/register — rejects duplicate email", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/auth/register",
        payload: { email: "organizer@example.com", name: "Dup", password: "AnotherPass123" },
      });
      expect(res.statusCode).toBe(409);
    });

    it("POST /api/auth/validate — validates correct credentials", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/auth/validate",
        payload: { email: "organizer@example.com", password: "SecurePass123!" },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().id).toBe(userId);
    });

    it("POST /api/auth/validate — rejects wrong password", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/auth/validate",
        payload: { email: "organizer@example.com", password: "WrongPassword" },
      });
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── 2. Payment Tiers & Credits ──────────────────────────────────────────
  describe("2. Payment Tiers & Credits", () => {
    it("GET /api/payments/tiers — lists pricing tiers", async () => {
      const res = await app.inject({ method: "GET", url: "/api/payments/tiers" });
      expect(res.statusCode).toBe(200);
      const tiers = res.json();
      expect(tiers.length).toBeGreaterThan(0);
      expect(tiers[0]).toHaveProperty("eventCount");
    });

    it("POST /api/payments/checkout — purchases and grants credits", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/payments/checkout",
        payload: { tierId: tierRepo._starterId },
        headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(201);
      expect(res.json().status).toBe("completed");
      expect(res.json().creditsGranted).toBe(2);
    });

    it("GET /api/credits — shows credit balance", async () => {
      const res = await app.inject({ method: "GET", url: "/api/credits", headers: authHeader(userId) });
      expect(res.statusCode).toBe(200);
      expect(res.json().totalCredits).toBeGreaterThan(0);
    });
  });

  // ─── 3. Events ──────────────────────────────────────────────────────────
  describe("3. Events", () => {
    it("POST /api/events — creates event with correct options", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/events",
        payload: {
          title: "Test Wedding", description: "E2E test",
          date: "2026-09-15T14:00:00.000Z", location: "Stockholm",
          timezone: "Europe/Stockholm", type: "wedding",
          hasSeating: true, rsvpEnabled: false,
        },
        headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(201);
      const event = res.json();
      expect(event.title).toBe("Test Wedding");
      expect(event.type).toBe("wedding");
      expect(event.hasSeating).toBe(true);
      eventId = event.id;
    });

    it("GET /api/events — user sees own events", async () => {
      const res = await app.inject({ method: "GET", url: "/api/events", headers: authHeader(userId) });
      expect(res.statusCode).toBe(200);
      expect(res.json().some((e: { id: string }) => e.id === eventId)).toBe(true);
    });

    it("GET /api/events/:id — owner can access", async () => {
      const res = await app.inject({ method: "GET", url: `/api/events/${eventId}`, headers: authHeader(userId) });
      expect(res.statusCode).toBe(200);
    });

    it("GET /api/events/:id — non-member gets 403", async () => {
      const otherId = randomUUID();
      userRepo._store.set(otherId, { id: otherId, email: "o@e.com", name: "O", passwordHash: "x", avatarUrl: null, isAdmin: false, tokenVersion: 0, createdAt: new Date(), updatedAt: new Date() });
      const res = await app.inject({ method: "GET", url: `/api/events/${eventId}`, headers: authHeader(otherId) });
      expect(res.statusCode).toBe(403);
    });

    it("GET /api/events/:id/info — public without auth", async () => {
      const res = await app.inject({ method: "GET", url: `/api/events/${eventId}/info` });
      expect(res.statusCode).toBe(200);
      expect(res.json().title).toBe("Test Wedding");
    });
  });

  // ─── 4. Attendees ────────────────────────────────────────────────────────
  describe("4. Attendees", () => {
    it("POST — adds an attendee with all options stored correctly", async () => {
      const res = await app.inject({
        method: "POST", url: `/api/events/${eventId}/attendees`,
        payload: { name: "Alice Guest", email: "alice@e.com", groupLabel: "Bride's Side", description: "Friend", conversationStarters: ["Travel"], photoLimit: 5 },
        headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(201);
      const a = res.json();
      expect(a.name).toBe("Alice Guest");
      expect(a.groupLabel).toBe("Bride's Side");
      expect(a.conversationStarters).toEqual(["Travel"]);
      expect(a.photoLimit).toBe(5);
      expect(a.qrToken).toBeDefined();
      attendeeId = a.id;
      attendeeQrToken = a.qrToken;
    });

    it("POST — rejects duplicate email", async () => {
      const res = await app.inject({
        method: "POST", url: `/api/events/${eventId}/attendees`,
        payload: { name: "Dup", email: "alice@e.com" },
        headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(409);
    });

    it("GET — lists attendees", async () => {
      const res = await app.inject({ method: "GET", url: `/api/events/${eventId}/attendees`, headers: authHeader(userId) });
      expect(res.statusCode).toBe(200);
      expect(res.json().length).toBeGreaterThan(0);
    });
  });

  // ─── 5. Tables & Seating ─────────────────────────────────────────────────
  describe("5. Tables & Seating", () => {
    it("POST — creates table with auto-generated seats", async () => {
      const res = await app.inject({
        method: "POST", url: `/api/events/${eventId}/tables`,
        payload: { name: "Head Table", capacity: 4, shape: "rectangular" },
        headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(201);
      const t = res.json();
      expect(t.name).toBe("Head Table");
      expect(t.seats.length).toBe(4);
      seatId = t.seats[0].id;
    });

    it("PATCH — assigns attendee to seat", async () => {
      const res = await app.inject({
        method: "PATCH", url: `/api/events/${eventId}/seats/${seatId}/assign`,
        payload: { attendeeId }, headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().attendeeId).toBe(attendeeId);
    });

    it("PATCH — rejects occupied seat", async () => {
      const res = await app.inject({
        method: "PATCH", url: `/api/events/${eventId}/seats/${seatId}/assign`,
        payload: { attendeeId: randomUUID() }, headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(409);
    });

    it("PATCH — unassigns", async () => {
      const res = await app.inject({
        method: "PATCH", url: `/api/events/${eventId}/seats/${seatId}/unassign`,
        headers: authHeader(userId),
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().attendeeId).toBeNull();
    });
  });

  // ─── 6. Attendee Session ─────────────────────────────────────────────────
  describe("6. Attendee Session (QR)", () => {
    it("POST — creates session from QR", async () => {
      const res = await app.inject({
        method: "POST", url: "/api/attendee-sessions",
        payload: { qrToken: attendeeQrToken },
      });
      expect(res.statusCode).toBe(201);
      const b = res.json();
      expect(b.token).toBeDefined();
      expect(b.attendeeId).toBe(attendeeId);
      expect(b.eventId).toBe(eventId);
      expect(b.csrfToken).toBeDefined();
      sessionToken = b.token;
    });

    it("POST — rejects invalid QR", async () => {
      const res = await app.inject({ method: "POST", url: "/api/attendee-sessions", payload: { qrToken: "bad" } });
      expect(res.statusCode).toBe(404);
    });

    it("GET /me — returns attendee", async () => {
      const res = await app.inject({
        method: "GET", url: "/api/attendee-sessions/me",
        headers: { authorization: `Bearer ${sessionToken}` },
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().id).toBe(attendeeId);
    });
  });

  // ─── 7. Photo Upload ─────────────────────────────────────────────────────
  describe("7. Photo Upload", () => {
    it("POST — requests upload URL", async () => {
      const csrf = "csrf-val";
      const res = await app.inject({
        method: "POST", url: `/api/events/${eventId}/photos/upload-url`,
        payload: { contentType: "image/jpeg" },
        headers: { authorization: `Bearer ${sessionToken}`, "x-xsrf-token": csrf },
        cookies: { "XSRF-TOKEN": csrf, "attendee-session": sessionToken },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json().uploadUrl).toBeDefined();
      expect(res.json().photoId).toBeDefined();
    });
  });

  // ─── 8. Auth Guard ───────────────────────────────────────────────────────
  describe("8. Auth Guard", () => {
    it("rejects unauthenticated requests", async () => {
      const res = await app.inject({ method: "GET", url: "/api/events" });
      expect(res.statusCode).toBe(401);
    });
  });
});
