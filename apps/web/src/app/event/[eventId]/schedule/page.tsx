import { Clock } from "lucide-react";
import type { ScheduleItemResponse } from "@seat-snaps/shared";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function isActive(item: ScheduleItemResponse) {
  const now = new Date();
  return new Date(item.startTime) <= now && (!item.endTime || new Date(item.endTime) >= now);
}

function isPast(item: ScheduleItemResponse) {
  if (!item.endTime) return false;
  return new Date(item.endTime) < new Date();
}

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function SchedulePage({ params }: Props) {
  const { eventId } = await params;

  let items: ScheduleItemResponse[] = [];
  try {
    const res = await fetch(`${API_URL}/api/events/${eventId}/schedule`, { cache: "no-store" });
    if (res.ok) items = (await res.json()) as ScheduleItemResponse[];
  } catch {
    /* empty */
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Schedule</h1>
      </div>

      <div className="p-4">
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-400">No schedule yet</p>
          </div>
        )}

        <div className="space-y-1">
          {items.map((item, index) => {
            const active = isActive(item);
            const past = isPast(item);

            return (
              <div key={item.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`mt-4 h-3 w-3 shrink-0 rounded-full border-2 ${
                      active
                        ? "border-blue-500 bg-blue-500"
                        : past
                          ? "border-gray-300 bg-gray-300"
                          : "border-gray-300 bg-white"
                    }`}
                  />
                  {index < items.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200" />
                  )}
                </div>

                {/* Content */}
                <div
                  className={`mb-1 flex-1 rounded-2xl p-4 ${
                    active ? "bg-blue-50" : "bg-white"
                  } shadow-sm`}
                >
                  {active && (
                    <span className="mb-1 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Happening now
                    </span>
                  )}
                  <div
                    className={`font-semibold ${active ? "text-blue-900" : past ? "text-gray-400" : "text-gray-900"}`}
                  >
                    {item.title}
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">
                    {formatTime(item.startTime)}
                    {item.endTime && ` – ${formatTime(item.endTime)}`}
                  </div>
                  {item.description && (
                    <p className="mt-1.5 text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
