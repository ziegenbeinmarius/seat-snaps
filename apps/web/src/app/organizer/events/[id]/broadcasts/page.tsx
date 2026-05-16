import { BroadcastsPanel } from "@/app/dashboard/events/[id]/broadcasts/broadcasts-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizerBroadcastsPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="pb-8">
      <BroadcastsPanel eventId={id} />
    </div>
  );
}
