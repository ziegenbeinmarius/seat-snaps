import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AttendeeSessionsService } from "./attendee-sessions.service";
import { ATTENDEE_SESSION_REPOSITORY } from "../domain/repositories/IAttendeeSessionRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";

function makeAttendee(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "att-1",
    eventId: "evt-1",
    name: "Guest",
    email: "guest@example.com",
    groupLabel: null,
    conversationStarters: null,
    description: null,
    status: "confirmed",
    tableId: null,
    seatId: null,
    qrToken: "qr-token-abc",
    photoLimit: 10,
    checkedInAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeSession(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "sess-1",
    attendeeId: "att-1",
    eventId: "evt-1",
    deviceFingerprint: null,
    token: "session-token-xyz",
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
    ...overrides,
  };
}

describe("AttendeeSessionsService", () => {
  let service: AttendeeSessionsService;
  let sessionRepo: Record<string, ReturnType<typeof vi.fn>>;
  let attendeeRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    sessionRepo = {
      findByToken: vi.fn(),
      findByAttendeeId: vi.fn(),
      create: vi.fn(),
      deleteByToken: vi.fn(),
      deleteExpired: vi.fn(),
    };

    attendeeRepo = {
      findById: vi.fn(),
      findByQrToken: vi.fn(),
      findByEventId: vi.fn(),
      findByEventAndEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      bulkUpdateStatus: vi.fn(),
      delete: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AttendeeSessionsService,
        { provide: ATTENDEE_SESSION_REPOSITORY, useValue: sessionRepo },
        { provide: ATTENDEE_REPOSITORY, useValue: attendeeRepo },
      ],
    }).compile();

    service = module.get(AttendeeSessionsService);
  });

  describe("createFromQrToken", () => {
    it("creates a session and auto-checks-in on first join", async () => {
      const attendee = makeAttendee({ checkedInAt: null });
      attendeeRepo.findByQrToken.mockResolvedValue(attendee);
      sessionRepo.create.mockResolvedValue(makeSession());
      attendeeRepo.update.mockResolvedValue(makeAttendee({ checkedInAt: new Date() }));

      const result = await service.createFromQrToken("qr-token-abc");

      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attendeeId: "att-1",
          eventId: "evt-1",
          token: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      );
      expect(attendeeRepo.update).toHaveBeenCalledWith(
        "att-1",
        expect.objectContaining({ checkedInAt: expect.any(Date) }),
      );
      expect(result.session).toBeDefined();
      expect(result.attendee).toBeDefined();
    });

    it("does not overwrite existing checkedInAt", async () => {
      const existingCheckIn = new Date("2026-01-01");
      attendeeRepo.findByQrToken.mockResolvedValue(
        makeAttendee({ checkedInAt: existingCheckIn }),
      );
      sessionRepo.create.mockResolvedValue(makeSession());

      await service.createFromQrToken("qr-token-abc");

      expect(attendeeRepo.update).not.toHaveBeenCalled();
    });

    it("passes deviceFingerprint to session", async () => {
      attendeeRepo.findByQrToken.mockResolvedValue(makeAttendee());
      sessionRepo.create.mockResolvedValue(makeSession());
      attendeeRepo.update.mockResolvedValue(makeAttendee());

      await service.createFromQrToken("qr-token-abc", "fingerprint-123");

      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ deviceFingerprint: "fingerprint-123" }),
      );
    });

    it("throws NotFoundException for invalid QR token", async () => {
      attendeeRepo.findByQrToken.mockResolvedValue(null);

      await expect(service.createFromQrToken("bad-token")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getByToken", () => {
    it("returns session and attendee for valid token", async () => {
      sessionRepo.findByToken.mockResolvedValue(makeSession());
      attendeeRepo.findById.mockResolvedValue(makeAttendee());

      const result = await service.getByToken("session-token-xyz");

      expect(result.session.id).toBe("sess-1");
      expect(result.attendee.id).toBe("att-1");
    });

    it("throws UnauthorizedException for expired session", async () => {
      sessionRepo.findByToken.mockResolvedValue(
        makeSession({ expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(service.getByToken("expired-token")).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException for invalid token", async () => {
      sessionRepo.findByToken.mockResolvedValue(null);

      await expect(service.getByToken("no-such-token")).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException when attendee no longer exists", async () => {
      sessionRepo.findByToken.mockResolvedValue(makeSession());
      attendeeRepo.findById.mockResolvedValue(null);

      await expect(service.getByToken("session-token-xyz")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("updateSelf", () => {
    it("updates description and conversationStarters", async () => {
      attendeeRepo.update.mockResolvedValue(
        makeAttendee({
          description: "Updated bio",
          conversationStarters: ["Hi", "Hello"],
        }),
      );

      const result = await service.updateSelf("att-1", {
        description: "Updated bio",
        conversationStarters: ["Hi", "Hello"],
      });

      expect(attendeeRepo.update).toHaveBeenCalledWith("att-1", {
        description: "Updated bio",
        conversationStarters: ["Hi", "Hello"],
      });
    });

    it("handles partial update with only description", async () => {
      attendeeRepo.update.mockResolvedValue(makeAttendee({ description: "New desc" }));

      await service.updateSelf("att-1", { description: "New desc" });

      expect(attendeeRepo.update).toHaveBeenCalledWith("att-1", {
        description: "New desc",
      });
    });
  });
});
