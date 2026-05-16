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

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function syncIfGranted() {
      if (Notification.permission !== "granted") return;

      try {
        const didSync = await syncPushSubscription(eventId);
        if (!cancelled && didSync) {
          setSubscribed(true);
          setVisible(false);
        }
      } catch {
        if (!cancelled) {
          setSubscribed(false);
        }
      }
    }

    function updatePromptState() {
      if (Notification.permission === "granted") {
        void syncIfGranted();
        return;
      }

      if (Notification.permission === "denied") {
        setVisible(false);
        return;
      }

      const dismissed = localStorage.getItem(STORAGE_KEY) as DismissState;
      if (dismissed === "dismissed") return;

      timer = setTimeout(() => setVisible(true), 3000);
    }

    function retrySyncOnResume() {
      if (document.visibilityState === "visible") {
        void syncIfGranted();
      }
    }

    updatePromptState();
    window.addEventListener("focus", retrySyncOnResume);
    document.addEventListener("visibilitychange", retrySyncOnResume);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", retrySyncOnResume);
      document.removeEventListener("visibilitychange", retrySyncOnResume);
    };
  }, [eventId]);

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
