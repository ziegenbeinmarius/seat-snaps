import type { Metadata } from "next";
import { CheckinPanel } from "./checkin-panel";

export const metadata: Metadata = { title: "Check-In — Organizer" };

export default async function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckinPanel eventId={id} />;
}
