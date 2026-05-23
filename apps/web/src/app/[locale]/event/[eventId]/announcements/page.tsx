import { AnnouncementsClient } from "./announcements-client";
import { setRequestLocale } from "next-intl/server";

interface Props {
  params: Promise<{ eventId: string; locale: string }>;
}

export default async function AnnouncementsPage({ params }: Props) {
  const { eventId, locale } = await params;
  setRequestLocale(locale);
  return <AnnouncementsClient eventId={eventId} />;
}
