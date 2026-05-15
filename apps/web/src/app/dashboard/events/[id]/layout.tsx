import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { EventResponse } from "@seat-snaps/shared";
import { EventNav } from "./event-nav";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

const TYPE_GRADIENT: Record<string, string> = {
  wedding: "linear-gradient(120deg, #d4a8b4 0%, #b56b7e 100%)",
  birthday: "linear-gradient(120deg, #f8a44c 0%, #e8623a 100%)",
  corporate: "linear-gradient(120deg, #4a7fe0 0%, #2558c4 100%)",
  other: "linear-gradient(120deg, #c4a882 0%, #a07850 100%)",
};

async function loadEvent(id: string) {
  try {
    return await apiRequest<EventResponse>(`/events/${id}`);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("unauthorized")) redirect("/login");
    if (message.includes("access denied") || message.includes("forbidden")) redirect("/dashboard");
    notFound();
  }
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { id } = await params;
  const event = await loadEvent(id);

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
    <div className="space-y-6">
      {/* Event hero strip */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{ background: TYPE_GRADIENT[event.type] ?? TYPE_GRADIENT.other }}
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
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="shrink-0 border border-white/30 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Events
            </Link>
          </Button>
        </div>
        {/* Subtle decorative circle */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-15"
          style={{ background: "white" }}
        />
      </div>

      <EventNav eventId={id} />

      {children}
    </div>
  );
}
