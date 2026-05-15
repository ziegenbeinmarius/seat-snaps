import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendeesPanel } from "./attendees-panel";
import type { EventResponse } from "@seat-snaps/shared";

export const metadata: Metadata = { title: "Attendees" };

export default async function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event: EventResponse;
  try {
    event = await apiRequest<EventResponse>(`/events/${id}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
            <Badge variant="secondary" className="capitalize">{event.type}</Badge>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/events/${id}`}>← Back</Link>
        </Button>
      </div>

      <nav className="flex gap-2 border-b border-border pb-2">
        <Link
          href={`/dashboard/events/${id}`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Overview
        </Link>
        <Link
          href={`/dashboard/events/${id}/team`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Team
        </Link>
        <Link
          href={`/dashboard/events/${id}/attendees`}
          className="rounded-md px-3 py-1.5 text-sm font-medium bg-accent text-accent-foreground"
        >
          Attendees
        </Link>
        <Link
          href={`/dashboard/events/${id}/seating`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Seating
        </Link>
      </nav>

      <AttendeesPanel eventId={id} />
    </div>
  );
}
