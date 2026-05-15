import type { Metadata } from "next";
import { EventDashboardPanel } from "./event-dashboard-panel";

export const metadata: Metadata = { title: "Event — Organizer" };

export default async function OrganizerEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDashboardPanel eventId={id} />;
}
