import type { ReactNode } from "react";
import type { EventResponse } from "@seat-snaps/shared";
import { getTypeGradient } from "@/lib/event-helpers";

interface EventHeroStripProps {
  event: EventResponse;
  backButton: ReactNode;
  action?: ReactNode;
  variant?: "desktop" | "mobile";
}

export function EventHeroStrip({ event, backButton, action, variant = "desktop" }: EventHeroStripProps) {
  const background = getTypeGradient(event.type, "banner");

  if (variant === "mobile") {
    return (
      <div
        className="relative overflow-hidden px-4 pb-4 pt-5 text-white"
        style={{ background }}
      >
        <div className="mb-3 flex items-center gap-3">
          {backButton}
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-xl font-semibold"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}
            >
              {event.title}
            </h1>
            <p className="text-xs opacity-80">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
              {event.location ? ` · ${event.location}` : ""}
            </p>
          </div>
          {action}
        </div>
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15"
          style={{ background: "white" }}
        />
      </div>
    );
  }

  const startDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = new Date(event.date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white"
      style={{ background }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", fontSize: "1.85rem" }}
          >
            {event.title}
          </h1>
          <p className="mt-1 text-sm opacity-85">
            {startDate} at {startTime}
          </p>
        </div>
        {backButton}
      </div>
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-15"
        style={{ background: "white" }}
      />
    </div>
  );
}
