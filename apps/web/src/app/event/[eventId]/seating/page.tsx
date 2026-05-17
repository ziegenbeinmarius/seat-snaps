import { redirect } from "next/navigation";
import { SeatingLive } from "./seating-live";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function SeatingPage({ params }: Props) {
  const { eventId } = await params;

  const res = await fetch(`${API_URL}/api/events/${eventId}/info`, { cache: "no-store" });
  if (res.ok) {
    const info = (await res.json()) as { hasSeating: boolean };
    if (!info.hasSeating) {
      redirect(`/event/${eventId}`);
    }
  }

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <div className="mb-6 px-2">
        <h1 className="event-heading text-2xl font-semibold text-white drop-shadow-sm">
          Seating Plan
        </h1>
        <p className="event-body mt-0.5 text-sm text-white/65">Your seat is highlighted</p>
      </div>

      <SeatingLive eventId={eventId} />
    </div>
  );
}
