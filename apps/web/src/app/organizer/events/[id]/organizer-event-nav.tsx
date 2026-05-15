"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Route } from "next";

interface Props {
  eventId: string;
}

export function OrganizerEventNav({ eventId }: Props) {
  const pathname = usePathname();
  const base = `/organizer/events/${eventId}`;

  const links: { href: Route; label: string }[] = [
    { href: base as Route, label: "Overview" },
    { href: `${base}/checkin` as Route, label: "Check-In" },
    { href: `${base}/photos` as Route, label: "Photos" },
    { href: `${base}/schedule` as Route, label: "Schedule" },
  ];

  return (
    <nav
      className="sticky top-0 z-40 overflow-x-auto border-b border-[rgba(200,175,140,0.3)]"
      style={{ background: "rgba(252, 248, 243, 0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex min-w-max px-4">
        {links.map(({ href, label }) => {
          const active = href === base ? pathname === base : pathname.startsWith(href as string);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-[hsl(28_65%_44%)] text-[hsl(28_65%_44%)]"
                  : "border-transparent text-[hsl(28_8%_52%)] hover:text-[hsl(28_8%_35%)]",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
