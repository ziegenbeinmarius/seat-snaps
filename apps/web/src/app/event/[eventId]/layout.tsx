import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAttendee, getAttendeeSessionToken } from "@/lib/attendee-session";
import { AttendeeNav } from "./attendee-nav";
import { AttendeeHeader } from "./attendee-header";
import { ThemeSyncer } from "./theme-syncer";
import { SocketProvider } from "@/components/broadcast/socket-provider";
import { BroadcastBanner } from "@/components/broadcast/broadcast-banner";
import { ConnectionStatus } from "@/components/broadcast/connection-status";
import { PushPermissionPrompt } from "@/components/push-notifications/push-permission-prompt";

export const metadata: Metadata = {
  manifest: "/manifest-attendee.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SeatSnaps",
  },
};

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

interface EventInfo {
  type: "wedding" | "birthday" | "corporate" | "other";
}

interface EventTheme {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
}

async function fetchEventAndTheme(eventId: string) {
  const [eventRes, themeRes] = await Promise.allSettled([
    fetch(`${API_URL}/api/events/${eventId}/info`, { cache: "no-store" }),
    fetch(`${API_URL}/api/events/${eventId}/theme`, { cache: "no-store" }),
  ]);

  let event: EventInfo | null = null;
  let theme: EventTheme | null = null;

  if (eventRes.status === "fulfilled" && eventRes.value.ok) {
    event = (await eventRes.value.json()) as EventInfo;
  }
  if (themeRes.status === "fulfilled" && themeRes.value.ok) {
    const body = await themeRes.value.json();
    if (body && (body.primaryColor || body.secondaryColor)) theme = body as EventTheme;
  }

  return { event, theme };
}

export default async function AttendeeLayout({ children, params }: Props) {
  const { eventId } = await params;
  const [attendee, sessionToken] = await Promise.all([
    getCurrentAttendee(),
    getAttendeeSessionToken(),
  ]);

  if (!attendee) {
    redirect(`/join/event/${eventId}`);
    return null;
  }

  if (attendee.eventId !== eventId) {
    redirect(`/event/${attendee.eventId}`);
    return null;
  }

  const { event, theme } = await fetchEventAndTheme(eventId);

  // Map event type → CSS theme class; also allow custom colors to override
  const eventThemeType = event?.type ?? "other";

  const themeVars: Record<string, string> = {};
  if (theme?.primaryColor) themeVars["--event-primary"] = theme.primaryColor;
  if (theme?.secondaryColor) themeVars["--event-secondary"] = theme.secondaryColor;

  return (
    <SocketProvider token={sessionToken ?? ""} eventId={eventId}>
      <div
        className="flex min-h-screen flex-col"
        data-event-theme={eventThemeType}
        style={themeVars as React.CSSProperties}
      >
        {/* Full-page gradient background */}
        <div
          className="fixed inset-0 -z-10"
          style={{ background: "var(--event-gradient)" }}
          aria-hidden="true"
        />
        {/* Re-syncs CSS vars whenever the attendee returns to this tab or navigates */}
        <ThemeSyncer eventId={eventId} />
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
          <AttendeeHeader name={attendee.name} eventId={eventId} />
          <BroadcastBanner />
          <ConnectionStatus />
          <main className="flex-1 pb-20">{children}</main>
        </div>
        <PushPermissionPrompt eventId={eventId} />
        <AttendeeNav eventId={eventId} />
      </div>
    </SocketProvider>
  );
}
