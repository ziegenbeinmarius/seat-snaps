"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, MapPin, Camera, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

interface Props {
  eventId: string;
}

export function AttendeeNav({ eventId }: Props) {
  const pathname = usePathname();
  const base = `/event/${eventId}`;

  const links: { href: Route; icon: React.ElementType; label: string }[] = [
    { href: base as Route, icon: Home, label: "Home" },
    { href: `${base}/schedule` as Route, icon: Calendar, label: "Schedule" },
    { href: `${base}/attendees` as Route, icon: Users, label: "Guests" },
    { href: `${base}/seating` as Route, icon: MapPin, label: "Seating" },
    { href: `${base}/photos` as Route, icon: Camera, label: "Photos" },
    { href: `${base}/profile` as Route, icon: UserRound, label: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t"
      style={{
        background: "var(--event-nav-bg, rgba(255, 248, 238, 0.92))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div className="mx-auto flex max-w-md">
        {links.map(({ href, icon: Icon, label }) => {
          const active = href === base ? pathname === base : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "event-body flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
              )}
              style={{
                color: active ? "var(--event-active-color, #a07850)" : "rgba(100, 80, 60, 0.45)",
              }}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
