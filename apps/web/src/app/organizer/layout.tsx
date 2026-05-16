import React from "react";
import { requireAuth } from "@/lib/require-auth";
import { APP_BACKGROUND } from "@/lib/event-helpers";
import { OrganizerNav } from "./organizer-nav";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div
      className="min-h-screen"
      style={{ background: APP_BACKGROUND }}
    >
      <main className="mx-auto max-w-md pb-20">{children}</main>
      <OrganizerNav />
    </div>
  );
}
