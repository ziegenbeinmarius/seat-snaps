import type { Metadata } from "next";
import { SchedulePanel } from "./schedule-panel";
import { loadEvent } from "@/lib/load-event";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id, "/dashboard");

  return <SchedulePanel eventId={id} eventDate={event.date} eventTimezone={event.timezone} />;
}
