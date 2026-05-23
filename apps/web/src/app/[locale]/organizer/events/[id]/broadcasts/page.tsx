import { BroadcastsPanel } from "@/app/[locale]/dashboard/events/[id]/broadcasts/broadcasts-panel";
import { MobilePageHeading } from "@/components/mobile/mobile-page-heading";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizerBroadcastsPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="pb-8">
      <MobilePageHeading variant="organizer">Broadcasts</MobilePageHeading>
      <BroadcastsPanel eventId={id} />
    </div>
  );
}
