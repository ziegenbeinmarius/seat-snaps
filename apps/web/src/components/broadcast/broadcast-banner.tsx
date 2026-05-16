"use client";

import { X, Megaphone } from "lucide-react";
import { useSocket } from "./socket-provider";

export function BroadcastBanner() {
  const { latestBroadcast, bannerVisible, dismissBanner } = useSocket();

  if (!bannerVisible || !latestBroadcast) return null;

  return (
    <div
      className="relative flex items-start gap-3 px-4 py-3 text-sm"
      style={{ background: "var(--event-primary, #a07850)", color: "white" }}
    >
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{latestBroadcast.title}</p>
        <p className="text-white/90">{latestBroadcast.content}</p>
      </div>
      <button
        onClick={dismissBanner}
        className="shrink-0 rounded p-0.5 hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
