import { CalendarDays } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";
import { NewEventDialog } from "@/components/events/new-event-dialog";
import { EventCard } from "@/components/events/event-card";

interface EventListPageProps {
  variant: "desktop" | "mobile";
  eventHrefPrefix: string;
}

async function fetchEvents(): Promise<EventResponse[]> {
  try {
    return await apiRequest<EventResponse[]>("/events");
  } catch {
    return [];
  }
}

function DesktopHeader() {
  return (
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
  );
}

function MobileHeader() {
  return (
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
  );
}

function EmptyState({ variant }: { variant: "desktop" | "mobile" }) {
  return (
    <div className="dashboard-glass rounded-2xl px-6 py-16 text-center">
      {variant === "mobile" && (
        <CalendarDays className="mx-auto mb-4 h-10 w-10 opacity-30" />
      )}
      <p
        className={variant === "desktop" ? "mb-4 text-base" : "mb-4 text-sm"}
        style={{ color: "hsl(28 8% 50%)" }}
      >
        No events yet. Create your first event to get started.
      </p>
      {variant === "desktop" ? (
        <NewEventDialog />
      ) : (
        <NewEventDialog
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
          style={{ background: "hsl(28 65% 44%)" }}
        />
      )}
    </div>
  );
}

function EventGrid({
  events,
  hrefPrefix,
  variant,
}: {
  events: EventResponse[];
  hrefPrefix: string;
  variant: "desktop" | "mobile";
}) {
  const cardVariant = variant === "desktop" ? "grid" : "list";
  const wrapperClass =
    variant === "desktop"
      ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      : "space-y-3";

  return (
    <div className={wrapperClass}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          href={`${hrefPrefix}/${event.id}`}
          variant={cardVariant}
        />
      ))}
    </div>
  );
}

export async function EventListPage({ variant, eventHrefPrefix }: EventListPageProps) {
  const events = await fetchEvents();
  const isDesktop = variant === "desktop";

  return (
    <div className={isDesktop ? "space-y-8" : "px-4 py-6"}>
      {isDesktop ? <DesktopHeader /> : <MobileHeader />}

      {events.length === 0 ? (
        <EmptyState variant={variant} />
      ) : (
        <EventGrid events={events} hrefPrefix={eventHrefPrefix} variant={variant} />
      )}
    </div>
  );
}
