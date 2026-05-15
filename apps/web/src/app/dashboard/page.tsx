import type { Metadata } from "next";
import { EventListPage } from "@/components/events/event-list-page";

export const metadata: Metadata = { title: "My Events" };

export default async function DashboardPage() {
  return <EventListPage variant="desktop" eventHrefPrefix="/dashboard/events" />;
}
