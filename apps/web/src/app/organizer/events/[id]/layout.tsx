import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";
import { OrganizerEventNav } from "./organizer-event-nav";

interface Props {
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
    if (message.includes("access denied") || message.includes("forbidden")) redirect("/organizer");
    notFound();
  }
}

export default async function OrganizerEventLayout({ children, params }: Props) {
  const { id } = await params;
  const event = await loadEvent(id);

  return (
    <div>
      {/* Event header */}
      <div
        className="relative overflow-hidden px-4 pb-4 pt-5 text-white"
        style={{ background: TYPE_GRADIENT[event.type] ?? TYPE_GRADIENT.other }}
      >
        <div className="mb-3 flex items-center gap-3">
          <Link
            href="/organizer"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
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
        </div>
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15"
          style={{ background: "white" }}
        />
      </div>

      <OrganizerEventNav eventId={id} />

      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
