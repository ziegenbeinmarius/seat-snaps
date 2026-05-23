import type { Metadata } from "next";
import { SchedulePanel } from "@/app/dashboard/events/[id]/schedule/schedule-panel";
import { loadEvent } from "@/lib/load-event";

export const metadata: Metadata = { title: "Schedule — Organizer" };

export default async function OrganizerSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id, "/organizer");
  return <SchedulePanel eventId={id} eventDate={event.date} />;
}
