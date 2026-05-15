import { redirect } from "next/navigation";
import { getCurrentAttendee } from "@/lib/attendee-session";
import { AttendeeNav } from "./attendee-nav";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

interface EventTheme {
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
}

async function fetchTheme(eventId: string): Promise<EventTheme | null> {
  try {
    const res = await fetch(`${API_URL}/api/events/${eventId}/theme`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<EventTheme>;
  } catch {
    return null;
  }
}

function buildThemeStyle(theme: EventTheme | null): React.CSSProperties {
  if (!theme) return {};
  const style: Record<string, string> = {};
  if (theme.primaryColor) style["--event-primary"] = theme.primaryColor;
  if (theme.secondaryColor) style["--event-secondary"] = theme.secondaryColor;
  if (theme.backgroundUrl) style["--event-background-url"] = `url(${theme.backgroundUrl})`;
  return style as React.CSSProperties;
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

  const theme = await fetchTheme(eventId);
  const themeStyle = buildThemeStyle(theme);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50" style={themeStyle}>
      <main className="flex-1 pb-20">{children}</main>
      <AttendeeNav eventId={eventId} />
    </div>
  );
}
