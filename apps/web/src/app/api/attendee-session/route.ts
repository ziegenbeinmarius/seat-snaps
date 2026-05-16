import { type NextRequest, NextResponse } from "next/server";
import type { AttendeeSessionResponse } from "@seat-snaps/shared";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
const SESSION_TTL = 90 * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/attendee-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(err, { status: res.status });
  }

  const session = (await res.json()) as AttendeeSessionResponse;

  const response = NextResponse.json({
    attendeeId: session.attendeeId,
    eventId: session.eventId,
    name: session.name,
  });

  response.cookies.set("attendee-session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });

  if (session.csrfToken) {
    response.cookies.set("XSRF-TOKEN", session.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL,
    });
  }

  return response;
}
