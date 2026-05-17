import type { Metadata } from "next";
import { AttendeesPanel } from "./attendees-panel";
import { loadEvent } from "@/lib/load-event";

export const metadata: Metadata = { title: "Attendees" };

export default async function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id, "/dashboard");

  return (
      <div className="mt-8">
        <AttendeesPanel eventId={id} hasSeating={event.hasSeating} />
      </div>
  );
}
