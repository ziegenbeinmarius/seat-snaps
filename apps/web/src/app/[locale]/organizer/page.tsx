import type { Metadata } from "next";
import { EventListPage } from "@/components/events/event-list-page";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = { title: "My Events" };

export default async function OrganizerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EventListPage variant="mobile" eventHrefPrefix="/organizer/events" />;
}
