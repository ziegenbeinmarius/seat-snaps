import { MapPin } from "lucide-react";
import { getCurrentAttendee } from "@/lib/attendee-session";
import type { TableResponse, AttendeeResponse } from "@seat-snaps/shared";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function SeatingPage({ params }: Props) {
  const { eventId } = await params;
  const attendee = await getCurrentAttendee();

  let tables: TableResponse[] = [];
  let attendeesMap: Map<string, string> = new Map();

  try {
    const [tablesRes, attendeesRes] = await Promise.all([
      fetch(`${API_URL}/api/events/${eventId}/tables/public`, { cache: "no-store" }),
      fetch(`${API_URL}/api/events/${eventId}/attendees/public`, { cache: "no-store" }),
    ]);
    if (tablesRes.ok) tables = (await tablesRes.json()) as TableResponse[];
    if (attendeesRes.ok) {
      const attendeesList = (await attendeesRes.json()) as AttendeeResponse[];
      attendeesMap = new Map(attendeesList.map((a) => [a.id, a.name]));
    }
  } catch {
    /* empty */
  }

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <div className="mb-6 px-2">
        <h1 className="event-heading text-2xl font-semibold text-white drop-shadow-sm">
          Seating Plan
        </h1>
        <p className="event-body mt-0.5 text-sm text-white/65">Your seat is highlighted</p>
      </div>

      {tables.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <MapPin className="mb-3 h-10 w-10 text-white/30" />
          <p className="event-body text-white/50">No seating plan yet</p>
        </div>
      )}

      <div className="space-y-3">
        {tables.map((table) => {
          const isMyTable = table.id === attendee?.tableId;

          return (
            <div
              key={table.id}
              className="glass-card rounded-2xl p-4"
              style={isMyTable ? { background: "rgba(255, 255, 255, 0.28)", border: "1.5px solid rgba(255,255,255,0.65)" } : {}}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="event-heading font-semibold text-white">
                  {table.name}
                  {isMyTable && (
                    <span className="ml-2 rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium">
                      Your table
                    </span>
                  )}
                </h3>
                {table.capacity && (
                  <span className="event-body text-xs text-white/50">{table.capacity} seats</span>
                )}
              </div>

              {table.seats && table.seats.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {table.seats.map((seat) => {
                    const isMySeat = seat.attendeeId === attendee?.id;
                    const occupantName = seat.attendeeId
                      ? attendeesMap.get(seat.attendeeId) ?? "Guest"
                      : null;

                    return (
                      <div
                        key={seat.id}
                        className={`rounded-xl p-3 text-center ${
                          isMySeat
                            ? "bg-white/30 ring-2 ring-white/60"
                            : seat.attendeeId
                              ? "bg-white/15"
                              : "border border-dashed border-white/20 bg-transparent"
                        }`}
                      >
                        {seat.label && (
                          <div className="event-body mb-0.5 text-xs font-medium text-white/55">
                            {seat.label}
                          </div>
                        )}
                        <div className={`event-heading text-sm font-medium ${isMySeat ? "text-white font-bold" : seat.attendeeId ? "text-white/85" : "text-white/25"}`}>
                          {isMySeat ? "You" : occupantName ?? "Empty"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
