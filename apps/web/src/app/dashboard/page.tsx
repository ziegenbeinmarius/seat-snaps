import type { Metadata } from "next";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";
import { NewEventDialog } from "@/components/events/new-event-dialog";

export const metadata: Metadata = { title: "My Events" };

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

export default async function DashboardPage() {
  let events: EventResponse[] = [];
  try {
    events = await apiRequest<EventResponse[]>("/events");
  } catch {
    events = [];
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
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
            <Link key={event.id} href={`/dashboard/events/${event.id}`} className="group block">
              <div className="dashboard-glass overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                {/* Color strip */}
                <div
                  className="h-1.5 w-full"
                  style={{ background: TYPE_GRADIENT[event.type] ?? TYPE_GRADIENT.other }}
                />
                <div className="p-5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h2
                      className="line-clamp-2 text-lg font-semibold leading-tight"
                      style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
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
                  <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {event.location && (
                    <p className="mt-1.5 text-xs" style={{ color: "hsl(28 8% 60%)" }}>
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
