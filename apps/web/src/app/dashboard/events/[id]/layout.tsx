import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    { href: base as Route, label: "Overview", isActive: (path) => path === base },
    { href: `${base}/team` as Route, label: "Team", isActive: (path) => path.startsWith(`${base}/team`) },
    { href: `${base}/attendees` as Route, label: "Attendees", isActive: (path) => path.startsWith(`${base}/attendees`) },
    { href: `${base}/seating` as Route, label: "Seating", isActive: (path) => path.startsWith(`${base}/seating`) },
    { href: `${base}/photos` as Route, label: "Photos", isActive: (path) => path.startsWith(`${base}/photos`) },
    { href: `${base}/theme` as Route, label: "Theme", isActive: (path) => path.startsWith(`${base}/theme`) },
    { href: `${base}/schedule` as Route, label: "Schedule", isActive: (path) => path.startsWith(`${base}/schedule`) },
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

      <EventTabNav links={links} variant="desktop" />

      {children}
    </div>
  );
}
