import {
  Injectable,
  Inject,
  NotFoundException,
  ServiceUnavailableException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import type { IPaymentRepository } from "../domain/repositories/IPaymentRepository";
import { PAYMENT_REPOSITORY } from "../domain/repositories/IPaymentRepository";
import type { IPricingTierRepository } from "../domain/repositories/IPricingTierRepository";
import { PRICING_TIER_REPOSITORY } from "../domain/repositories/IPricingTierRepository";
import { CreditsService } from "../credits/credits.service";
import type { IPaymentService } from "./domain/IPaymentService";
import type { PricingTierResponse, PaymentResponse } from "@seat-snaps/shared";

/**
 * PAYMENTS_MODE controls the payment flow:
 *   dummy    — fake flow (no real provider); rate-limited but functional for testing/demo
 *   disabled — endpoint returns 503; use when no payment provider is configured in prod
 *   stripe   — (future) Stripe Checkout integration
 */
type PaymentsMode = "dummy" | "disabled" | "stripe";

function getPaymentsMode(): PaymentsMode {
  const raw = (process.env["PAYMENTS_MODE"] ?? "dummy").toLowerCase();
  if (raw === "disabled" || raw === "stripe") return raw as PaymentsMode;
  return "dummy";
}

@Injectable()
export class PaymentsService implements IPaymentService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PRICING_TIER_REPOSITORY)
    private readonly tierRepository: IPricingTierRepository,
    private readonly creditsService: CreditsService,
  ) {}

  async listTiers(): Promise<PricingTierResponse[]> {
    const tiers = await this.tierRepository.findAllActive();
    return tiers.map((t) => ({
      id: t.id,
      name: t.name,
      eventCount: t.eventCount,
      priceSek: t.priceSek,
      currency: t.currency,
      active: t.active,
    }));
  }

  async checkout(tierId: string, userId: string): Promise<PaymentResponse> {
    const mode = getPaymentsMode();

    if (mode === "disabled") {
      throw new ServiceUnavailableException(
        "Payment processing is currently unavailable",
      );
    }

    if (mode === "stripe") {
      // TODO: implement Stripe Checkout session creation
      throw new ServiceUnavailableException(
        "Stripe payments not yet implemented",
      );
    }

    // mode === "dummy"
    const tier = await this.tierRepository.findById(tierId);
    if (!tier || !tier.active) {
      throw new NotFoundException("Pricing tier not found");
    }

    // Step 1: Create payment intent as "pending" — mirrors real provider flow
    // (with Stripe, this is where you'd create a PaymentIntent and return client_secret)
    const payment = await this.paymentRepository.create({
      userId,
      tierId: tier.id,
      amount: tier.priceSek,
      currency: tier.currency,
      status: "pending",
      creditsGranted: tier.eventCount,
      paymentProvider: "dummy",
      providerPaymentId: `dummy_${Date.now()}`,
    });

    this.logger.log(
      `[AUDIT] Payment intent created: id=${payment.id} userId=${userId} tierId=${tierId} amount=${tier.priceSek} ${tier.currency}`,
    );

    // Step 2: Confirm payment — for dummy mode this happens immediately.
    // With a real provider (e.g. Stripe) this step would be triggered by a webhook,
    // not by the user directly. The credits are only granted here, never in step 1.
    const confirmed = await this.confirmPayment(payment.id, userId);
    return confirmed;
  }

  /**
   * Confirms a pending payment and grants credits.
   * Idempotency: if the payment is already completed, returns the existing record without
   * re-granting credits. If the payment does not exist or belongs to a different user, throws.
   *
   * In a real Stripe integration this would be called from a webhook handler,
   * not exposed directly to the end user.
   */
  async confirmPayment(paymentId: string, userId: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment || payment.userId !== userId) {
      throw new NotFoundException("Payment not found");
    }

    // Idempotency guard: already confirmed — return without re-granting credits
    if (payment.status === "completed") {
      this.logger.warn(
        `[AUDIT] Duplicate confirm attempt ignored: id=${paymentId} userId=${userId}`,
      );
      return this.toResponse(payment);
    }

    if (payment.status !== "pending") {
      throw new InternalServerErrorException(
        `Payment ${paymentId} is in unexpected state: ${payment.status}`,
      );
    }

    // Transition: pending → completed, then grant credits
    const completed = await this.paymentRepository.updateStatus(paymentId, "completed");

    await this.creditsService.grantCredits(userId, payment.creditsGranted);

    this.logger.log(
      `[AUDIT] Payment confirmed: id=${paymentId} userId=${userId} creditsGranted=${payment.creditsGranted}`,
    );

    return this.toResponse(completed);
  }

  async listPayments(userId: string): Promise<PaymentResponse[]> {
    const payments = await this.paymentRepository.findByUserId(userId);
    return payments.map((p) => this.toResponse(p));
  }

  private toResponse(p: {
    id: string;
    userId: string;
    tierId: string;
    amount: number;
    currency: string;
    status: string;
    creditsGranted: number;
    paymentProvider: string | null;
    providerPaymentId: string | null;
    createdAt: Date;
  }): PaymentResponse {
    return {
      id: p.id,
      userId: p.userId,
      tierId: p.tierId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      creditsGranted: p.creditsGranted,
      paymentProvider: p.paymentProvider,
      providerPaymentId: p.providerPaymentId,
      createdAt: p.createdAt,
    };
  }
}
