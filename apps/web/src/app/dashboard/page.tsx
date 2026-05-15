import type { Metadata } from "next";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";
import { NewEventDialog } from "@/components/events/new-event-dialog";
import { EventCard } from "@/components/events/event-card";

export const metadata: Metadata = { title: "My Events" };

export default async function DashboardPage() {
  let events: EventResponse[] = [];
  try {
    events = await apiRequest<EventResponse[]>("/events");
  } catch {
    events = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
          >
            My Events
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 50%)" }}>
            Events you own or help organise
          </p>
        </div>
        <NewEventDialog />
      </div>

      {events.length === 0 ? (
        <div className="dashboard-glass rounded-2xl px-6 py-16 text-center">
          <p className="mb-4 text-base" style={{ color: "hsl(28 8% 50%)" }}>
            No events yet. Create your first event to get started.
          </p>
          <NewEventDialog />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              href={`/dashboard/events/${event.id}`}
              variant="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
