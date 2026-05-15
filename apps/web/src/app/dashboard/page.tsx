import type { Metadata } from "next";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventResponse } from "@seat-snaps/shared";

export const metadata: Metadata = { title: "My Events" };

export default async function DashboardPage() {
  let events: EventResponse[] = [];
  try {
    events = await apiRequest<EventResponse[]>("/events");
  } catch {
    events = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
          <p className="text-sm text-muted-foreground">Events you own or help organise</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">New Event</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No events yet.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/events/new">Create your first event</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">{event.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {event.type}
                    </Badge>
                  </div>
                  <CardDescription>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                {event.location && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
