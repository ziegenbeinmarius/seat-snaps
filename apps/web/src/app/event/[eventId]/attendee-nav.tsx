"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
}

export function AttendeeNav({ eventId }: Props) {
  const pathname = usePathname();
  const base = `/event/${eventId}`;

  const links = [
    { href: base, icon: Home, label: "Home" },
    { href: `${base}/schedule`, icon: Calendar, label: "Schedule" },
    { href: `${base}/attendees`, icon: Users, label: "Guests" },
    { href: `${base}/seating`, icon: MapPin, label: "Seating" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <div className="flex">
        {links.map(({ href, icon: Icon, label }) => {
          const active = href === base ? pathname === base : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                active ? "text-blue-600" : "text-gray-400",
              )}
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
