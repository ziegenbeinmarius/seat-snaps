import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentAttendee } from "@/lib/attendee-session";
import { QrCode } from "lucide-react";

export const metadata: Metadata = {
  title: "SeatSnaps",
  manifest: "/manifest-attendee.json",
};

export default async function AttendPage() {
  const attendee = await getCurrentAttendee();

  if (attendee) {
    redirect(`/event/${attendee.eventId}`);
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, #f5ede0 0%, #ede0cc 100%)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl px-8 py-12 text-center"
        style={{
          background: "rgba(255, 252, 247, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(220, 210, 195, 0.6)",
          boxShadow: "0 2px 20px rgba(120, 85, 40, 0.07)",
        }}
      >
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "rgba(196, 149, 90, 0.12)" }}
        >
          <QrCode className="h-8 w-8" style={{ color: "#a07850" }} />
        </div>

        <h1
          className="mb-2 text-2xl font-semibold"
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            color: "hsl(24 12% 20%)",
          }}
        >
          Welcome to SeatSnaps
        </h1>

        <p className="text-sm leading-relaxed" style={{ color: "hsl(28 8% 52%)" }}>
          Scan the QR code from your invitation to join your event and access your schedule,
          seating plan, and more.
        </p>
      </div>
    </main>
  );
}
