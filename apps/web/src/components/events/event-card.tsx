import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import type { EventResponse } from "@seat-snaps/shared";
import { getTypeGradient, getTypeLabel } from "@/lib/event-helpers";

interface EventCardProps {
  event: EventResponse;
  href: string;
  variant?: "grid" | "list";
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: "rgba(200, 175, 140, 0.2)",
        color: "hsl(28 40% 38%)",
        border: "1px solid rgba(200, 175, 140, 0.4)",
      }}
    >
      {getTypeLabel(type)}
    </span>
  );
}

function GridCard({ event, href }: Omit<EventCardProps, "variant">) {
  return (
    <Link href={href as Route} className="group block">
      <div className="dashboard-glass overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
        <div
          className="h-1.5 w-full"
          style={{ background: getTypeGradient(event.type) }}
        />
        <div className="p-5">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h2
              className="line-clamp-2 text-lg font-semibold leading-tight"
              style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
            >
              {event.title}
            </h2>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <TypeBadge type={event.type} />
              {event.isFinished && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Finished
                </span>
              )}
            </div>
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
  );
}

function ListCard({ event, href }: Omit<EventCardProps, "variant">) {
  return (
    <Link href={href as Route} className="block">
      <div className="dashboard-glass overflow-hidden rounded-2xl">
        <div
          className="h-1.5 w-full"
          style={{ background: getTypeGradient(event.type) }}
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
            <div className="flex shrink-0 flex-col items-end gap-1">
              <TypeBadge type={event.type} />
              {event.isFinished && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Finished
                </span>
              )}
            </div>
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
  );
}

export function EventCard({ event, href, variant = "grid" }: EventCardProps) {
  if (variant === "list") return <ListCard event={event} href={href} />;
  return <GridCard event={event} href={href} />;
}
