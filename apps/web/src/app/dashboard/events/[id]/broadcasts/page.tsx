import { BroadcastsPanel } from "./broadcasts-panel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BroadcastsPage({ params }: Props) {
  const { id } = await params;
  return <BroadcastsPanel eventId={id} />;
}
