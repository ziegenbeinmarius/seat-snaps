"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, QrCode, Camera, LogOut, Users, Calendar, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

export function OrganizerNav() {
  const pathname = usePathname();

  const eventMatch = pathname.match(/^\/organizer\/events\/([^/]+)/);
  const eventId = eventMatch?.[1];

  const eventBase = eventId ? `/organizer/events/${eventId}` : null;

  const links: { href: Route; icon: React.ElementType; label: string; active: boolean }[] = eventId && eventBase
    ? [
        {
          href: eventBase as Route,
          icon: Home,
          label: "Home",
          active: pathname === eventBase,
        },
        {
          href: `${eventBase}/attendees` as Route,
          icon: Users,
          label: "Attendees",
          active: pathname.includes("/attendees"),
        },
        {
          href: `${eventBase}/schedule` as Route,
          icon: Calendar,
          label: "Schedule",
          active: pathname.includes("/schedule"),
        },
        {
          href: `${eventBase}/photos` as Route,
          icon: Camera,
          label: "Photos",
          active: pathname.includes("/photos"),
        },
        {
          href: `${eventBase}/checkin` as Route,
          icon: QrCode,
          label: "Check-in",
          active: pathname.includes("/checkin"),
        },
      ]
    : [
        {
          href: "/organizer" as Route,
          icon: CalendarDays,
          label: "Events",
          active: true,
        },
        {
          href: "/logout" as Route,
          icon: LogOut,
          label: "Sign Out",
          active: false,
        },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(200,175,140,0.3)]"
      style={{
        background: "rgba(252, 248, 243, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="mx-auto flex max-w-lg">
        {links.map(({ href, icon: Icon, label, active }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              active ? "text-[hsl(28_65%_44%)]" : "text-[hsl(28_8%_55%)]",
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
