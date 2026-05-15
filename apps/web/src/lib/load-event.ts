import { notFound, redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";

export async function loadEvent(id: string, fallbackRedirect: string): Promise<EventResponse> {
  try {
    return await apiRequest<EventResponse>(`/events/${id}`);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("unauthorized")) redirect("/login");
    if (message.includes("access denied") || message.includes("forbidden")) redirect(fallbackRedirect);
    notFound();
  }
}
