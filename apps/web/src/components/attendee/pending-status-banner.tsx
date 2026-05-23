"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  status: string;
}

export function PendingStatusBanner({ status }: Props) {
  const t = useTranslations("attendeeApp");

  if (status !== "pending") return null;

  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm"
      style={{
        background: "rgba(196, 148, 90, 0.18)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        color: "white",
      }}
    >
      <Clock className="h-4 w-4 shrink-0" style={{ color: "rgba(255, 255, 255, 0.85)" }} />
      <p>{t("pendingBanner")}</p>
    </div>
  );
}
