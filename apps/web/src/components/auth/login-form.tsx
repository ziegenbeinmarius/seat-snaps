"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import type { ActionResult } from "@/actions/auth";

const initialState: ActionResult | null = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => loginAction(formData),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

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
          autoComplete="current-password"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
