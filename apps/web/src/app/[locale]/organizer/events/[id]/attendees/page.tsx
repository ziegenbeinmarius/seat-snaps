import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { OrganizerAttendeesPanel } from "./organizer-attendees-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizerAttendeesPage({ params }: Props) {
  const { id } = await params;

  let attendees: AttendeeResponse[];
  try {
    attendees = await apiRequest<AttendeeResponse[]>(`/events/${id}/attendees`);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("unauthorized")) redirect("/login");
    if (message.includes("access denied") || message.includes("forbidden")) redirect("/organizer");
    notFound();
  }

  return <OrganizerAttendeesPanel eventId={id} initialAttendees={attendees} />;
}
