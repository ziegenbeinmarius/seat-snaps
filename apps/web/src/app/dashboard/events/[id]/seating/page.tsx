import type { Metadata } from "next";
import { SeatingPanel } from "./seating-panel";
import { loadEvent } from "@/lib/load-event";

export const metadata: Metadata = { title: "Seating Plan" };

export default async function SeatingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id, "/dashboard");

  if (!event.hasSeating) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="text-sm font-medium text-muted-foreground">Seating is disabled for this event.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Enable assigned seating in the event settings to manage tables and seats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SeatingPanel eventId={id} />
    </div>
  );
}
