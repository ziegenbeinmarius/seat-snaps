"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface EventNavProps {
  eventId: string;
}

export function EventNav({ eventId }: EventNavProps) {
  const pathname = usePathname();
  const base = `/dashboard/events/${eventId}`;

  const links: { href: Route; label: string; isActive: (path: string) => boolean }[] = [
    { href: base as Route, label: "Overview", isActive: (path) => path === base },
    {
      href: `${base}/team` as Route,
      label: "Team",
      isActive: (path) => path.startsWith(`${base}/team`),
    },
    {
      href: `${base}/attendees` as Route,
      label: "Attendees",
      isActive: (path) => path.startsWith(`${base}/attendees`),
    },
    {
      href: `${base}/seating` as Route,
      label: "Seating",
      isActive: (path) => path.startsWith(`${base}/seating`),
    },
    {
      href: `${base}/photos` as Route,
      label: "Photos",
      isActive: (path) => path.startsWith(`${base}/photos`),
    },
  ];

  return (
    <nav className="border-border -mx-1 overflow-x-auto border-b pb-2">
      <div className="flex min-w-max gap-2 px-1">
        {links.map(({ href, label, isActive }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive(pathname)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
