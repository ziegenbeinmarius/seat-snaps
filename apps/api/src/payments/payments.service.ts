import {
  Injectable,
  Inject,
  NotFoundException,
} from "@nestjs/common";
import type { IPaymentRepository } from "../domain/repositories/IPaymentRepository";
import { PAYMENT_REPOSITORY } from "../domain/repositories/IPaymentRepository";
import type { IPricingTierRepository } from "../domain/repositories/IPricingTierRepository";
import { PRICING_TIER_REPOSITORY } from "../domain/repositories/IPricingTierRepository";
import { CreditsService } from "../credits/credits.service";
import type { IPaymentService } from "./domain/IPaymentService";
import type { PricingTierResponse, PaymentResponse } from "@seat-snaps/shared";

@Injectable()
export class PaymentsService implements IPaymentService {
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
    const tier = await this.tierRepository.findById(tierId);
    if (!tier || !tier.active) {
      throw new NotFoundException("Pricing tier not found");
    }

    // Dummy payment: immediately complete and grant credits
    const payment = await this.paymentRepository.create({
      userId,
      tierId: tier.id,
      amount: tier.priceSek,
      currency: tier.currency,
      status: "completed",
      creditsGranted: tier.eventCount,
      paymentProvider: "dummy",
      providerPaymentId: `dummy_${Date.now()}`,
    });

    await this.creditsService.grantCredits(userId, tier.eventCount);

    return {
      id: payment.id,
      userId: payment.userId,
      tierId: payment.tierId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      creditsGranted: payment.creditsGranted,
      paymentProvider: payment.paymentProvider,
      providerPaymentId: payment.providerPaymentId,
      createdAt: payment.createdAt,
    };
  }

  async listPayments(userId: string): Promise<PaymentResponse[]> {
    const payments = await this.paymentRepository.findByUserId(userId);
    return payments.map((p) => ({
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
    }));
  }
}
