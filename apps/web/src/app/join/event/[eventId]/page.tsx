import type { AttendeeResponse, EventResponse } from "@seat-snaps/shared";
import { JoinEventClient } from "./join-event-client";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Request failed");
  return res.json() as Promise<T>;
}

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function JoinEventPage({ params }: Props) {
  const { eventId } = await params;

  let event: EventResponse;
  let attendees: AttendeeResponse[];

  try {
    [event, attendees] = await Promise.all([
      fetchPublic<EventResponse>(`/events/${eventId}/info`),
      fetchPublic<AttendeeResponse[]>(`/events/${eventId}/attendees/public`),
    ]);
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Event Not Found</h1>
          <p className="text-gray-500">This event does not exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <JoinEventClient
      eventId={eventId}
      attendees={attendees}
      eventTitle={event.title}
    />
  );
}
