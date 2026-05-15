import type { Metadata } from "next";
import { AttendeesPanel } from "./attendees-panel";

export const metadata: Metadata = { title: "Attendees" };

export default async function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
      <div className="mt-8">
        <AttendeesPanel eventId={id} />
      </div>
  );
}
