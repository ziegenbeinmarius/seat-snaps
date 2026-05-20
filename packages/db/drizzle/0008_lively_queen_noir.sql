CREATE TYPE "public"."attendee_status" AS ENUM('confirmed', 'pending', 'declined');--> statement-breakpoint
ALTER TABLE "attendees" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "attendees" ADD COLUMN "status" "attendee_status" DEFAULT 'confirmed' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "rsvp_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "attendees" DROP COLUMN "relation_info";