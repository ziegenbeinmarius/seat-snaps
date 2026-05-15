import { cookies } from "next/headers";
import type { AttendeeResponse } from "@seat-snaps/shared";

const ATTENDEE_SESSION_COOKIE = "attendee-session";

export async function getAttendeeSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ATTENDEE_SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentAttendee(): Promise<AttendeeResponse | null> {
  const token = await getAttendeeSessionToken();
  if (!token) return null;

  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${apiUrl}/api/attendee-sessions/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<AttendeeResponse>;
  } catch {
    return null;
  }
}
