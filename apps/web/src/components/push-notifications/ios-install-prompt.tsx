"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
          style={{ background: "var(--event-card-chip-bg, #f3f4f6)" }}
          aria-hidden="true"
        >
          📲
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Install for notifications</p>
          <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
            On iPhone, push notifications require the app to be installed. It only takes a second:
          </p>
          <ol className="mt-2 space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--event-primary, #6366f1)" }}
              >
                1
              </span>
              Tap the Share button{" "}
              <span aria-label="share icon" className="text-base leading-none">
                ⎋
              </span>{" "}
              in Safari&apos;s toolbar
            </li>
            <li className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--event-primary, #6366f1)" }}
              >
                2
              </span>
              Choose <strong>&quot;Add to Home Screen&quot;</strong>{" "}
              <span aria-label="plus icon" className="text-base leading-none">
                ➕
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--event-primary, #6366f1)" }}
              >
                3
              </span>
              Open the app from your home screen
            </li>
          </ol>
          <button
            onClick={dismiss}
            className="mt-3 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Dismiss
          </button>
        </div>
        <button
          onClick={dismiss}
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {/* Arrow pointing down toward Safari's bottom toolbar */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 rounded-sm bg-white shadow-md ring-1 ring-black/5"
        aria-hidden="true"
      />
    </div>
  );
}
