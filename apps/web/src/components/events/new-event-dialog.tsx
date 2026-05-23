"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewEventForm } from "@/components/events/new-event-form";
import { PricingTiersDialog } from "@/components/credits/pricing-tiers-dialog";
import { useCredits } from "@/lib/api/credits";

interface Props {
  iconOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function NewEventDialog({ iconOnly = false, className, style }: Props) {
  const [open, setOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const { data: credits } = useCredits();

  const handleClick = () => {
    const hasCredits = credits && credits.availableCredits > 0;
    const hasFreeTrial = credits && !credits.freeTrialUsed;

    if (hasCredits || hasFreeTrial) {
      setOpen(true);
    } else {
      setShowPricing(true);
    }
  };

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={handleClick}
          className={className}
          style={style}
          aria-label="Create new event"
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : (
        <Button onClick={handleClick} className={className} style={style}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Event
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <NewEventForm onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      <PricingTiersDialog open={showPricing} onOpenChange={setShowPricing} />
    </>
  );
}
