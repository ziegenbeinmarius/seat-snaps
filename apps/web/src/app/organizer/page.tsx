import type { Metadata } from "next";
import { EventListPage } from "@/components/events/event-list-page";

export const metadata: Metadata = { title: "My Events — Organizer" };

export default async function OrganizerPage() {
  return <EventListPage variant="mobile" eventHrefPrefix="/organizer/events" />;
}
