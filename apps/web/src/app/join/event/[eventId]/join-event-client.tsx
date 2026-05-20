"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { useCreateAttendeeSession } from "@/lib/api/attendee-session";
import { RsvpForm } from "./rsvp-form";

interface Props {
  eventId: string;
  attendees: AttendeeResponse[];
  eventTitle: string;
  rsvpEnabled: boolean;
}

export function JoinEventClient({ eventId, attendees, eventTitle, rsvpEnabled }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [showRsvp, setShowRsvp] = useState(false);
  const router = useRouter();
  const createSession = useCreateAttendeeSession();

  const filtered = attendees.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleJoin() {
    if (!selected) return;
    try {
      const result = await createSession.mutateAsync({ attendeeId: selected, eventId });
      router.refresh();
      router.push(`/event/${result.eventId}`);
    } catch {
      /* handled by mutation error state */
    }
  }

  if (showRsvp) {
    return (
      <RsvpForm
        eventId={eventId}
        eventTitle={eventTitle}
        onBack={() => setShowRsvp(false)}
      />
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)" }}
    >
      {/* Hero */}
      <div
        className="px-6 py-10"
        style={{
          background: "rgba(250, 244, 234, 0.6)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(200, 175, 140, 0.3)",
        }}
      >
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "hsl(28 50% 50%)" }}
        >
          You&apos;re invited
        </p>
        <h1
          className="text-3xl font-semibold"
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            color: "hsl(24 12% 20%)",
          }}
        >
          {eventTitle}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          Find your name below to get started
        </p>
      </div>

      <div className="flex-1 p-6">
        <div
          className="dashboard-glass mb-4 flex items-center rounded-2xl px-4 py-3"
        >
          <input
            type="text"
            placeholder="Search your name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "hsl(24 12% 22%)" }}
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: "hsl(28 8% 60%)" }}>
              No attendees found
            </p>
          )}
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={
                selected === a.id
                  ? {
                      background: "rgba(196, 148, 90, 0.18)",
                      border: "1.5px solid rgba(196, 148, 90, 0.5)",
                    }
                  : {
                      background: "rgba(255, 252, 247, 0.65)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(200, 175, 140, 0.35)",
                    }
              }
            >
              <div
                className="font-medium"
                style={{
                  fontFamily: "var(--font-cormorant, Georgia, serif)",
                  fontSize: "1.05rem",
                  color: "hsl(24 12% 20%)",
                }}
              >
                {a.name}
              </div>
              {a.groupLabel && (
                <div className="mt-0.5 text-xs" style={{ color: "hsl(28 8% 55%)" }}>
                  {a.groupLabel}
                </div>
              )}
            </button>
          ))}
        </div>

        {rsvpEnabled && (
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
              Not on the list yet?
            </p>
            <button
              onClick={() => setShowRsvp(true)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(255, 252, 247, 0.75)",
                border: "1.5px solid rgba(196, 148, 90, 0.5)",
                color: "hsl(28 45% 40%)",
              }}
            >
              Register as new attendee →
            </button>
          </div>
        )}
      </div>

      <div
        className="sticky bottom-0 p-6"
        style={{
          background: "rgba(250, 244, 234, 0.88)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(200, 175, 140, 0.3)",
        }}
      >
        {createSession.error && (
          <p className="mb-3 text-center text-sm text-destructive">{createSession.error.message}</p>
        )}
        <button
          onClick={handleJoin}
          disabled={!selected || createSession.isPending}
          className="w-full rounded-2xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #c4955a 0%, #a07850 100%)" }}
        >
          {createSession.isPending ? "Joining…" : "Join Event →"}
        </button>
      </div>
    </div>
  );
}
