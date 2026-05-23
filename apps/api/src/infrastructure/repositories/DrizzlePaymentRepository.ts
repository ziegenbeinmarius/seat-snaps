import { eq } from "@seat-snaps/db";
import type { Database, Payment, NewPayment } from "@seat-snaps/db";
import { payments } from "@seat-snaps/db";
import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository";

export class DrizzlePaymentRepository implements IPaymentRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    return this.db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId));
  }

  async create(data: NewPayment): Promise<Payment> {
    const result = await this.db.insert(payments).values(data).returning();
    return result[0];
  }

  async updateStatus(id: string, status: Payment["status"]): Promise<Payment> {
    const result = await this.db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    if (!result[0]) throw new Error(`Payment ${id} not found`);
    return result[0];
  }
}
