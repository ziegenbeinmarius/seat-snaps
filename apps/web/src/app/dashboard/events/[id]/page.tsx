import type { Metadata } from "next";
import { EventOverviewPanel } from "./event-overview-panel";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventOverviewPanel eventId={id} />;
}
