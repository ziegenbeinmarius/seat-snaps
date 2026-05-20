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
import { AttendeeOnboardingFlow } from "@/components/attendee/onboarding-flow";
import { PendingStatusBanner } from "@/components/attendee/pending-status-banner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;

  return {
    manifest: `/manifest-attendee?eventId=${eventId}`,
    icons: {
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "SeatSnaps",
      startupImage: "/icons/apple-touch-icon.png",
    },
  };
}

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

interface EventInfo {
  type: "wedding" | "birthday" | "corporate" | "other";
  hasSeating: boolean;
  title?: string;
}

interface EventTheme {
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  textColor: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
  fontFamily: string | null;
  buttonBorderRadius: string | null;
  headerStyle: string | null;
  customCss: string | null;
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

  const borderRadiusMap: Record<string, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  };

  const fontCssVarMap: Record<string, string> = {
    "Inter": "var(--font-inter, 'Inter', system-ui, sans-serif)",
    "Lato": "var(--font-lato, 'Lato', system-ui, sans-serif)",
    "Montserrat": "var(--font-montserrat, 'Montserrat', system-ui, sans-serif)",
    "Merriweather": "var(--font-merriweather, 'Merriweather', Georgia, serif)",
    "Playfair Display": "var(--font-playfair, 'Playfair Display', Georgia, serif)",
    "Roboto": "var(--font-roboto, 'Roboto', system-ui, sans-serif)",
    "Open Sans": "var(--font-opensans, 'Open Sans', system-ui, sans-serif)",
  };

  const themeVars: Record<string, string> = {};
  if (theme?.primaryColor) themeVars["--event-primary"] = theme.primaryColor;
  if (theme?.secondaryColor) themeVars["--event-secondary"] = theme.secondaryColor;
  if (theme?.accentColor) themeVars["--event-accent"] = theme.accentColor;
  if (theme?.textColor) themeVars["--event-text"] = theme.textColor;
  if (theme?.fontFamily && fontCssVarMap[theme.fontFamily]) {
    themeVars["--event-heading-font"] = fontCssVarMap[theme.fontFamily];
    themeVars["--event-body-font"] = fontCssVarMap[theme.fontFamily];
  }
  if (theme?.buttonBorderRadius && borderRadiusMap[theme.buttonBorderRadius]) {
    themeVars["--event-button-radius"] = borderRadiusMap[theme.buttonBorderRadius];
  }
  if (theme?.headerStyle) themeVars["--event-header-style"] = theme.headerStyle;
  if (theme?.primaryColor) {
    const accent = theme.accentColor ?? theme.primaryColor;
    themeVars["--event-gradient"] = `linear-gradient(145deg, ${accent} 0%, ${theme.primaryColor} 45%, ${theme.primaryColor}bb 100%)`;
    themeVars["--event-active-color"] = theme.primaryColor;
  }

  const backgroundStyle: React.CSSProperties = theme?.backgroundUrl
    ? { background: `url(${theme.backgroundUrl}) center/cover no-repeat fixed, var(--event-gradient)` }
    : { background: "var(--event-gradient)" };

  return (
    <SocketProvider token={sessionToken ?? ""} eventId={eventId}>
      {theme?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      )}
      <div
        className="flex min-h-screen flex-col"
        data-event-theme={eventThemeType}
        style={themeVars as React.CSSProperties}
      >
        {/* Full-page gradient background */}
        <div
          className="fixed inset-0 -z-10"
          style={backgroundStyle}
          aria-hidden="true"
        />
        {/* Re-syncs CSS vars whenever the attendee returns to this tab or navigates */}
        <ThemeSyncer eventId={eventId} />
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
          <AttendeeHeader name={attendee.name} eventId={eventId} />
          <PendingStatusBanner status={attendee.status} />
          <BroadcastBanner />
          <ConnectionStatus />
          <main className="flex-1 pb-20">{children}</main>
        </div>
        <AttendeeOnboardingFlow eventId={eventId} eventName={event?.title ?? "this event"} hasSeating={event?.hasSeating ?? true} />
        <AttendeeNav eventId={eventId} hasSeating={event?.hasSeating ?? true} />
      </div>
    </SocketProvider>
  );
}
