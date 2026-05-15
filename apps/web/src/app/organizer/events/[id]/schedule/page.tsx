import type { Metadata } from "next";
import { SchedulePanel } from "@/app/dashboard/events/[id]/schedule/schedule-panel";

export const metadata: Metadata = { title: "Schedule — Organizer" };

export default async function OrganizerSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SchedulePanel eventId={id} />;
}
