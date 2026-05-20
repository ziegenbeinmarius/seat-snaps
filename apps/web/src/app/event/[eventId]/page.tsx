import { MapPin, Calendar } from "lucide-react";
import { getCurrentAttendee } from "@/lib/attendee-session";
import { HighlightSlideshow } from "./highlights/highlight-slideshow";
import type { EventResponse, ScheduleItemResponse, TableResponse } from "@seat-snaps/shared";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

async function fetchPublic<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Event",
};

function formatDate(d: Date | string, timeZone?: string | null) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  });
}

function formatTime(d: Date | string, timeZone?: string | null) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

function getCurrentScheduleItem(items: ScheduleItemResponse[]) {
  const now = new Date();
  return items.find(
    (item) =>
      new Date(item.startTime) <= now && (!item.endTime || new Date(item.endTime) >= now),
  );
}

function getNextScheduleItem(items: ScheduleItemResponse[]) {
  const now = new Date();
  return items.find((item) => new Date(item.startTime) > now);
}

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function AttendeeHomePage({ params }: Props) {
  const { eventId } = await params;
  const attendee = await getCurrentAttendee();

  const [event, scheduleItems, tables, attendeesList] = await Promise.all([
    fetchPublic<EventResponse>(`/events/${eventId}/info`),
    fetchPublic<ScheduleItemResponse[]>(`/events/${eventId}/schedule`),
    fetchPublic<TableResponse[]>(`/events/${eventId}/tables/public`),
    fetchPublic<Array<{ id: string; name: string }>>(`/events/${eventId}/attendees/public`),
  ]);

  const attendeesMap = new Map((attendeesList ?? []).map((a) => [a.id, a.name]));

  const myTable = tables?.find((t) => t.id === attendee?.tableId);
  const mySeat = myTable?.seats?.find((s) => s.attendeeId === attendee?.id);
  const nearbyAttendees = myTable?.seats
    ?.filter((s) => s.attendeeId && s.attendeeId !== attendee?.id)
    .slice(0, 3);

  const currentItem = scheduleItems ? getCurrentScheduleItem(scheduleItems) : null;
  const nextItem = scheduleItems ? getNextScheduleItem(scheduleItems) : null;

  return (
    <div className="min-h-screen px-4 pb-6 pt-10">
      {/* Hero header — sits directly on the gradient, white text is correct here */}
      <div className="mb-6 px-2 text-white">
        <div className="mb-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {EVENT_TYPE_LABEL[event?.type ?? "other"] ?? "Event"}
          </span>
        </div>
        <h1 className="event-heading text-3xl font-semibold leading-tight text-white drop-shadow-sm">
          {event?.title ?? "Event"}
        </h1>
        {event?.date && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/80">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(event.date, event.timezone)}
          </p>
        )}
        {event?.location && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/70">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </p>
        )}
        <p className="event-body mt-4 text-lg font-medium text-white">
          Welcome, {attendee?.name ?? "Guest"}!
        </p>
      </div>

      <div className="space-y-3">
        {/* Schedule highlight */}
        {(currentItem || nextItem) && (
          <div className="glass-card rounded-2xl p-4">
            <h2
              className="event-body mb-3 text-xs font-semibold uppercase tracking-widest event-card-muted-text"
            >
              Schedule
            </h2>
            {currentItem && (
              <div
                className="mb-2 flex items-start gap-3 rounded-xl p-3"
                style={{ background: "var(--event-card-chip-bg)" }}
              >
                <div
                  className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full"
                  style={{ background: "var(--event-primary)" }}
                />
                <div>
                  <div
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--event-primary)" }}
                  >
                    Happening now
                  </div>
                  <div className="event-heading mt-0.5 font-semibold event-card-title">
                    {currentItem.title}
                  </div>
                  <div className="event-body text-xs event-card-muted-text">
                    {formatTime(currentItem.startTime, event?.timezone)}
                    {currentItem.endTime && ` – ${formatTime(currentItem.endTime, event?.timezone)}`}
                  </div>
                </div>
              </div>
            )}
            {nextItem && (
              <div
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                <div
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "var(--event-card-muted)" }}
                />
                <div>
                  <div className="text-xs font-medium event-card-muted-text">Up next</div>
                  <div className="event-heading font-medium event-card-title">{nextItem.title}</div>
                  <div className="event-body text-xs event-card-muted-text">
                    {formatTime(nextItem.startTime, event?.timezone)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Seat */}
        {event?.hasSeating && myTable && (
          <div className="glass-card rounded-2xl p-4">
            <h2 className="event-body mb-3 text-xs font-semibold uppercase tracking-widest event-card-muted-text">
              My Seat
            </h2>
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: "var(--event-card-chip-bg)" }}
              >
                <MapPin className="h-6 w-6" style={{ color: "var(--event-primary)" }} />
              </div>
              <div>
                <div className="event-heading text-xl font-semibold event-card-title">
                  {myTable.name}
                </div>
                {mySeat?.label && (
                  <div className="event-body text-sm event-card-desc">Seat {mySeat.label}</div>
                )}
              </div>
            </div>
            {nearbyAttendees && nearbyAttendees.length > 0 && (
              <div
                className="mt-3 border-t pt-3"
                style={{ borderColor: "var(--event-card-divider)" }}
              >
                <div className="event-body mb-1.5 text-xs event-card-muted-text">
                  Also at your table
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {nearbyAttendees.map((s) => (
                    <span
                      key={s.id}
                      className="event-body rounded-full px-2.5 py-0.5 text-xs event-card-desc"
                      style={{ background: "var(--event-card-chip-bg)" }}
                    >
                      {attendeesMap.get(s.attendeeId ?? "") ?? "Guest"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Event description */}
        {event?.description && (
          <div className="glass-card rounded-2xl p-4">
            <h2 className="event-body mb-2 text-xs font-semibold uppercase tracking-widest event-card-muted-text">
              About
            </h2>
            <p className="event-body text-sm leading-relaxed event-card-desc">{event.description}</p>
          </div>
        )}

        {/* Highlight slideshow */}
        <HighlightSlideshow eventId={eventId} />
      </div>
    </div>
  );
}
