import { getCurrentAttendee } from "@/lib/attendee-session";
import { PhotoGallery } from "./photo-gallery";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function PhotosPage({ params }: Props) {
  const { eventId } = await params;
  const attendee = await getCurrentAttendee();

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <div className="mb-5 px-2">
        <h1 className="event-heading text-2xl font-semibold text-white drop-shadow-sm">Photos</h1>
        {attendee && (
          <p className="event-body mt-0.5 text-sm text-white/60">
            {attendee.photoLimit} photo limit per guest
          </p>
        )}
      </div>
      <PhotoGallery eventId={eventId} photoLimit={attendee?.photoLimit ?? 10} />
    </div>
  );
}
