"use server";

import { redirect } from "@/i18n/navigation";
import { signIn } from "@/auth";
import { apiRequest } from "@/lib/api";
import { AcceptWithRegistrationSchema } from "@seat-snaps/shared";
import type { ActionResult } from "@/actions/auth";

export async function acceptInviteAction(token: string): Promise<void> {
  try {
    await apiRequest<void>(`/invites/${token}/accept`, { method: "POST" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not accept invite";
    throw new Error(message);
  }
}

export async function acceptWithRegistrationAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const token = formData.get("token") as string;
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = AcceptWithRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  const res = await fetch(`${apiUrl}/api/invites/${token}/accept-with-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: (body as { message?: string }).message ?? "Registration failed" };
  }

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/dashboard");
}
