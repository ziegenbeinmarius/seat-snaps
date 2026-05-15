import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EventResponse } from "@seat-snaps/shared";
import { EventNav } from "./event-nav";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

async function loadEvent(id: string) {
  try {
    return await apiRequest<EventResponse>(`/events/${id}`);
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
            <Badge variant="secondary" className="capitalize">
              {event.type}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {startDate} at {startTime}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Events
          </Link>
        </Button>
      </div>

      <EventNav eventId={id} />

      {children}
    </div>
  );
}
