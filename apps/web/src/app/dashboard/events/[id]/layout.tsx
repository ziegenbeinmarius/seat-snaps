import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventHeroStrip } from "@/components/events/event-hero-strip";
import { EventTabNav, type TabLink } from "@/components/events/event-tab-nav";
import { loadEvent } from "@/lib/load-event";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { id } = await params;
  const event = await loadEvent(id, "/dashboard");
  const base = `/dashboard/events/${id}`;

  const links: TabLink[] = [
    { href: base as Route, label: "Overview", exact: true },
    { href: `${base}/team` as Route, label: "Team" },
    { href: `${base}/attendees` as Route, label: "Attendees" },
    { href: `${base}/seating` as Route, label: "Seating" },
    { href: `${base}/photos` as Route, label: "Photos" },
    { href: `${base}/theme` as Route, label: "Theme" },
    { href: `${base}/schedule` as Route, label: "Schedule" },
    { href: `${base}/broadcasts` as Route, label: "Broadcasts" },
  ];

  return (
    <div className="space-y-6">
      <EventHeroStrip
        event={event}
        variant="desktop"
        backButton={
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
        }
      />

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={`/organizer/events/${id}` as Route}>
            <ExternalLink className="h-3.5 w-3.5" />
            Organizer View
          </Link>
        </Button>
      </div>

      <EventTabNav links={links} variant="desktop" />

      {children}
    </div>
  );
}
