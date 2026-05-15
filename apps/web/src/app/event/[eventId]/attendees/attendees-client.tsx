"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import type { AttendeeResponse } from "@seat-snaps/shared";

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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white px-6 py-4 shadow-sm">
        <h1 className="mb-3 text-xl font-bold text-gray-900">Guests</h1>
        <input
          type="text"
          placeholder="Search by name or table..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="p-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-gray-400">No guests found</p>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map((attendee) => (
            <div key={attendee.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{attendee.name}</div>
                  {attendee.groupLabel && (
                    <div className="mt-0.5 text-sm text-gray-500">{attendee.groupLabel}</div>
                  )}
                  {attendee.relationInfo && (
                    <div className="mt-0.5 text-xs text-gray-400">{attendee.relationInfo}</div>
                  )}
                </div>
                {attendee.tableId && (
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    Table
                  </span>
                )}
              </div>
              {attendee.conversationStarters && attendee.conversationStarters.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="mb-1.5 text-xs font-medium text-gray-400">
                    Conversation starters
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {attendee.conversationStarters.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
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
    </div>
  );
}
