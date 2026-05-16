ALTER TABLE "users" ADD COLUMN "token_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "attendee_sessions_token_idx" ON "attendee_sessions" USING btree ("token");