import type { Metadata } from "next";
import { SchedulePanel } from "./schedule-panel";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <SchedulePanel eventId={id} />;
}
