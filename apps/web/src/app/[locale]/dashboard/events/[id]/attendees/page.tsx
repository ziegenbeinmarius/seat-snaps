import type { Metadata } from "next";
import { AttendeesPanel } from "./attendees-panel";
import { loadEvent } from "@/lib/load-event";
import type { StatusFilter } from "./attendees-panel";

export const metadata: Metadata = { title: "Attendees" };

export default async function AttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, { status }] = await Promise.all([params, searchParams]);
  const event = await loadEvent(id, "/dashboard");

  const defaultStatus: StatusFilter =
    status === "pending" || status === "confirmed" || status === "declined"
      ? (status as StatusFilter)
      : "all";

  return (
    <div className="mt-8">
      <AttendeesPanel eventId={id} hasSeating={event.hasSeating} defaultStatus={defaultStatus} />
    </div>
  );
}
