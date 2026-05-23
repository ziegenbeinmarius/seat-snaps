import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

function makeTier(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "tier-1",
    name: "Starter",
    eventCount: 2,
    priceSek: 499,
    currency: "SEK",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makePayment(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "pay-1",
    userId: "user-1",
    tierId: "tier-1",
    amount: 499,
    currency: "SEK",
    status: "pending",
    creditsGranted: 2,
    paymentProvider: "dummy",
    providerPaymentId: "dummy_123",
    createdAt: new Date(),
    ...overrides,
  };
}

describe("PaymentsService", () => {
  let service: PaymentsService;
  let paymentRepo: Record<string, ReturnType<typeof vi.fn>>;
  let tierRepo: Record<string, ReturnType<typeof vi.fn>>;
  let creditsService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.stubEnv("PAYMENTS_MODE", "dummy");

    paymentRepo = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
    };

    tierRepo = {
      findById: vi.fn(),
      findAllActive: vi.fn(),
    };

    creditsService = {
      grantCredits: vi.fn(),
      ensureCreditsExist: vi.fn(),
      hasAvailableCredits: vi.fn(),
      consumeCredit: vi.fn(),
      getBalance: vi.fn(),
      grantFreeTrialIfEligible: vi.fn(),
    };

    service = new PaymentsService(paymentRepo as any, tierRepo as any, creditsService as any);
  });

  describe("listTiers", () => {
    it("returns all active pricing tiers", async () => {
      const tiers = [makeTier(), makeTier({ id: "tier-2", name: "Pro", eventCount: 5, priceSek: 999 })];
      tierRepo.findAllActive.mockResolvedValue(tiers);

      const result = await service.listTiers();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Starter");
      expect(result[1].name).toBe("Pro");
    });
  });

  describe("checkout", () => {
    it("creates a pending payment and confirms it with credits", async () => {
      const tier = makeTier();
      tierRepo.findById.mockResolvedValue(tier);
      const pendingPayment = makePayment();
      paymentRepo.create.mockResolvedValue(pendingPayment);
      const completedPayment = makePayment({ status: "completed" });
      paymentRepo.findById.mockResolvedValue(pendingPayment);
      paymentRepo.updateStatus.mockResolvedValue(completedPayment);

      const result = await service.checkout("tier-1", "user-1");

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          tierId: "tier-1",
          amount: 499,
          status: "pending",
          creditsGranted: 2,
          paymentProvider: "dummy",
        }),
      );
      expect(creditsService.grantCredits).toHaveBeenCalledWith("user-1", 2);
      expect(result.status).toBe("completed");
    });

    it("throws NotFoundException when tier does not exist", async () => {
      tierRepo.findById.mockResolvedValue(null);

      await expect(service.checkout("bad-tier", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("throws NotFoundException when tier is inactive", async () => {
      tierRepo.findById.mockResolvedValue(makeTier({ active: false }));

      await expect(service.checkout("tier-1", "user-1")).rejects.toThrow(NotFoundException);
    });

    it("throws ServiceUnavailableException when payments are disabled", async () => {
      vi.stubEnv("PAYMENTS_MODE", "disabled");
      const svc = new PaymentsService(paymentRepo as any, tierRepo as any, creditsService as any);

      await expect(svc.checkout("tier-1", "user-1")).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe("confirmPayment", () => {
    it("is idempotent for already-completed payments", async () => {
      paymentRepo.findById.mockResolvedValue(makePayment({ status: "completed" }));

      const result = await service.confirmPayment("pay-1", "user-1");

      expect(result.status).toBe("completed");
      expect(creditsService.grantCredits).not.toHaveBeenCalled();
    });

    it("throws when payment belongs to a different user", async () => {
      paymentRepo.findById.mockResolvedValue(makePayment({ userId: "other-user" }));

      await expect(service.confirmPayment("pay-1", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("listPayments", () => {
    it("returns all payments for a user", async () => {
      const payments = [makePayment(), makePayment({ id: "pay-2", status: "completed" })];
      paymentRepo.findByUserId.mockResolvedValue(payments);

      const result = await service.listPayments("user-1");

      expect(result).toHaveLength(2);
    });
  });
});
