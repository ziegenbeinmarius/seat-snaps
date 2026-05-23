import { pgTable, uuid, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { pricingTiers } from "./pricing-tiers.js";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tierId: uuid("tier_id")
    .notNull()
    .references(() => pricingTiers.id, { onDelete: "restrict" }),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("SEK"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  creditsGranted: integer("credits_granted").notNull(),
  paymentProvider: text("payment_provider"),
  providerPaymentId: text("provider_payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
