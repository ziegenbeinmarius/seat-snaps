import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { EventHeroStrip } from "@/components/events/event-hero-strip";
import { EventTabNav, type TabLink } from "@/components/events/event-tab-nav";
import { loadEvent } from "@/lib/load-event";

interface Props {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function OrganizerEventLayout({ children, params }: Props) {
  const { id } = await params;
  const event = await loadEvent(id, "/organizer");
  const base = `/organizer/events/${id}`;

  const links: TabLink[] = [
    { href: base as Route, label: "Overview", isActive: (path) => path === base },
    { href: `${base}/checkin` as Route, label: "Check-In", isActive: (path) => path.startsWith(`${base}/checkin`) },
    { href: `${base}/photos` as Route, label: "Photos", isActive: (path) => path.startsWith(`${base}/photos`) },
    { href: `${base}/schedule` as Route, label: "Schedule", isActive: (path) => path.startsWith(`${base}/schedule`) },
  ];

  return (
    <div>
      <EventHeroStrip
        event={event}
        variant="mobile"
        backButton={
          <Link
            href="/organizer"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
        action={
          <Link
            href="/logout"
            className="flex h-8 w-8 items-center justify-center rounded-full opacity-70 hover:opacity-100"
            style={{ background: "rgba(255,255,255,0.2)" }}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        }
      />

      <EventTabNav links={links} variant="mobile" />

      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
