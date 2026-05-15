import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { EventResponse } from "@seat-snaps/shared";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event: EventResponse;
  try {
    event = await apiRequest<EventResponse>(`/events/${id}`);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";

    if (message.includes("unauthorized")) {
      redirect("/login");
    }

    if (message.includes("access denied") || message.includes("forbidden")) {
      redirect("/dashboard");
    }

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
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground w-20 shrink-0 font-medium">Date</span>
              <span>{startDate}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground w-20 shrink-0 font-medium">Time</span>
              <span>{startTime}</span>
            </div>
            {event.location && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">Location</span>
                <span>{event.location}</span>
              </div>
            )}
            {event.endDate && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">Ends</span>
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
              <p className="text-muted-foreground text-sm">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
