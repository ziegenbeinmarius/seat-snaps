import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { TeamPanel } from "./team-panel";
import type { EventResponse, EventMember } from "@seat-snaps/shared";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event: EventResponse;
  let members: EventMember[];

  try {
    [event, members] = await Promise.all([
      apiRequest<EventResponse>(`/events/${id}`),
      apiRequest<EventMember[]>(`/events/${id}/members`),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-sm text-muted-foreground">Organiser team</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/events/${id}`}>← Event</Link>
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
          className="rounded-md px-3 py-1.5 text-sm font-medium bg-accent text-accent-foreground"
        >
          Team
        </Link>
      </nav>

      <TeamPanel eventId={id} initialMembers={members} />
    </div>
  );
}
