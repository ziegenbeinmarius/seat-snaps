"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Home, Calendar, Users, MapPin, Camera, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";
import { useTranslations } from "next-intl";

interface Props {
  eventId: string;
  hasSeating?: boolean;
}

export function AttendeeNav({ eventId, hasSeating = true }: Props) {
  const t = useTranslations("attendeeApp.nav");
  const pathname = usePathname();
  const base = `/event/${eventId}`;

  const links: { href: Route; icon: React.ElementType; label: string }[] = [
    { href: base as Route, icon: Home, label: t("home") },
    { href: `${base}/schedule` as Route, icon: Calendar, label: t("schedule") },
    { href: `${base}/attendees` as Route, icon: Users, label: t("guests") },
    ...(hasSeating
      ? [{ href: `${base}/seating` as Route, icon: MapPin, label: t("seating") }]
      : []),
    { href: `${base}/photos` as Route, icon: Camera, label: t("photos") },
    { href: `${base}/announcements` as Route, icon: Megaphone, label: t("news") },
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
      <div className="mx-auto flex max-w-lg">
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
