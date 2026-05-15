import type { Metadata } from "next";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { CalendarDays, MapPin } from "lucide-react";
import type { EventResponse } from "@seat-snaps/shared";
import { NewEventDialog } from "@/components/events/new-event-dialog";

export const metadata: Metadata = { title: "My Events — Organizer" };

const TYPE_GRADIENT: Record<string, string> = {
  wedding: "linear-gradient(135deg, #d4a8b4 0%, #b56b7e 100%)",
  birthday: "linear-gradient(135deg, #f8a44c 0%, #e8623a 100%)",
  corporate: "linear-gradient(135deg, #4a7fe0 0%, #2558c4 100%)",
  other: "linear-gradient(135deg, #c4a882 0%, #a07850 100%)",
};

const TYPE_LABEL: Record<string, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Event",
};

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
            <Link
              key={event.id}
              href={`/organizer/events/${event.id}`}
              className="block"
            >
              <div className="dashboard-glass overflow-hidden rounded-2xl">
                <div
                  className="h-1.5 w-full"
                  style={{ background: TYPE_GRADIENT[event.type] ?? TYPE_GRADIENT.other }}
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="text-lg font-semibold leading-tight"
                      style={{
                        fontFamily: "var(--font-cormorant, Georgia, serif)",
                        color: "hsl(24 12% 20%)",
                      }}
                    >
                      {event.title}
                    </h2>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        background: "rgba(200, 175, 140, 0.2)",
                        color: "hsl(28 40% 38%)",
                        border: "1px solid rgba(200, 175, 140, 0.4)",
                      }}
                    >
                      {TYPE_LABEL[event.type] ?? "Event"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(28 8% 52%)" }}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(28 8% 52%)" }}>
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
