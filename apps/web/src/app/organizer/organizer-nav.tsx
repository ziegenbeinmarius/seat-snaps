"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, QrCode, Camera, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

export function OrganizerNav() {
  const pathname = usePathname();

  const eventMatch = pathname.match(/^\/organizer\/events\/([^/]+)/);
  const eventId = eventMatch?.[1];

  const links: { href: Route; icon: React.ElementType; label: string; active: boolean; dim?: boolean }[] = [
    {
      href: "/organizer" as Route,
      icon: CalendarDays,
      label: "Events",
      active: !eventId || pathname === "/organizer",
    },
    {
      href: (eventId ? `/organizer/events/${eventId}/checkin` : "/organizer") as Route,
      icon: QrCode,
      label: "Check-In",
      active: !!eventId && pathname.includes("/checkin"),
      dim: !eventId,
    },
    {
      href: (eventId ? `/organizer/events/${eventId}/photos` : "/organizer") as Route,
      icon: Camera,
      label: "Photos",
      active: !!eventId && pathname.includes("/photos"),
      dim: !eventId,
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
      <div className="flex">
        {links.map(({ href, icon: Icon, label, active, dim }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              active
                ? "text-[hsl(28_65%_44%)]"
                : dim
                  ? "text-[rgba(120,95,70,0.3)]"
                  : "text-[hsl(28_8%_55%)]",
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
