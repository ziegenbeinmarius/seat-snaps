"use client";

import type { Route } from "next";
import { SettingsDropdown } from "@/components/settings-dropdown";

interface Props {
  name: string;
  eventId: string;
}

export function AttendeeHeader({ name, eventId }: Props) {
  const profileHref = `/event/${eventId}/profile` as Route;

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-4 py-2"
      style={{
        background: "var(--event-nav-bg, rgba(255, 248, 238, 0.92))",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <span
        className="text-sm font-semibold truncate"
        style={{ color: "var(--event-active-color, #a07850)" }}
      >
        {name}
      </span>
      <SettingsDropdown
        userName={name}
        showProfile
        profileHref={profileHref}
        showSignOut={false}
        compact
      />
    </header>
  );
}
