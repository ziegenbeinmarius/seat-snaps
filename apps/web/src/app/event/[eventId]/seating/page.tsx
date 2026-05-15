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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Seating Plan</h1>
        <p className="mt-0.5 text-sm text-gray-500">Your seat is highlighted in blue</p>
      </div>

      <div className="p-4">
        {tables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-400">No seating plan yet</p>
          </div>
        )}

        <div className="space-y-4">
          {tables.map((table) => {
            const isMyTable = table.id === attendee?.tableId;

            return (
              <div
                key={table.id}
                className={`rounded-2xl p-4 shadow-sm ${
                  isMyTable ? "border-2 border-blue-400 bg-blue-50" : "bg-white"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className={`font-bold ${isMyTable ? "text-blue-900" : "text-gray-900"}`}>
                    {table.name}
                    {isMyTable && (
                      <span className="ml-2 text-sm font-normal text-blue-600">← Your table</span>
                    )}
                  </h3>
                  {table.capacity && (
                    <span className="text-xs text-gray-400">{table.capacity} seats</span>
                  )}
                </div>

                {table.seats && table.seats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {table.seats.map((seat) => {
                      const isMySeats = seat.attendeeId === attendee?.id;
                      const occupantName = seat.attendeeId
                        ? attendeesMap.get(seat.attendeeId) ?? "Guest"
                        : null;

                      return (
                        <div
                          key={seat.id}
                          className={`rounded-xl p-3 text-center ${
                            isMySeats
                              ? "bg-blue-600 text-white"
                              : seat.attendeeId
                                ? "bg-gray-100 text-gray-700"
                                : "border border-dashed border-gray-200 bg-white text-gray-300"
                          }`}
                        >
                          {seat.label && (
                            <div className="text-xs font-medium opacity-70">
                              {seat.label}
                            </div>
                          )}
                          <div className={`text-sm font-medium ${isMySeats ? "text-white" : ""}`}>
                            {isMySeats ? "You" : occupantName ?? "Empty"}
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
    </div>
  );
}
