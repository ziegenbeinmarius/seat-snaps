import type { Metadata } from "next";
import { MobilePhotosPanel } from "./mobile-photos-panel";

export const metadata: Metadata = { title: "Photos — Organizer" };

export default async function OrganizerPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MobilePhotosPanel eventId={id} />;
}
