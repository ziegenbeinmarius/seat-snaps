"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { acceptInviteAction, acceptWithRegistrationAction } from "@/actions/invites";
import { useInviteByToken } from "@/lib/api/invites";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionResult } from "@/actions/auth";

const initialState: ActionResult | null = null;

function InviteDetails({ invite }: { invite: { event: { title: string; date: string | Date; location?: string | null }; role: string; expiresAt: string | Date } }) {
  return (
    <div className="space-y-3">
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
    </div>
  );
}

function AuthenticatedPanel({ token, invite }: { token: string; invite: Parameters<typeof InviteDetails>[0]["invite"] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [acceptError, setAcceptError] = useState<string | null>(null);

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
        <CardDescription>You&apos;ve been invited to join as an organiser.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <InviteDetails invite={invite} />
        {acceptError && <p className="text-sm text-destructive">{acceptError}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAccept} disabled={isPending}>
          {isPending ? "Accepting…" : "Accept Invite"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function RegistrationPanel({ token, invite }: { token: string; invite: Parameters<typeof InviteDetails>[0]["invite"] & { email?: string } }) {
  const [state, formAction, pending] = useActionState(
    acceptWithRegistrationAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>You&apos;re invited</CardTitle>
        <CardDescription>Create an account to join as an organiser.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InviteDetails invite={invite} />
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium mb-3">Create your account</p>
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="token" value={token} />
            {state && "error" in state && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={invite.email ?? ""}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Min. 8 characters"
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Creating account…" : "Create account & accept invite"}
            </Button>
          </form>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=/invite/${token}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AcceptInvitePanel({ token, isAuthenticated }: { token: string; isAuthenticated: boolean }) {
  const router = useRouter();
  const { data: invite, isLoading, error } = useInviteByToken(token);

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

  if (isAuthenticated) {
    return <AuthenticatedPanel token={token} invite={invite} />;
  }

  return <RegistrationPanel token={token} invite={invite} />;
}
