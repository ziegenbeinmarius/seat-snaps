import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { AttendeeSessionResponse } from "@seat-snaps/shared";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  params: Promise<{ qrToken: string }>;
}

export default async function JoinQrPage({ params }: Props) {
  const { qrToken } = await params;

  let session: AttendeeSessionResponse;
  try {
    const res = await fetch(`${API_URL}/api/attendee-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrToken }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Invalid QR token");
    session = (await res.json()) as AttendeeSessionResponse;
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Invalid QR Code</h1>
          <p className="text-gray-500">This QR code is not valid or has already been used.</p>
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("attendee-session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60,
  });

  redirect(`/event/${session.eventId}`);
}
