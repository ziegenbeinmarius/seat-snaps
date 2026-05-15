import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventResponse } from "@seat-snaps/shared";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event: EventResponse;
  try {
    event = await apiRequest<EventResponse>(`/events/${id}`);
  } catch {
    notFound();
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
            <Badge variant="secondary" className="capitalize">{event.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {startDate} at {startTime}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">← Back</Link>
        </Button>
      </div>

      <nav className="flex gap-2 border-b border-border pb-2">
        <Link
          href={`/dashboard/events/${id}`}
          className="rounded-md px-3 py-1.5 text-sm font-medium bg-accent text-accent-foreground"
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
          className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-20 shrink-0">Date</span>
              <span>{startDate}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-20 shrink-0">Time</span>
              <span>{startTime}</span>
            </div>
            {event.location && (
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-20 shrink-0">Location</span>
                <span>{event.location}</span>
              </div>
            )}
            {event.endDate && (
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-20 shrink-0">Ends</span>
                <span>
                  {new Date(event.endDate).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {event.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href={`/dashboard/events/${id}/team`}>Manage Team</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/events/${id}/attendees`}>Manage Attendees</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/dashboard/events/${id}/seating`}>Seating Plan</Link>
        </Button>
      </div>
    </div>
  );
}
