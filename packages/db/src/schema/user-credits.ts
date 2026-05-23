import { pgTable, uuid, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const userCredits = pgTable("user_credits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  totalCredits: integer("total_credits").notNull().default(0),
  usedCredits: integer("used_credits").notNull().default(0),
  freeTrialUsed: boolean("free_trial_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserCredit = typeof userCredits.$inferSelect;
export type NewUserCredit = typeof userCredits.$inferInsert;
