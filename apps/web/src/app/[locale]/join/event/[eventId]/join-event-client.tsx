"use client";

import { useState } from "react";
import { AttendScanner } from "@/app/[locale]/attend/attend-scanner";
import { RsvpForm } from "./rsvp-form";
import { useTranslations } from "next-intl";

interface Props {
  eventId: string;
  eventTitle: string;
  rsvpEnabled: boolean;
}

export function JoinEventClient({ eventId, eventTitle, rsvpEnabled }: Props) {
  const t = useTranslations("join");
  const [showRsvp, setShowRsvp] = useState(false);

  if (showRsvp) {
    return (
      <RsvpForm
        eventId={eventId}
        eventTitle={eventTitle}
        onBack={() => setShowRsvp(false)}
      />
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)" }}
    >
      {/* Hero */}
      <div
        className="px-6 py-10"
        style={{
          background: "rgba(250, 244, 234, 0.6)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(200, 175, 140, 0.3)",
        }}
      >
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "hsl(28 50% 50%)" }}
        >
          {t("invited")}
        </p>
        <h1
          className="text-3xl font-semibold"
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            color: "hsl(24 12% 20%)",
          }}
        >
          {eventTitle}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          {t("scanQr")}
        </p>
      </div>

      <div className="flex-1 p-6">
        {/* QR Scanner */}
        <AttendScanner />

        {/* RSVP path — only for events with RSVP enabled */}
        {rsvpEnabled && (
          <div className="mt-6 text-center">
            <p className="mb-2 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
              {t("notOnList")}
            </p>
            <button
              onClick={() => setShowRsvp(true)}
              className="rounded-2xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{
                background: "rgba(255, 252, 247, 0.75)",
                border: "1.5px solid rgba(196, 148, 90, 0.5)",
                color: "hsl(28 45% 40%)",
              }}
            >
              {t("registerAsNew")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
