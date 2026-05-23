import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { SeatsService } from "./seats.service";

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

function makeSeat(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "seat-1",
    tableId: "tbl-1",
    eventId: "evt-1",
    label: "Seat 1",
    position: 1,
    attendeeId: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function makeAttendee(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "att-1",
    eventId: "evt-1",
    name: "Guest",
    email: null,
    groupLabel: null,
    conversationStarters: null,
    description: null,
    status: "confirmed",
    tableId: null,
    seatId: null,
    qrToken: "token",
    photoLimit: 10,
    checkedInAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("SeatsService", () => {
  let service: SeatsService;
  let seatRepo: Record<string, ReturnType<typeof vi.fn>>;
  let attendeeRepo: Record<string, ReturnType<typeof vi.fn>>;
  let eventRepo: Record<string, ReturnType<typeof vi.fn>>;
  let membershipRepo: Record<string, ReturnType<typeof vi.fn>>;
  let gateway: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
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

    eventRepo = {
      findById: vi.fn().mockResolvedValue(makeEvent()),
    };

    membershipRepo = {
      findByUserAndEvent: vi.fn().mockResolvedValue({
        id: "mem-1",
        userId: "user-1",
        eventId: "evt-1",
        role: "owner",
        status: "active",
        createdAt: new Date(),
      }),
    };

    gateway = {
      emitSeatingUpdate: vi.fn(),
    };

    service = new SeatsService(
      seatRepo as any,
      attendeeRepo as any,
      eventRepo as any,
      membershipRepo as any,
      gateway as any,
    );
  });

  describe("listForEvent", () => {
    it("returns all seats for the event", async () => {
      const seats = [makeSeat(), makeSeat({ id: "seat-2", position: 2 })];
      seatRepo.findByEventId.mockResolvedValue(seats);

      const result = await service.listForEvent("evt-1", "user-1");

      expect(result).toHaveLength(2);
    });

    it("throws ForbiddenException for non-members", async () => {
      membershipRepo.findByUserAndEvent.mockResolvedValue(null);

      await expect(service.listForEvent("evt-1", "stranger")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("assign", () => {
    it("assigns attendee to seat and updates denormalized fields", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat());
      attendeeRepo.findById.mockResolvedValue(makeAttendee());
      seatRepo.findByEventId.mockResolvedValue([makeSeat()]);
      seatRepo.assignAttendee.mockResolvedValue(makeSeat({ attendeeId: "att-1" }));
      attendeeRepo.update.mockResolvedValue(makeAttendee());

      const result = await service.assign("seat-1", "evt-1", "att-1", "user-1");

      expect(seatRepo.assignAttendee).toHaveBeenCalledWith("seat-1", "att-1");
      expect(attendeeRepo.update).toHaveBeenCalledWith("att-1", {
        seatId: "seat-1",
        tableId: "tbl-1",
      });
      expect(gateway.emitSeatingUpdate).toHaveBeenCalledWith("evt-1");
    });

    it("throws ConflictException when seat is already occupied", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat({ attendeeId: "other-att" }));

      await expect(
        service.assign("seat-1", "evt-1", "att-1", "user-1"),
      ).rejects.toThrow(ConflictException);
    });

    it("throws ConflictException when attendee already has a seat", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat());
      attendeeRepo.findById.mockResolvedValue(makeAttendee());
      seatRepo.findByEventId.mockResolvedValue([makeSeat({ id: "seat-2", attendeeId: "att-1" })]);

      await expect(
        service.assign("seat-1", "evt-1", "att-1", "user-1"),
      ).rejects.toThrow(ConflictException);
    });

    it("throws NotFoundException when seat belongs to a different event", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat({ eventId: "other-event" }));

      await expect(
        service.assign("seat-1", "evt-1", "att-1", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException when attendee belongs to a different event", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat());
      attendeeRepo.findById.mockResolvedValue(makeAttendee({ eventId: "other-event" }));

      await expect(
        service.assign("seat-1", "evt-1", "att-1", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("unassign", () => {
    it("removes attendee from seat and clears denormalized fields", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat({ attendeeId: "att-1" }));
      seatRepo.unassignAttendee.mockResolvedValue(makeSeat());
      attendeeRepo.update.mockResolvedValue(makeAttendee());

      await service.unassign("seat-1", "evt-1", "user-1");

      expect(seatRepo.unassignAttendee).toHaveBeenCalledWith("seat-1");
      expect(attendeeRepo.update).toHaveBeenCalledWith("att-1", {
        seatId: null,
        tableId: null,
      });
      expect(gateway.emitSeatingUpdate).toHaveBeenCalledWith("evt-1");
    });

    it("does not update attendee when seat was already empty", async () => {
      seatRepo.findById.mockResolvedValue(makeSeat({ attendeeId: null }));
      seatRepo.unassignAttendee.mockResolvedValue(makeSeat());

      await service.unassign("seat-1", "evt-1", "user-1");

      expect(attendeeRepo.update).not.toHaveBeenCalled();
    });
  });
});
