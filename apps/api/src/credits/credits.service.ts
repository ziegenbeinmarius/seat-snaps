import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import type { IUserCreditRepository } from "../domain/repositories/IUserCreditRepository";
import { USER_CREDIT_REPOSITORY } from "../domain/repositories/IUserCreditRepository";
import type { ICreditsService } from "./domain/ICreditsService";
import type { CreditBalanceResponse } from "@seat-snaps/shared";

@Injectable()
export class CreditsService implements ICreditsService {
  constructor(
    @Inject(USER_CREDIT_REPOSITORY)
    private readonly creditRepository: IUserCreditRepository,
  ) {}

  async getBalance(userId: string): Promise<CreditBalanceResponse> {
    await this.ensureCreditsExist(userId);
    const credit = (await this.creditRepository.findByUserId(userId))!;
    return {
      id: credit.id,
      userId: credit.userId,
      totalCredits: credit.totalCredits,
      usedCredits: credit.usedCredits,
      availableCredits: credit.totalCredits - credit.usedCredits,
      freeTrialUsed: credit.freeTrialUsed,
      createdAt: credit.createdAt,
      updatedAt: credit.updatedAt,
    };
  }

  async ensureCreditsExist(userId: string): Promise<void> {
    const existing = await this.creditRepository.findByUserId(userId);
    if (!existing) {
      await this.creditRepository.create({ userId });
    }
  }

  async hasAvailableCredits(userId: string): Promise<boolean> {
    await this.ensureCreditsExist(userId);
    const credit = (await this.creditRepository.findByUserId(userId))!;
    return credit.totalCredits - credit.usedCredits > 0;
  }

  async consumeCredit(userId: string): Promise<void> {
    const credit = await this.creditRepository.findByUserId(userId);
    if (!credit || credit.totalCredits - credit.usedCredits <= 0) {
      throw new BadRequestException("No available event credits");
    }
    await this.creditRepository.consumeCredit(userId);
  }

  async grantFreeTrialIfEligible(userId: string): Promise<boolean> {
    await this.ensureCreditsExist(userId);
    const credit = (await this.creditRepository.findByUserId(userId))!;
    if (credit.freeTrialUsed) return false;

    await this.creditRepository.incrementCredits(userId, 1);
    await this.creditRepository.markFreeTrialUsed(userId);
    return true;
  }

  async grantCredits(userId: string, amount: number): Promise<void> {
    await this.ensureCreditsExist(userId);
    await this.creditRepository.incrementCredits(userId, amount);
  }
}
