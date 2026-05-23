import type { Metadata } from "next";
import { NewEventForm } from "@/components/events/new-event-form";

export const metadata: Metadata = { title: "New Event" };

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
        <p className="text-sm text-muted-foreground">Fill in the details for your new event</p>
      </div>
      <NewEventForm />
    </div>
  );
}
