import type { Metadata } from "next";
import { PhotoModerationPanel } from "./photo-moderation-panel";

export const metadata: Metadata = { title: "Photo Moderation" };

export default async function PhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Photo Moderation</h2>
        <p className="text-sm text-muted-foreground">
          Review, approve, or reject photos uploaded by attendees.
        </p>
      </div>
      <PhotoModerationPanel eventId={id} />
    </div>
  );
}
