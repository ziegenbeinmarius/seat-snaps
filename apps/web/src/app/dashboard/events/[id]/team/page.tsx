import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { TeamPanel } from "./team-panel";
import type { EventMember } from "@seat-snaps/shared";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let members: EventMember[];

  try {
    members = await apiRequest<EventMember[]>(`/events/${id}/members`);
  } catch {
    notFound();
  }

  return <TeamPanel eventId={id} initialMembers={members} />;
}
