import type { UserCredit, NewUserCredit } from "@seat-snaps/db";

export interface IUserCreditRepository {
  findByUserId(userId: string): Promise<UserCredit | null>;
  create(data: NewUserCredit): Promise<UserCredit>;
  incrementCredits(userId: string, amount: number): Promise<UserCredit>;
  consumeCredit(userId: string): Promise<UserCredit>;
  markFreeTrialUsed(userId: string): Promise<UserCredit>;
}

export const USER_CREDIT_REPOSITORY = Symbol("IUserCreditRepository");
