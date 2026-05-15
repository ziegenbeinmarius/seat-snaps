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
      <main
        className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
        style={{ background: "linear-gradient(160deg, #f5ede0 0%, #ede0cc 100%)" }}
      >
        <div className="dashboard-glass max-w-sm rounded-2xl px-8 py-10">
          <p className="mb-2 text-lg font-semibold" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}>
            Event Not Found
          </p>
          <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
            This event does not exist or is no longer available.
          </p>
        </div>
      </main>
    );
  }

  return <JoinEventClient eventId={eventId} attendees={attendees} eventTitle={event.title} />;
}
