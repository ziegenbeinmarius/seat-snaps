"use client";

import { useState } from "react";
import { useCredits } from "@/lib/api/credits";
import { PlanManagementDialog } from "@/components/credits/plan-management-dialog";

export function CreditBalanceBadge() {
  const { data: credits, isLoading } = useCredits();
  const [open, setOpen] = useState(false);

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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
        style={{
          background: isLow ? "hsl(0 72% 95%)" : "hsl(33 18% 92%)",
          color: isLow ? "hsl(0 65% 44%)" : "hsl(28 65% 44%)",
        }}
        title="Manage plan & credits"
      >
        {available} credit{available !== 1 ? "s" : ""}
      </button>

      <PlanManagementDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
