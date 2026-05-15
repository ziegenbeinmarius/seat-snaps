import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";
import { NewEventDialog } from "@/components/events/new-event-dialog";
import { EventCard } from "@/components/events/event-card";

export const metadata: Metadata = { title: "My Events — Organizer" };

export default async function OrganizerPage() {
  let events: EventResponse[] = [];
  try {
    events = await apiRequest<EventResponse[]>("/events");
  } catch {
    events = [];
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          My Events
        </h1>
        <NewEventDialog
          iconOnly
          className="flex h-10 w-10 items-center justify-center rounded-full shadow-md"
          style={{ background: "hsl(28 65% 44%)", color: "white" }}
        />
      </div>

      {events.length === 0 ? (
        <div className="dashboard-glass rounded-2xl px-6 py-16 text-center">
          <CalendarDays className="mx-auto mb-4 h-10 w-10 opacity-30" />
          <p className="mb-4 text-sm" style={{ color: "hsl(28 8% 50%)" }}>
            No events yet. Create your first event to get started.
          </p>
          <NewEventDialog
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "hsl(28 65% 44%)" }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              href={`/organizer/events/${event.id}`}
              variant="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
