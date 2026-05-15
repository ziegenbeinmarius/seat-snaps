import { HighlightSlideshow } from "./highlight-slideshow";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function HighlightsPage({ params }: Props) {
  const { eventId } = await params;

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <div className="mb-5 px-2">
        <h1 className="event-heading text-2xl font-semibold text-white drop-shadow-sm">
          Highlights
        </h1>
        <p className="event-body mt-0.5 text-sm text-white/60">
          Curated moments from this event
        </p>
      </div>
      <HighlightSlideshow eventId={eventId} />
    </div>
  );
}
