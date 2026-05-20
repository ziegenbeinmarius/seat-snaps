import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobilePageHeadingProps {
  children: ReactNode;
  action?: ReactNode;
  variant?: "attendee" | "organizer";
  className?: string;
}

export function MobilePageHeading({
  children,
  action,
  variant = "attendee",
  className,
}: MobilePageHeadingProps) {
  return (
    <div className={cn("mb-6 flex items-center justify-between", className)}>
      <h1
        className={cn(
          "event-heading text-2xl font-semibold",
          variant === "attendee"
            ? "text-white drop-shadow-sm"
            : "text-[hsl(24_12%_18%)]",
        )}
      >
        {children}
      </h1>
      {action}
    </div>
  );
}
