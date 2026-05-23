import type { CreditBalanceResponse } from "@seat-snaps/shared";

export interface ICreditsService {
  getBalance(userId: string): Promise<CreditBalanceResponse>;
  ensureCreditsExist(userId: string): Promise<void>;
  hasAvailableCredits(userId: string): Promise<boolean>;
  consumeCredit(userId: string): Promise<void>;
  grantFreeTrialIfEligible(userId: string): Promise<boolean>;
  grantCredits(userId: string, amount: number): Promise<void>;
}

export const CREDITS_SERVICE = Symbol("ICreditsService");
