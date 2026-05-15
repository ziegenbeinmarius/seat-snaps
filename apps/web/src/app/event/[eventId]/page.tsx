import Link from "next/link";
import { MapPin, Calendar, Users, Camera } from "lucide-react";
import { getCurrentAttendee } from "@/lib/attendee-session";
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

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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

  const [event, scheduleItems, tables] = await Promise.all([
    fetchPublic<EventResponse>(`/events/${eventId}/info`),
    fetchPublic<ScheduleItemResponse[]>(`/events/${eventId}/schedule`),
    fetchPublic<TableResponse[]>(`/events/${eventId}/tables/public`),
  ]);

  const myTable = tables?.find((t) => t.id === attendee?.tableId);
  const mySeat = myTable?.seats?.find((s) => s.attendeeId === attendee?.id);
  const nearbyAttendees = myTable?.seats
    ?.filter((s) => s.attendeeId && s.attendeeId !== attendee?.id)
    .slice(0, 3);

  const currentItem = scheduleItems ? getCurrentScheduleItem(scheduleItems) : null;
  const nextItem = scheduleItems ? getNextScheduleItem(scheduleItems) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 pb-8 pt-10 text-white">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
            {EVENT_TYPE_LABEL[event?.type ?? "other"] ?? "Event"}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{event?.title ?? "Event"}</h1>
        {event?.date && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-100">
            <Calendar className="h-4 w-4" />
            {formatDate(event.date)}
          </p>
        )}
        {event?.location && (
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-blue-100">
            <MapPin className="h-4 w-4" />
            {event.location}
          </p>
        )}
        <p className="mt-3 text-lg font-medium">
          Welcome, {attendee?.name ?? "Guest"}!
        </p>
      </div>

      <div className="space-y-4 p-4">
        {/* Schedule highlight */}
        {(currentItem || nextItem) && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Schedule
            </h2>
            {currentItem && (
              <div className="mb-2 flex items-start gap-3 rounded-xl bg-blue-50 p-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <div>
                  <div className="text-xs font-medium text-blue-600">Now</div>
                  <div className="font-medium text-gray-900">{currentItem.title}</div>
                  <div className="text-xs text-gray-500">
                    {formatTime(currentItem.startTime)}
                    {currentItem.endTime && ` – ${formatTime(currentItem.endTime)}`}
                  </div>
                </div>
              </div>
            )}
            {nextItem && (
              <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                <div>
                  <div className="text-xs font-medium text-gray-500">Next</div>
                  <div className="font-medium text-gray-900">{nextItem.title}</div>
                  <div className="text-xs text-gray-500">{formatTime(nextItem.startTime)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Seat */}
        {myTable && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              My Seat
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{myTable.name}</div>
                {mySeat?.label && (
                  <div className="text-sm text-gray-500">Seat {mySeat.label}</div>
                )}
              </div>
            </div>
            {nearbyAttendees && nearbyAttendees.length > 0 && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="mb-1.5 text-xs text-gray-400">At your table</div>
                <div className="flex flex-wrap gap-1">
                  {nearbyAttendees.map((s) => (
                    <span
                      key={s.id}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                    >
                      {s.attendeeId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Explore
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href={`/event/${eventId}/schedule`}
              className="flex flex-col items-center gap-2 rounded-xl bg-blue-50 p-4 text-blue-700"
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs font-medium">Schedule</span>
            </Link>
            <Link
              href={`/event/${eventId}/attendees`}
              className="flex flex-col items-center gap-2 rounded-xl bg-purple-50 p-4 text-purple-700"
            >
              <Users className="h-6 w-6" />
              <span className="text-xs font-medium">Guests</span>
            </Link>
            <Link
              href={`/event/${eventId}/seating`}
              className="flex flex-col items-center gap-2 rounded-xl bg-green-50 p-4 text-green-700"
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs font-medium">Seating</span>
            </Link>
          </div>
        </div>

        {/* Event description */}
        {event?.description && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              About
            </h2>
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
