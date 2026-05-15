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
    <div className="min-h-screen px-4 pb-6 pt-8">
      <h1 className="event-heading mb-6 px-2 text-2xl font-semibold text-white drop-shadow-sm">
        Schedule
      </h1>

      {items.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <Clock className="mb-3 h-10 w-10 text-white/30" />
          <p className="event-body text-white/50">No schedule yet</p>
        </div>
      )}

      <div className="space-y-1">
        {items.map((item, index) => {
          const active = isActive(item);
          const past = isPast(item);

          return (
            <div key={item.id} className="flex gap-3">
              {/* Timeline */}
              <div className="flex flex-col items-center pt-4">
                <div
                  className={`h-3 w-3 shrink-0 rounded-full border-2 ${
                    active
                      ? "border-white bg-white"
                      : past
                        ? "border-white/20 bg-white/20"
                        : "border-white/50 bg-transparent"
                  }`}
                />
                {index < items.length - 1 && (
                  <div className="w-0.5 flex-1 bg-white/15" />
                )}
              </div>

              {/* Card */}
              <div
                className={`mb-1 flex-1 rounded-2xl p-4 ${
                  active ? "glass-card" : past ? "bg-white/8 opacity-60" : "glass-card"
                }`}
                style={active ? { background: "rgba(255,255,255,0.22)" } : {}}
              >
                {active && (
                  <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    Happening now
                  </span>
                )}
                <div className={`event-heading font-semibold ${past ? "text-white/40" : "text-white"}`}>
                  {item.title}
                </div>
                <div className="event-body mt-0.5 text-xs text-white/55">
                  {formatTime(item.startTime)}
                  {item.endTime && ` – ${formatTime(item.endTime)}`}
                </div>
                {item.description && (
                  <p className="event-body mt-1.5 text-sm leading-relaxed text-white/70">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
