"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { useSubscribeToPush } from "@/lib/api/push-subscriptions";

interface Props {
  eventId: string;
}

type DismissState = "dismissed" | null;

const STORAGE_KEY = "push-permission-dismissed";

export function PushPermissionPrompt({ eventId }: Props) {
  const [visible, setVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { mutate: subscribe, isPending } = useSubscribeToPush(eventId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") {
      setSubscribed(true);
      return;
    }
    if (Notification.permission === "denied") return;

    const dismissed = localStorage.getItem(STORAGE_KEY) as DismissState;
    if (dismissed === "dismissed") return;

    // Delay prompt so it doesn't show immediately on page load
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || subscribed) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  function handleSubscribe() {
    subscribe(undefined, {
      onSuccess: (granted: boolean) => {
        if (granted) {
          setSubscribed(true);
          setVisible(false);
        } else {
          dismiss();
        }
      },
      onError: () => dismiss(),
    });
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--event-card-chip-bg, #f3f4f6)" }}
        >
          <Bell className="h-5 w-5" style={{ color: "var(--event-primary, #6366f1)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Stay in the loop</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            Get notified about announcements and updates even when the app is in the background.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSubscribe}
              disabled={isPending}
              className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--event-primary, #6366f1)" }}
            >
              {isPending ? "Enabling…" : "Enable notifications"}
            </button>
            <button
              onClick={dismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
