import { describe, it, expect, beforeEach, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CreditsService } from "./credits.service";
import { USER_CREDIT_REPOSITORY } from "../domain/repositories/IUserCreditRepository";

function makeCredit(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "credit-1",
    userId: "user-1",
    totalCredits: 5,
    usedCredits: 1,
    freeTrialUsed: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

describe("CreditsService", () => {
  let service: CreditsService;
  let creditRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    creditRepo = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      incrementCredits: vi.fn(),
      consumeCredit: vi.fn(),
      consumeCreditAtomically: vi.fn(),
      markFreeTrialUsed: vi.fn(),
      grantTrialAtomically: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CreditsService,
        { provide: USER_CREDIT_REPOSITORY, useValue: creditRepo },
      ],
    }).compile();

    service = module.get(CreditsService);
  });

  describe("getBalance", () => {
    it("returns balance with computed availableCredits", async () => {
      const credit = makeCredit({ totalCredits: 10, usedCredits: 3 });
      creditRepo.findByUserId.mockResolvedValue(credit);

      const result = await service.getBalance("user-1");

      expect(result.availableCredits).toBe(7);
      expect(result.totalCredits).toBe(10);
      expect(result.usedCredits).toBe(3);
    });

    it("creates credit record if none exists", async () => {
      creditRepo.findByUserId
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(makeCredit({ totalCredits: 0, usedCredits: 0 }));
      creditRepo.create.mockResolvedValue(undefined);

      const result = await service.getBalance("user-1");

      expect(creditRepo.create).toHaveBeenCalledWith({ userId: "user-1" });
      expect(result.availableCredits).toBe(0);
    });
  });

  describe("hasAvailableCredits", () => {
    it("returns true when credits are available", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit({ totalCredits: 5, usedCredits: 2 }));

      expect(await service.hasAvailableCredits("user-1")).toBe(true);
    });

    it("returns false when all credits are used", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit({ totalCredits: 5, usedCredits: 5 }));

      expect(await service.hasAvailableCredits("user-1")).toBe(false);
    });
  });

  describe("consumeCredit", () => {
    it("calls consumeCreditAtomically", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit());
      creditRepo.consumeCreditAtomically.mockResolvedValue(true);

      await service.consumeCredit("user-1");

      expect(creditRepo.consumeCreditAtomically).toHaveBeenCalledWith("user-1");
    });

    it("throws when no credits available", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit());
      creditRepo.consumeCreditAtomically.mockResolvedValue(false);

      await expect(service.consumeCredit("user-1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("grantCredits", () => {
    it("increments credits by given amount", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit());
      creditRepo.incrementCredits.mockResolvedValue(makeCredit({ totalCredits: 15 }));

      await service.grantCredits("user-1", 10);

      expect(creditRepo.incrementCredits).toHaveBeenCalledWith("user-1", 10);
    });

    it("throws for zero amount", async () => {
      await expect(service.grantCredits("user-1", 0)).rejects.toThrow(BadRequestException);
    });

    it("throws for negative amount", async () => {
      await expect(service.grantCredits("user-1", -5)).rejects.toThrow(BadRequestException);
    });

    it("throws for non-integer amount", async () => {
      await expect(service.grantCredits("user-1", 2.5)).rejects.toThrow(BadRequestException);
    });
  });

  describe("grantFreeTrialIfEligible", () => {
    it("delegates to repository atomically", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit());
      creditRepo.grantTrialAtomically.mockResolvedValue(true);

      const result = await service.grantFreeTrialIfEligible("user-1");

      expect(result).toBe(true);
      expect(creditRepo.grantTrialAtomically).toHaveBeenCalledWith("user-1");
    });

    it("returns false when trial already used", async () => {
      creditRepo.findByUserId.mockResolvedValue(makeCredit({ freeTrialUsed: true }));
      creditRepo.grantTrialAtomically.mockResolvedValue(false);

      expect(await service.grantFreeTrialIfEligible("user-1")).toBe(false);
    });
  });
});
