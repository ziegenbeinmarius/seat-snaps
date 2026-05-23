"use client";

import { useCredits } from "@/lib/api/credits";

export function CreditBalanceBadge() {
  const { data: credits, isLoading } = useCredits();

  if (isLoading) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
        style={{ background: "hsl(33 18% 92%)", color: "hsl(28 8% 50%)" }}
      >
        ...
      </span>
    );
  }

  if (!credits) return null;

  const available = credits.availableCredits;
  const isLow = available === 0;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
      style={{
        background: isLow ? "hsl(0 72% 95%)" : "hsl(33 18% 92%)",
        color: isLow ? "hsl(0 65% 44%)" : "hsl(28 65% 44%)",
      }}
    >
      {available} credit{available !== 1 ? "s" : ""}
    </span>
  );
}
