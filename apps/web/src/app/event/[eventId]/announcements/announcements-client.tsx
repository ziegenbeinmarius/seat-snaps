"use client";

import { Megaphone, Bell } from "lucide-react";
import { useAttendeeBroadcasts } from "@/lib/api/broadcasts";
import { useSocket } from "@/components/broadcast/socket-provider";
import type { BroadcastResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

function BroadcastCard({ broadcast }: { broadcast: BroadcastResponse }) {
  const createdAt = new Date(broadcast.createdAt);
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{broadcast.title}</p>
          <p className="mt-1 text-sm opacity-80">{broadcast.content}</p>
          <p className="mt-2 text-xs opacity-50">
            {createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
            {createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AnnouncementsClient({ eventId }: Props) {
  const { data: historicBroadcasts = [], isLoading } = useAttendeeBroadcasts(eventId);
  const { broadcasts: liveBroadcasts } = useSocket();

  const seen = new Set<string>();
  const allBroadcasts: BroadcastResponse[] = [];
  for (const b of [...liveBroadcasts, ...historicBroadcasts]) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      allBroadcasts.push(b);
    }
  }

  return (
    <div className="px-4 py-6 event-body">
      <h1 className="mb-4 text-lg font-semibold">Announcements</h1>

      {isLoading && (
        <p className="text-sm opacity-60">Loading…</p>
      )}

      {!isLoading && allBroadcasts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center opacity-50">
          <Bell className="h-8 w-8" />
          <p className="text-sm">No announcements yet</p>
        </div>
      )}

      <div className="space-y-3">
        {allBroadcasts.map((b) => (
          <BroadcastCard key={b.id} broadcast={b} />
        ))}
      </div>
    </div>
  );
}
