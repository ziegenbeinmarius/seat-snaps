import { getCurrentAttendee } from "@/lib/attendee-session";
import { PhotoGallery } from "./photo-gallery";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function PhotosPage({ params }: Props) {
  const { eventId } = await params;
  const attendee = await getCurrentAttendee();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">Photos</h1>
        {attendee && (
          <p className="text-sm text-gray-500 mt-0.5">
            {attendee.photoLimit} photo limit per guest
          </p>
        )}
      </div>
      <PhotoGallery eventId={eventId} photoLimit={attendee?.photoLimit ?? 10} />
    </div>
  );
}
