"use client";

import { useState, useEffect } from "react";
import { Camera, MapPin, Users, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  eventId: string;
  eventName: string;
  active: boolean;
  onDone: () => void;
}

function storageKey(eventId: string) {
  return `seatsnaps-welcomed-${eventId}`;
}

const features = [
  {
    icon: MapPin,
    label: "Find your seat",
    desc: "See your table assignment and who's sitting nearby.",
  },
  {
    icon: Users,
    label: "Browse guests",
    desc: "Explore the guest directory and discover shared interests.",
  },
  {
    icon: Calendar,
    label: "View the schedule",
    desc: "Stay on top of every moment as the event unfolds.",
  },
  {
    icon: Camera,
    label: "Upload photos",
    desc: "Take pictures and share them — they might make the highlights reel!",
  },
];

export function WelcomeDialog({ eventId, eventName, active, onDone }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (localStorage.getItem(storageKey(eventId))) {
      onDone();
      return;
    }
    setOpen(true);
  }, [active, eventId, onDone]);

  function dismiss() {
    localStorage.setItem(storageKey(eventId), "1");
    setOpen(false);
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-sm rounded-2xl border-0 p-0 shadow-2xl"
        style={{ background: "var(--event-dialog-bg, rgba(255,252,247,0.98))" }}
      >
        {/* Colored header strip */}
        <div
          className="flex flex-col items-center gap-1 rounded-t-2xl px-6 pb-5 pt-6 text-white"
          style={{ background: "var(--event-primary, #6366f1)" }}
        >
          <span className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-white">
              Welcome to {eventName}!
            </DialogTitle>
          </DialogHeader>
          <p className="mt-1 text-center text-sm text-white/85">
            Here&apos;s everything you can do today.
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-3 px-6 py-5">
          {features.map(({ icon: Icon, label, desc }) => (
            <li key={label} className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--event-card-chip-bg, #f3f4f6)" }}
              >
                <Icon className="h-4 w-4" style={{ color: "var(--event-primary, #6366f1)" }} />
              </span>
              <div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "hsl(24 12% 20%)" }}
                >
                  {label}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
                  {desc}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter className="px-6 pb-6 pt-0">
          <Button
            type="button"
            onClick={dismiss}
            className="w-full text-white"
            style={{ background: "var(--event-primary, #6366f1)" }}
          >
            Let&apos;s go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
