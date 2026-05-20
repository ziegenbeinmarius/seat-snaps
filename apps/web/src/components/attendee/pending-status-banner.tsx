"use client";

import { Clock } from "lucide-react";

interface Props {
  status: string;
}

export function PendingStatusBanner({ status }: Props) {
  if (status !== "pending") return null;

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm"
      style={{
        background: "rgba(196, 148, 90, 0.18)",
        borderBottom: "1px solid rgba(196, 148, 90, 0.3)",
        color: "hsl(28 35% 35%)",
      }}
    >
      <Clock className="h-4 w-4 shrink-0" style={{ color: "hsl(28 50% 50%)" }} />
      <p>
        <span className="font-semibold">Registration pending</span> — the organizer will confirm your spot shortly.
      </p>
    </div>
  );
}
