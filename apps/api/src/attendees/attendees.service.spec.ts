import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AttendeesService } from "./attendees.service";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";

function makeEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "evt-1",
    title: "Wedding",
    description: null,
    date: new Date(),
    endDate: null,
    location: null,
    timezone: "Europe/Stockholm",
    type: "wedding",
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

function makeAttendee(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "att-1",
    eventId: "evt-1",
    name: "Guest One",
    email: "guest@example.com",
    groupLabel: null,
    conversationStarters: null,
    description: null,
    status: "confirmed",
    tableId: null,
    seatId: null,
    qrToken: "qr-token-1",
    photoLimit: 10,
    checkedInAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("AttendeesService", () => {
  let service: AttendeesService;
  let attendeeRepo: Record<string, ReturnType<typeof vi.fn>>;
  let seatRepo: Record<string, ReturnType<typeof vi.fn>>;
  let eventRepo: Record<string, ReturnType<typeof vi.fn>>;
  let membershipRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
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

    seatRepo = {
      findById: vi.fn(),
      findByTableId: vi.fn(),
      findByEventId: vi.fn(),
      assignAttendee: vi.fn(),
      unassignAttendee: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    eventRepo = {
      findById: vi.fn().mockResolvedValue(makeEvent()),
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
      findByUserAndEvent: vi.fn().mockResolvedValue(makeMembership()),
      create: vi.fn(),
      remove: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AttendeesService,
        { provide: ATTENDEE_REPOSITORY, useValue: attendeeRepo },
        { provide: SEAT_REPOSITORY, useValue: seatRepo },
        { provide: EVENT_REPOSITORY, useValue: eventRepo },
        { provide: EVENT_MEMBERSHIP_REPOSITORY, useValue: membershipRepo },
      ],
    }).compile();

    service = module.get(AttendeesService);
  });

  describe("listForEvent", () => {
    it("returns attendees when user is a member", async () => {
      const attendees = [makeAttendee(), makeAttendee({ id: "att-2", name: "Guest Two" })];
      attendeeRepo.findByEventId.mockResolvedValue(attendees);

      const result = await service.listForEvent("evt-1", "user-1");

      expect(result).toHaveLength(2);
    });

    it("throws ForbiddenException when user is not a member", async () => {
      membershipRepo.findByUserAndEvent.mockResolvedValue(null);

      await expect(service.listForEvent("evt-1", "stranger")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("create", () => {
    it("creates an attendee with a generated qrToken", async () => {
      const newAttendee = makeAttendee();
      attendeeRepo.create.mockResolvedValue(newAttendee);

      const result = await service.create(
        "evt-1",
        { name: "Guest One", email: "guest@example.com" },
        "user-1",
      );

      expect(attendeeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: "evt-1",
          name: "Guest One",
          email: "guest@example.com",
          qrToken: expect.any(String),
        }),
      );
      expect(result.id).toBe("att-1");
    });

    it("throws ConflictException when email is duplicate for the event", async () => {
      attendeeRepo.findByEventAndEmail.mockResolvedValue(makeAttendee());

      await expect(
        service.create("evt-1", { name: "Dup", email: "guest@example.com" }, "user-1"),
      ).rejects.toThrow(ConflictException);
    });

    it("stores optional fields correctly", async () => {
      attendeeRepo.create.mockResolvedValue(makeAttendee());

      await service.create(
        "evt-1",
        {
          name: "Guest",
          email: "guest@test.com",
          groupLabel: "Table A",
          description: "VIP",
          conversationStarters: ["Hello", "Nice weather"],
          photoLimit: 5,
        },
        "user-1",
      );

      expect(attendeeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          groupLabel: "Table A",
          description: "VIP",
          conversationStarters: ["Hello", "Nice weather"],
          photoLimit: 5,
        }),
      );
    });

    it("enforces free trial attendee cap", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent({ isFreeTrial: true }));
      attendeeRepo.findByEventId.mockResolvedValue(
        Array.from({ length: 5 }, (_, i) => makeAttendee({ id: `att-${i}` })),
      );

      await expect(
        service.create("evt-1", { name: "One more" }, "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("createFromRsvp", () => {
    it("creates a pending attendee via RSVP", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent({ rsvpEnabled: true }));
      attendeeRepo.findByEventAndEmail.mockResolvedValue(null);
      attendeeRepo.create.mockResolvedValue(makeAttendee({ status: "pending" }));

      const result = await service.createFromRsvp("evt-1", {
        name: "Guest",
        email: "rsvp@example.com",
      });

      expect(attendeeRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending" }),
      );
      expect(result.status).toBe("pending");
    });

    it("throws ForbiddenException when RSVP is disabled", async () => {
      eventRepo.findById.mockResolvedValue(makeEvent({ rsvpEnabled: false }));

      await expect(
        service.createFromRsvp("evt-1", { name: "Guest", email: "rsvp@example.com" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("update", () => {
    it("updates attendee fields", async () => {
      attendeeRepo.findById.mockResolvedValue(makeAttendee());
      attendeeRepo.update.mockResolvedValue(makeAttendee({ name: "Updated Name" }));

      const result = await service.update("att-1", "evt-1", { name: "Updated Name" }, "user-1");

      expect(result.name).toBe("Updated Name");
    });

    it("throws NotFoundException when attendee does not belong to event", async () => {
      attendeeRepo.findById.mockResolvedValue(makeAttendee({ eventId: "other-event" }));

      await expect(
        service.update("att-1", "evt-1", { name: "X" }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("deletes the attendee", async () => {
      attendeeRepo.findById.mockResolvedValue(makeAttendee());

      await service.delete("att-1", "evt-1", "user-1");

      expect(attendeeRepo.delete).toHaveBeenCalledWith("att-1");
    });
  });

  describe("clearSeatAssignment", () => {
    it("unassigns seat and clears denormalized fields", async () => {
      attendeeRepo.findById.mockResolvedValue(makeAttendee({ seatId: "seat-1", tableId: "tbl-1" }));
      seatRepo.unassignAttendee.mockResolvedValue({});
      attendeeRepo.update.mockResolvedValue(makeAttendee({ seatId: null, tableId: null }));

      const result = await service.clearSeatAssignment("att-1", "evt-1", "user-1");

      expect(seatRepo.unassignAttendee).toHaveBeenCalledWith("seat-1");
      expect(attendeeRepo.update).toHaveBeenCalledWith("att-1", { tableId: null, seatId: null });
    });
  });

  describe("checkIn", () => {
    it("sets checkedInAt on the attendee found by qrToken", async () => {
      attendeeRepo.findByQrToken.mockResolvedValue(makeAttendee());
      attendeeRepo.update.mockResolvedValue(makeAttendee({ checkedInAt: new Date() }));

      const result = await service.checkIn("evt-1", "qr-token-1", "user-1");

      expect(attendeeRepo.update).toHaveBeenCalledWith(
        "att-1",
        expect.objectContaining({ checkedInAt: expect.any(Date) }),
      );
    });

    it("throws NotFoundException for invalid qrToken", async () => {
      attendeeRepo.findByQrToken.mockResolvedValue(null);

      await expect(service.checkIn("evt-1", "bad-token", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateStatus", () => {
    it("transitions pending attendee to confirmed", async () => {
      attendeeRepo.findById.mockResolvedValue(makeAttendee({ status: "pending" }));
      attendeeRepo.update.mockResolvedValue(makeAttendee({ status: "confirmed" }));

      const result = await service.updateStatus("att-1", "evt-1", "confirmed", "user-1");

      expect(result.status).toBe("confirmed");
    });

    it("throws BadRequestException when attendee is already confirmed", async () => {
      attendeeRepo.findById.mockResolvedValue(makeAttendee({ status: "confirmed" }));

      await expect(
        service.updateStatus("att-1", "evt-1", "confirmed", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("listPublic", () => {
    it("returns only confirmed attendees with limited fields", async () => {
      attendeeRepo.findByEventId.mockResolvedValue([
        makeAttendee({ status: "confirmed" }),
        makeAttendee({ id: "att-2", status: "pending" }),
      ]);

      const result = await service.listPublic("evt-1");

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty("email");
      expect(result[0]).not.toHaveProperty("qrToken");
    });
  });
});
