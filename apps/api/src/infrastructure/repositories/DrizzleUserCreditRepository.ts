import { eq, sql } from "@seat-snaps/db";
import type { Database, UserCredit, NewUserCredit } from "@seat-snaps/db";
import { userCredits } from "@seat-snaps/db";
import type { IUserCreditRepository } from "../../domain/repositories/IUserCreditRepository";

export class DrizzleUserCreditRepository implements IUserCreditRepository {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<UserCredit | null> {
    const result = await this.db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewUserCredit): Promise<UserCredit> {
    const result = await this.db.insert(userCredits).values(data).returning();
    return result[0];
  }

  async incrementCredits(userId: string, amount: number): Promise<UserCredit> {
    const result = await this.db
      .update(userCredits)
      .set({
        totalCredits: sql`${userCredits.totalCredits} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))
      .returning();
    if (!result[0]) throw new Error(`UserCredit for user ${userId} not found`);
    return result[0];
  }

  async consumeCredit(userId: string): Promise<UserCredit> {
    const result = await this.db
      .update(userCredits)
      .set({
        usedCredits: sql`${userCredits.usedCredits} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userCredits.userId, userId))
      .returning();
    if (!result[0]) throw new Error(`UserCredit for user ${userId} not found`);
    return result[0];
  }

  async consumeCreditAtomically(userId: string): Promise<boolean> {
    const result = await this.db
      .update(userCredits)
      .set({
        usedCredits: sql`${userCredits.usedCredits} + 1`,
        updatedAt: new Date(),
      })
      .where(
        sql`${userCredits.userId} = ${userId} AND ${userCredits.totalCredits} > ${userCredits.usedCredits}`,
      )
      .returning();
    return result.length > 0;
  }

  async markFreeTrialUsed(userId: string): Promise<UserCredit> {
    const result = await this.db
      .update(userCredits)
      .set({ freeTrialUsed: true, updatedAt: new Date() })
      .where(eq(userCredits.userId, userId))
      .returning();
    if (!result[0]) throw new Error(`UserCredit for user ${userId} not found`);
    return result[0];
  }
}
