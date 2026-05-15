"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export type DateTimePickerProps = React.InputHTMLAttributes<HTMLInputElement>;

const DateTimePicker = React.forwardRef<HTMLInputElement, DateTimePickerProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        <input
          ref={ref}
          type="datetime-local"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[color-scheme:light]",
            className,
          )}
          {...props}
        />
        <CalendarIcon className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      </div>
    );
  },
);
DateTimePicker.displayName = "DateTimePicker";

export { DateTimePicker };
