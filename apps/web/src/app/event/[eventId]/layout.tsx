import { redirect } from "next/navigation";
import { getCurrentAttendee } from "@/lib/attendee-session";
import { AttendeeNav } from "./attendee-nav";

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
  const attendee = await getCurrentAttendee();

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
      <main className="flex-1 pb-20">{children}</main>
      <AttendeeNav eventId={eventId} />
    </div>
  );
}
