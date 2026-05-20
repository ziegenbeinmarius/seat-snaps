"use client";

import { useState, useEffect } from "react";
import { BellRing, ShieldCheck } from "lucide-react";
import { syncPushSubscription, useSubscribeToPush } from "@/lib/api/push-subscriptions";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface Props {
  eventId: string;
  active: boolean;
  onDone: () => void;
}

const STORAGE_KEY = "push-permission-dismissed";

export function PushPermissionPrompt({ eventId, active, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { mutate: subscribe, isPending } = useSubscribeToPush(eventId);

  // Sync subscription silently whenever the user returns to the tab.
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function syncIfGranted() {
      if (Notification.permission !== "granted") return;
      try {
        const didSync = await syncPushSubscription(eventId);
        if (didSync) setSubscribed(true);
      } catch {
        // ignore
      }
    }

    function retrySyncOnResume() {
      if (document.visibilityState === "visible") void syncIfGranted();
    }

    window.addEventListener("focus", retrySyncOnResume);
    document.addEventListener("visibilitychange", retrySyncOnResume);
    return () => {
      window.removeEventListener("focus", retrySyncOnResume);
      document.removeEventListener("visibilitychange", retrySyncOnResume);
    };
  }, [eventId]);

  // Sequencer: decide whether to show or skip when it's our turn.
  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      onDone();
      return;
    }

    let cancelled = false;

    async function checkAndShow() {
      if (Notification.permission === "granted") {
        try {
          const didSync = await syncPushSubscription(eventId);
          if (!cancelled && didSync) setSubscribed(true);
        } catch {
          // ignore
        }
        if (!cancelled) onDone();
        return;
      }

      if (Notification.permission === "denied") {
        onDone();
        return;
      }

      if (localStorage.getItem(STORAGE_KEY) === "dismissed") {
        onDone();
        return;
      }

      if (!cancelled) setVisible(true);
    }

    void checkAndShow();
    return () => { cancelled = true; };
  }, [active, eventId, onDone]);

  if (!visible || subscribed) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
    onDone();
  }

  function handleSubscribe() {
    subscribe(undefined, {
      onSuccess: (granted: boolean) => {
        if (granted) {
          setSubscribed(true);
          setVisible(false);
          onDone();
        } else {
          dismiss();
        }
      },
      onError: () => dismiss(),
    });
  }

  return (
    <Drawer open={visible} onOpenChange={(open) => (!open ? dismiss() : setVisible(open))}>
      <DrawerContent className="rounded-t-3xl border-[rgba(220,210,195,0.7)] bg-[rgba(255,252,247,0.96)] px-5 pb-5 pt-4 backdrop-blur">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2" style={{ color: "hsl(24 12% 20%)" }}>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "var(--event-card-chip-bg, #f3f4f6)" }}
              aria-hidden="true"
            >
              <BellRing className="h-4 w-4" style={{ color: "var(--event-primary, #6366f1)" }} />
            </span>
            Stay in the loop
          </DrawerTitle>
          <DrawerDescription className="leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
            Allow push notifications for live announcements and important updates.
          </DrawerDescription>
        </DrawerHeader>

        <div
          className="mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs"
          style={{
            borderColor: "rgba(220,210,195,0.9)",
            background: "rgba(255,255,255,0.6)",
            color: "hsl(28 8% 40%)",
          }}
        >
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          You can turn notifications off anytime from your browser or app settings.
        </div>

        <DrawerFooter className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            onClick={handleSubscribe}
            disabled={isPending}
            className="w-full text-white"
            style={{ background: "var(--event-primary, #6366f1)" }}
          >
            {isPending ? "Enabling..." : "Enable notifications"}
          </Button>
          <Button type="button" variant="outline" onClick={dismiss} className="w-full">
            Not now
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
