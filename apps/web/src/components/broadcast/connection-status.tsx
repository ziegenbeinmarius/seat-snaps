"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./socket-provider";

// Only show the banner after being disconnected for 2 s to avoid flashing
// during page transitions that cause a brief socket re-mount.
export function ConnectionStatus() {
  const { connected } = useSocket();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (connected) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(id);
  }, [connected]);

  if (!show) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 py-1 text-xs" style={{ background: "rgba(0,0,0,0.08)" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span className="opacity-60">Reconnecting…</span>
    </div>
  );
}
