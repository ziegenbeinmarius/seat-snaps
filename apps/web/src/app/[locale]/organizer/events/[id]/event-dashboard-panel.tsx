"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAttendees } from "@/lib/api/attendees";
import { useEvent } from "@/lib/api/events";
import { useOrganizerPhotos } from "@/lib/api/photos";
import { useScheduleItems } from "@/lib/api/schedule";
import { QrCode, Camera, Calendar, Users, CheckCircle, Clock, Copy, Check } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  eventId: string;
}

export function EventDashboardPanel({ eventId }: Props) {
  const t = useTranslations("organizer.dashboard");
  const locale = useLocale();
  const { data: attendees = [], isLoading: loadingAttendees } = useAttendees(eventId);
  const { data: event } = useEvent(eventId);
  const { data: photos = [], isLoading: loadingPhotos } = useOrganizerPhotos(eventId);
  const { data: scheduleItems = [], isLoading: loadingSchedule } = useScheduleItems(eventId);
  const [copiedRsvp, setCopiedRsvp] = useState(false);

  const checkedIn = attendees.filter((a) => a.checkedInAt != null).length;
  const pendingPhotos = photos.filter((p) => p.status === "pending").length;

  function getRsvpLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/join/event/${eventId}`;
  }

  async function copyRsvpLink() {
    await navigator.clipboard.writeText(getRsvpLink());
    setCopiedRsvp(true);
    setTimeout(() => setCopiedRsvp(false), 2000);
  }

  function getQrUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
    return `/api/proxy/events/${eventId}/qr/event?appUrl=${encodeURIComponent(appUrl)}`;
  }

  const now = new Date();
  const upcomingItem = scheduleItems
    .filter((s) => new Date(s.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

  const quickActions = [
    {
      href: `/organizer/events/${eventId}/checkin`,
      icon: QrCode,
      label: t("checkinActionLabel"),
      description: t("checkinDesc", { checked: checkedIn, total: attendees.length }),
      color: "hsl(28 65% 44%)",
      bg: "rgba(180, 120, 60, 0.1)",
    },
    {
      href: `/organizer/events/${eventId}/photos`,
      icon: Camera,
      label: t("photosActionLabel"),
      description: pendingPhotos > 0 ? t("photosPendingDesc", { count: pendingPhotos }) : t("photosAllReviewed"),
      color: "hsl(260 50% 55%)",
      bg: "rgba(100, 60, 180, 0.1)",
      badge: pendingPhotos > 0 ? pendingPhotos : undefined,
    },
    {
      href: `/organizer/events/${eventId}/schedule`,
      icon: Calendar,
      label: t("scheduleActionLabel"),
      description: upcomingItem
        ? t("scheduleNext", { title: upcomingItem.title })
        : scheduleItems.length === 0
          ? t("scheduleEmpty")
          : t("scheduleDone"),
      color: "hsl(200 65% 45%)",
      bg: "rgba(30, 120, 180, 0.1)",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Users}
          label={t("attendees")}
          value={loadingAttendees ? "—" : attendees.length.toString()}
        />
        <StatCard
          icon={CheckCircle}
          label={t("checkedIn")}
          value={loadingAttendees ? "—" : checkedIn.toString()}
          highlight={checkedIn > 0}
        />
        <StatCard
          icon={Camera}
          label={t("photos")}
          value={loadingPhotos ? "—" : photos.length.toString()}
        />
      </div>

      {/* Upcoming schedule item */}
      {!loadingSchedule && upcomingItem && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{ background: "rgba(30, 120, 180, 0.08)", border: "1px solid rgba(30, 120, 180, 0.15)" }}
        >
          <Clock className="h-5 w-5 shrink-0" style={{ color: "hsl(200 65% 45%)" }} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium" style={{ color: "hsl(200 65% 38%)" }}>
              {t("upNext")}
            </p>
            <p className="truncate text-sm font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
              {upcomingItem.title}
            </p>
            <p className="text-xs" style={{ color: "hsl(28 8% 52%)" }}>
              {new Date(upcomingItem.startTime).toLocaleTimeString(locale, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(28 8% 55%)" }}>
          {t("quickActions")}
        </p>
        {quickActions.map(({ href, icon: Icon, label, description, color, bg, badge }) => (
          <Link key={href} href={{ pathname: href }} className="block">
            <div
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: "rgba(255,252,247,0.75)",
                border: "1px solid rgba(220,210,195,0.6)",
              }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: bg }}
              >
                <Icon className="h-6 w-6" style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
                  {label}
                </p>
                <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
                  {description}
                </p>
              </div>
              {badge !== undefined && (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "hsl(0 65% 55%)" }}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* RSVP QR code — visible when RSVP is enabled */}
      {event?.rsvpEnabled && (
        <div
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "rgba(255,252,247,0.75)",
            border: "1px solid rgba(220,210,195,0.6)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(28 8% 55%)" }}>
            {t("rsvpQrCode")}
          </p>
          <div className="flex items-start gap-4">
            <img
              src={getQrUrl()}
              alt="RSVP QR code"
              className="h-28 w-28 shrink-0 rounded-lg border"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-medium" style={{ color: "hsl(24 12% 20%)" }}>
                {t("showToGuests")}
              </p>
              <code
                className="block truncate rounded border px-2 py-1 text-xs"
                style={{ background: "rgba(255,255,255,0.8)", color: "hsl(28 8% 40%)" }}
              >
                {getRsvpLink()}
              </code>
              <button
                onClick={copyRsvpLink}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: copiedRsvp ? "rgba(34, 197, 94, 0.1)" : "rgba(180, 120, 60, 0.1)",
                  color: copiedRsvp ? "hsl(142 71% 35%)" : "hsl(28 65% 44%)",
                  border: "1px solid",
                  borderColor: copiedRsvp ? "rgba(34, 197, 94, 0.3)" : "rgba(180, 120, 60, 0.3)",
                }}
              >
                {copiedRsvp ? (
                  <><Check className="h-3.5 w-3.5" />{t("copied")}</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" />{t("copyLink")}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop dashboard link */}
      <div className="text-center">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="text-xs underline-offset-2 hover:underline"
          style={{ color: "hsl(28 8% 55%)" }}
        >
          {t("desktopDashboard")}
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl py-4"
      style={{
        background: "rgba(255,252,247,0.75)",
        border: "1px solid rgba(220,210,195,0.6)",
      }}
    >
      <Icon
        className="h-5 w-5"
        style={{ color: highlight ? "hsl(130 45% 42%)" : "hsl(28 40% 55%)" }}
      />
      <span
        className="text-xl font-bold"
        style={{ color: highlight ? "hsl(130 45% 36%)" : "hsl(24 12% 20%)" }}
      >
        {value}
      </span>
      <span className="text-xs" style={{ color: "hsl(28 8% 55%)" }}>
        {label}
      </span>
    </div>
  );
}
