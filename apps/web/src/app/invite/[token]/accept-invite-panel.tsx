"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInviteAction } from "@/actions/invites";
import { useInviteByToken } from "@/lib/api/invites";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AcceptInvitePanel({ token }: { token: string }) {
  const router = useRouter();
  const { data: invite, isLoading, error } = useInviteByToken(token);
  const [isPending, startTransition] = useTransition();
  const [acceptError, setAcceptError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading invite…
        </CardContent>
      </Card>
    );
  }

  if (error || !invite) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="font-medium text-destructive">Invalid or expired invite</p>
          <p className="mt-1 text-sm text-muted-foreground">{error?.message}</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function handleAccept() {
    setAcceptError(null);
    startTransition(async () => {
      try {
        await acceptInviteAction(token);
        router.push("/dashboard");
      } catch (err) {
        const message = err instanceof Error
          ? err.message
          : "Could not accept invite. Please sign in and try again.";
        setAcceptError(message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>You&apos;re invited</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join as an organiser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="font-semibold">{invite.event.title}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(invite.event.date).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {invite.event.location && (
            <p className="text-sm text-muted-foreground">{invite.event.location}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Role:</span>
          <Badge variant="secondary" className="capitalize">{invite.role}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Invite expires{" "}
          {new Date(invite.expiresAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {acceptError && <p className="text-sm text-destructive">{acceptError}</p>}
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={handleAccept} disabled={isPending}>
          {isPending ? "Accepting…" : "Accept Invite"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/login")}>
          Sign in first
        </Button>
      </CardFooter>
    </Card>
  );
}
