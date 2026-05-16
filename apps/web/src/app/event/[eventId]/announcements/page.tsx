import { AnnouncementsClient } from "./announcements-client";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function AnnouncementsPage({ params }: Props) {
  const { eventId } = await params;
  return <AnnouncementsClient eventId={eventId} />;
}
