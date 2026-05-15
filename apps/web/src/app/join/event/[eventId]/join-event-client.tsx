"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { useCreateAttendeeSession } from "@/lib/api/attendee-session";

interface Props {
  eventId: string;
  attendees: AttendeeResponse[];
  eventTitle: string;
}

export function JoinEventClient({ eventId, attendees, eventTitle }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const createSession = useCreateAttendeeSession();

  const filtered = attendees.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleJoin() {
    if (!selected) return;
    try {
      const result = await createSession.mutateAsync({
        attendeeId: selected,
        eventId,
      });
      document.cookie = `attendee-session=${result.token}; path=/; max-age=${90 * 24 * 60 * 60}; samesite=lax${window.location.protocol === "https:" ? "; secure" : ""}`;
      router.push(`/event/${eventId}`);
    } catch {
      /* handled by mutation error state */
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="bg-blue-600 px-6 py-10 text-white">
        <h1 className="text-2xl font-bold">{eventTitle}</h1>
        <p className="mt-1 text-blue-100">Find your name to join</p>
      </div>

      <div className="flex-1 p-6">
        <input
          type="text"
          placeholder="Search your name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-gray-400">No attendees found</p>
          )}
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                selected === a.id
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-100 bg-gray-50 text-gray-900 hover:border-blue-200"
              }`}
            >
              <div className="font-medium">{a.name}</div>
              {a.groupLabel && (
                <div className="mt-0.5 text-sm text-gray-500">{a.groupLabel}</div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-100 bg-white p-6">
        {createSession.error && (
          <p className="mb-3 text-center text-sm text-red-500">{createSession.error.message}</p>
        )}
        <button
          onClick={handleJoin}
          disabled={!selected || createSession.isPending}
          className="w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {createSession.isPending ? "Joining..." : "Join Event"}
        </button>
      </div>
    </div>
  );
}
