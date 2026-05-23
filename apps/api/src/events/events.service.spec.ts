import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { EventsService } from "./events.service";

function makeEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "evt-1",
    title: "Wedding",
    description: "A wedding",
    date: new Date("2026-09-15"),
    endDate: null,
    location: "Stockholm",
    timezone: "Europe/Stockholm",
    type: "wedding" as const,
    hasSeating: true,
    isFinished: false,
    rsvpEnabled: false,
    settings: null,
    isFreeTrial: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMembership(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "mem-1",
    userId: "user-1",
    eventId: "evt-1",
    role: "owner",
    status: "active",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("EventsService", () => {
  let service: EventsService;
  let eventRepo: Record<string, ReturnType<typeof vi.fn>>;
  let membershipRepo: Record<string, ReturnType<typeof vi.fn>>;
  let creditsService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    eventRepo = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findByMemberId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      softDelete: vi.fn(),
      reactivate: vi.fn(),
    };

    membershipRepo = {
      findByEventId: vi.fn(),
      findByEventIdWithUsers: vi.fn(),
      findByUserAndEvent: vi.fn(),
      create: vi.fn(),
      remove: vi.fn(),
    };

    creditsService = {
      grantFreeTrialIfEligible: vi.fn().mockResolvedValue(false),
      hasAvailableCredits: vi.fn().mockResolvedValue(true),
      consumeCredit: vi.fn(),
      getBalance: vi.fn(),
      ensureCreditsExist: vi.fn(),
      grantCredits: vi.fn(),
    };

    service = new EventsService(eventRepo as any, membershipRepo as any, creditsService as any);
  });

  describe("listForUser", () => {
    it("returns only non-deleted events for the user", async () => {
      const events = [
        makeEvent({ id: "evt-1" }),
        makeEvent({ id: "evt-2", deletedAt: new Date() }),
        makeEvent({ id: "evt-3" }),
      ];
      eventRepo.findByMemberId.mockResolvedValue(events);

      const result = await service.listForUser("user-1");

      expect(result).toHaveLength(2);
      expect(result.map((e: { id: string }) => e.id)).toEqual(["evt-1", "evt-3"]);
    });
  });

  describe("getById", () => {
    it("returns event when user is a member", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent());
      membershipRepo.findByUserAndEvent.mockResolvedValue(makeMembership());

      const result = await service.getById("evt-1", "user-1");

      expect(result.id).toBe("evt-1");
    });

    it("throws NotFoundException for non-existent event", async () => {
      eventRepo.findById.mockResolvedValue(null);

      await expect(service.getById("missing", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException for soft-deleted event", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent({ deletedAt: new Date() }));

      await expect(service.getById("evt-1", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when user is not a member", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent());
      membershipRepo.findByUserAndEvent.mockResolvedValue(null);

      await expect(service.getById("evt-1", "stranger")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("create", () => {
    it("creates event, consumes credit, and creates owner membership", async () => {
      const newEvent = makeEvent();
      eventRepo.create.mockResolvedValue(newEvent);
      membershipRepo.create.mockResolvedValue(makeMembership());

      const result = await service.create(
        {
          title: "Wedding",
          date: new Date("2026-09-15"),
          type: "wedding",
        },
        "user-1",
      );

      expect(creditsService.hasAvailableCredits).toHaveBeenCalledWith("user-1");
      expect(creditsService.consumeCredit).toHaveBeenCalledWith("user-1");
      expect(eventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Wedding", type: "wedding" }),
      );
      expect(membershipRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          eventId: newEvent.id,
          role: "owner",
          status: "active",
        }),
      );
      expect(result.id).toBe("evt-1");
    });

    it("throws BadRequestException when no credits available", async () => {
      creditsService.hasAvailableCredits.mockResolvedValue(false);

      await expect(
        service.create({ title: "X", date: new Date(), type: "other" }, "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("grants free trial credit if eligible", async () => {
      creditsService.grantFreeTrialIfEligible.mockResolvedValue(true);
      eventRepo.create.mockResolvedValue(makeEvent({ isFreeTrial: true }));
      membershipRepo.create.mockResolvedValue(makeMembership());

      await service.create({ title: "Trial", date: new Date(), type: "other" }, "user-1");

      expect(eventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isFreeTrial: true }),
      );
    });

    it("stores all event options correctly", async () => {
      eventRepo.create.mockResolvedValue(makeEvent());
      membershipRepo.create.mockResolvedValue(makeMembership());

      await service.create(
        {
          title: "Corporate",
          description: "Annual event",
          date: new Date("2026-12-01"),
          endDate: new Date("2026-12-02"),
          location: "Berlin",
          timezone: "Europe/Berlin",
          type: "corporate",
          hasSeating: false,
          rsvpEnabled: true,
        },
        "user-1",
      );

      expect(eventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Corporate",
          description: "Annual event",
          location: "Berlin",
          timezone: "Europe/Berlin",
          type: "corporate",
          hasSeating: false,
          rsvpEnabled: true,
        }),
      );
    });
  });

  describe("update", () => {
    it("updates event when user is the owner", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent());
      membershipRepo.findByUserAndEvent.mockResolvedValue(makeMembership({ role: "owner" }));
      eventRepo.update.mockResolvedValue(makeEvent({ title: "Updated" }));

      const result = await service.update("evt-1", { title: "Updated" }, "user-1");

      expect(result.title).toBe("Updated");
    });

    it("throws ForbiddenException when user is not the owner", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent());
      membershipRepo.findByUserAndEvent.mockResolvedValue(makeMembership({ role: "organizer" }));

      await expect(
        service.update("evt-1", { title: "X" }, "user-1"),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("delete", () => {
    it("soft-deletes the event when user is the owner", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent());
      membershipRepo.findByUserAndEvent.mockResolvedValue(makeMembership({ role: "owner" }));

      await service.delete("evt-1", "user-1");

      expect(eventRepo.softDelete).toHaveBeenCalledWith("evt-1");
    });
  });

  describe("reactivate", () => {
    it("reactivates a recently deleted event", async () => {
      const deletedRecently = makeEvent({ deletedAt: new Date(Date.now() - 1000 * 60 * 60) });
      eventRepo.findById.mockResolvedValue(deletedRecently);
      membershipRepo.findByUserAndEvent.mockResolvedValue(makeMembership({ role: "owner" }));
      eventRepo.reactivate.mockResolvedValue(makeEvent({ deletedAt: null }));

      const result = await service.reactivate("evt-1", "user-1");

      expect(result.deletedAt).toBeNull();
    });

    it("throws when reactivation period has expired", async () => {
      const deletedLongAgo = makeEvent({
        deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 31),
      });
      eventRepo.findById.mockResolvedValue(deletedLongAgo);
      membershipRepo.findByUserAndEvent.mockResolvedValue(makeMembership({ role: "owner" }));

      await expect(service.reactivate("evt-1", "user-1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("getPublicInfo", () => {
    it("returns only public fields", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent());

      const result = await service.getPublicInfo("evt-1");

      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("date");
      expect(result).not.toHaveProperty("settings");
      expect(result).not.toHaveProperty("deletedAt");
    });
  });
});
