import React from "react";
import { requireAuth } from "@/lib/require-auth";
import { OrganizerNav } from "./organizer-nav";

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)",
      }}
    >
      <main className="pb-20">{children}</main>
      <OrganizerNav />
    </div>
  );
}
