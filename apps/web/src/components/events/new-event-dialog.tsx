"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewEventForm } from "@/app/dashboard/events/new/new-event-form";

interface Props {
  /** Render as a compact icon-only button (used on the organizer mobile view). */
  iconOnly?: boolean;
  /** Additional class names for the trigger button. */
  className?: string;
  /** Inline styles for the trigger button. */
  style?: React.CSSProperties;
}

export function NewEventDialog({ iconOnly = false, className, style }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={className}
          style={style}
          aria-label="Create new event"
        >
          <Plus className="h-5 w-5" />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)} className={className} style={style}>
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
    </>
  );
}
