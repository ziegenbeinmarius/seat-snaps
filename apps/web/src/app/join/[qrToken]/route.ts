import { NextResponse } from "next/server";
import type { AttendeeSessionResponse } from "@seat-snaps/shared";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

export async function GET(
  request: Request,
  context: { params: Promise<{ qrToken: string }> },
) {
  const { qrToken } = await context.params;

  let session: AttendeeSessionResponse;
  try {
    const res = await fetch(`${API_URL}/api/attendee-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/join/invalid", request.url));
    }

    session = (await res.json()) as AttendeeSessionResponse;
  } catch {
    return NextResponse.redirect(new URL("/join/invalid", request.url));
  }

  const response = NextResponse.redirect(new URL(`/event/${session.eventId}`, request.url));
  response.cookies.set("attendee-session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60,
  });

  if (session.csrfToken) {
    response.cookies.set("XSRF-TOKEN", session.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 90 * 24 * 60 * 60,
    });
  }

  return response;
}
