import { SeatingLive } from "./seating-live";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function SeatingPage({ params }: Props) {
  const { eventId } = await params;

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
