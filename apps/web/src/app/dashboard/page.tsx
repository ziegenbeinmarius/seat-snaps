import type { Metadata } from "next";
import { auth } from "@/auth";
import { logoutAction } from "@/actions/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {session?.user?.name ?? "Organizer"}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold text-card-foreground">Account</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-muted-foreground">Email</dt>
              <dd className="text-foreground">{session?.user?.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-muted-foreground">Name</dt>
              <dd className="text-foreground">{session?.user?.name}</dd>
            </div>
            {session?.user?.role && (
              <div className="flex gap-2">
                <dt className="font-medium text-muted-foreground">Role</dt>
                <dd className="capitalize text-foreground">{session.user.role}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </main>
  );
}
