"use client";

import { Link } from "@/i18n/navigation";
import { UserRound } from "lucide-react";
import type { Route } from "next";
import { LanguageSwitcher } from "@/components/language-switcher";

interface Props {
  name: string;
  eventId: string;
}

export function AttendeeHeader({ name, eventId }: Props) {
  const profileHref = `/event/${eventId}/profile` as Route;

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2"
      style={{
        background: "var(--event-nav-bg, rgba(255, 248, 238, 0.92))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <Link
        href={profileHref}
        className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-70 transition-opacity"
        style={{ color: "var(--event-active-color, #a07850)" }}
      >
        <UserRound className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium truncate">{name}</span>
      </Link>
      <LanguageSwitcher />
    </header>
  );
}
