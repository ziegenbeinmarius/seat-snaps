import type { Metadata } from "next";
import { auth } from "@/auth";
import { AcceptInvitePanel } from "./accept-invite-panel";

export const metadata: Metadata = { title: "Accept Invite" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let isAuthenticated = false;
  try {
    const session = await auth();
    isAuthenticated = !!session;
  } catch {
    // not authenticated
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <AcceptInvitePanel token={token} isAuthenticated={isAuthenticated} />
      </div>
    </main>
  );
}
