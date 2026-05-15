import { redirect } from "next/navigation";
import { getCurrentAttendee } from "@/lib/attendee-session";
import { AttendeeNav } from "./attendee-nav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

export default async function AttendeeLayout({ children, params }: Props) {
  const { eventId } = await params;
  const attendee = await getCurrentAttendee();

  if (!attendee) {
    redirect(`/join/event/${eventId}`);
    return null;
  }

  if (attendee.eventId !== eventId) {
    redirect(`/event/${attendee.eventId}`);
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pb-20">{children}</main>
      <AttendeeNav eventId={eventId} />
    </div>
  );
}
