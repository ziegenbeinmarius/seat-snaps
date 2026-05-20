"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { MobilePageHeading } from "@/components/mobile/mobile-page-heading";

interface Props {
  attendees: AttendeeResponse[];
}

export function AttendeesClient({ attendees }: Props) {
  const [search, setSearch] = useState("");

  const filtered = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.groupLabel && a.groupLabel.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <MobilePageHeading className="px-2">Guests</MobilePageHeading>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <Users className="h-4 w-4 shrink-0 event-card-muted-text" />
        <input
          type="text"
          placeholder="Search by name or table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="event-body flex-1 bg-transparent text-sm outline-none event-card-title placeholder:event-card-muted-text"
          style={{ color: "var(--event-card-text)" }}
        />
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm">
          <Users className="mb-3 h-10 w-10 event-card-muted-text" />
          <p className="event-body event-card-muted-text">No guests found</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((a) => (
          <div key={a.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="event-heading font-semibold event-card-title">{a.name}</div>
                {a.groupLabel && (
                  <div className="event-body mt-0.5 text-sm event-card-desc">{a.groupLabel}</div>
                )}
                {a.description && (
                  <div className="event-body mt-0.5 text-xs event-card-muted-text">
                    {a.description}
                  </div>
                )}
              </div>
              {a.tableId && (
                <span
                  className="event-body rounded-xl px-2.5 py-1 text-xs font-medium"
                  style={{
                    background: "var(--event-card-chip-bg)",
                    color: "var(--event-primary)",
                  }}
                >
                  Seated
                </span>
              )}
            </div>
            {a.conversationStarters && a.conversationStarters.length > 0 && (
              <div
                className="mt-3 border-t pt-3"
                style={{ borderColor: "var(--event-card-divider)" }}
              >
                <div className="event-body mb-1.5 text-xs event-card-muted-text">
                  Conversation starters
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.conversationStarters.map((s, i) => (
                    <span
                      key={i}
                      className="event-body rounded-full px-2.5 py-0.5 text-xs event-card-desc"
                      style={{ background: "var(--event-card-chip-bg)" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
