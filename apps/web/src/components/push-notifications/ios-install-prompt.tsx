"use client";

import { useState, useEffect } from "react";
import { PlusSquare, SendToBack } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const STORAGE_KEY = "ios-install-dismissed";

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;
  // Chrome on iOS reports CriOS; Firefox reports FxiOS — exclude them since they can't install PWAs
  const isSafariBased = !/CriOS|FxiOS|OPiOS/.test(ua);
  return isIos && isSafariBased;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isIosSafari()) return;
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

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
              📲
            </span>
            Install SeatSnaps on iPhone
          </DrawerTitle>
          <DrawerDescription className="leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
            Push notifications on iOS require the app to be added to your home screen.
          </DrawerDescription>
        </DrawerHeader>

        <ol className="mt-3 space-y-2.5 text-sm" style={{ color: "hsl(28 8% 38%)" }}>
          <li className="flex items-start gap-2.5 leading-relaxed">
            <span
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "var(--event-primary, #6366f1)" }}
            >
              1
            </span>
            <span className="flex items-center gap-1.5">
              Tap Share
              <SendToBack className="h-4 w-4" />
              in Safari
            </span>
          </li>
          <li className="flex items-start gap-2.5 leading-relaxed">
            <span
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "var(--event-primary, #6366f1)" }}
            >
              2
            </span>
            <span className="flex items-center gap-1.5">
              Choose <strong>Add to Home Screen</strong>
              <PlusSquare className="h-4 w-4" />
            </span>
          </li>
          <li className="flex items-start gap-2.5 leading-relaxed">
            <span
              className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: "var(--event-primary, #6366f1)" }}
            >
              3
            </span>
            Open the home screen app and enable notifications there.
          </li>
        </ol>

        <DrawerFooter className="mt-5">
          <Button
            type="button"
            className="w-full text-white"
            style={{ background: "var(--event-primary, #6366f1)" }}
            onClick={dismiss}
          >
            Got it
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
