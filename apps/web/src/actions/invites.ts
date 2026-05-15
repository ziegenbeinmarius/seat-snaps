"use server";

import { apiRequest } from "@/lib/api";

export async function acceptInviteAction(token: string): Promise<void> {
  try {
    await apiRequest<void>(`/invites/${token}/accept`, { method: "POST" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not accept invite";
    throw new Error(message);
  }
}
