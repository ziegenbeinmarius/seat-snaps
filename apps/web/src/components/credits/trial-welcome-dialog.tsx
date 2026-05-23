"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/lib/api/credits";

const DISMISSED_KEY = "seatsnaps_trial_welcome_dismissed";

export function TrialWelcomeDialog() {
  const { data: credits, isLoading } = useCredits();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !credits) return;
    if (credits.freeTrialUsed) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, [credits, isLoading]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "hsl(33 40% 92%)" }}>
            <Sparkles className="h-6 w-6" style={{ color: "hsl(28 65% 44%)" }} />
          </div>
          <DialogTitle className="text-center">Welcome to SeatSnaps!</DialogTitle>
          <DialogDescription className="text-center">
            You&apos;re starting with a free trial event.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl px-5 py-4" style={{ background: "hsl(33 18% 96%)" }}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "hsl(28 65% 44%)" }}>1</span>
            <p className="text-sm" style={{ color: "hsl(24 12% 20%)" }}>
              <strong>1 free event</strong> — create your first event at no cost to explore the platform.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "hsl(28 65% 44%)" }}>5</span>
            <p className="text-sm" style={{ color: "hsl(24 12% 20%)" }}>
              <strong>Up to 5 attendees</strong> — your trial event supports a small guest list to get you started.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "hsl(142 40% 50%)", color: "white" }}>
              &#x2713;
            </span>
            <p className="text-sm" style={{ color: "hsl(24 12% 20%)" }}>
              <strong>All features included</strong> — seating plans, QR codes, schedules, and more.
            </p>
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: "hsl(28 8% 50%)" }}>
          Need more events? You can upgrade to a paid plan anytime.
        </p>

        <DialogFooter className="sm:justify-center">
          <Button onClick={handleDismiss} className="px-8">
            Got it, let&apos;s go!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
