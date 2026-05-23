import { AttendeesClient } from "./attendees-client";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { setRequestLocale } from "next-intl/server";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  params: Promise<{ eventId: string; locale: string }>;
}

export default async function AttendeesPage({ params }: Props) {
  const { eventId, locale } = await params;
  setRequestLocale(locale);

  let attendees: AttendeeResponse[] = [];
  try {
    const res = await fetch(`${API_URL}/api/events/${eventId}/attendees/public`, {
      cache: "no-store",
    });
    if (res.ok) attendees = (await res.json()) as AttendeeResponse[];
  } catch {
    /* empty */
  }

  return <AttendeesClient attendees={attendees} />;
}
