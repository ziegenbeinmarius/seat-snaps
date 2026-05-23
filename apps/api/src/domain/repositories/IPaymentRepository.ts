import type { Payment, NewPayment } from "@seat-snaps/db";

export interface IPaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByUserId(userId: string): Promise<Payment[]>;
  create(data: NewPayment): Promise<Payment>;
  updateStatus(id: string, status: Payment["status"]): Promise<Payment>;
}

export const PAYMENT_REPOSITORY = Symbol("IPaymentRepository");
