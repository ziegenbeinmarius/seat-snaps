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
import { useTranslations } from "next-intl";

const DISMISSED_KEY = "seatsnaps_trial_welcome_dismissed";

export function TrialWelcomeDialog() {
  const { data: credits, isLoading } = useCredits();
  const [open, setOpen] = useState(false);
  const t = useTranslations("credits.trialWelcome");

  useEffect(() => {
    if (isLoading || !credits) return;
    if (credits.freeTrialUsed) return;
    if (credits.totalCredits > 0) return;

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
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("starting")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl px-5 py-4" style={{ background: "hsl(33 18% 96%)" }}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "hsl(28 65% 44%)" }}>1</span>
            <p className="text-sm" style={{ color: "hsl(24 12% 20%)" }}>
              <strong>{t("feature1Title")}</strong> — {t("feature1Desc")}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "hsl(28 65% 44%)" }}>5</span>
            <p className="text-sm" style={{ color: "hsl(24 12% 20%)" }}>
              <strong>{t("feature2Title")}</strong> — {t("feature2Desc")}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: "hsl(142 40% 50%)", color: "white" }}>
              &#x2713;
            </span>
            <p className="text-sm" style={{ color: "hsl(24 12% 20%)" }}>
              <strong>{t("feature3Title")}</strong> — {t("feature3Desc")}
            </p>
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: "hsl(28 8% 50%)" }}>
          {t("upgradeAnytime")}
        </p>

        <DialogFooter className="sm:justify-center">
          <Button onClick={handleDismiss} className="px-8">
            {t("letsGo")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
