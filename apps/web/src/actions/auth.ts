"use server";

import { signIn, signOut } from "@/auth";
import { RegisterSchema, ChangePasswordSchema, UpdateProfileSchema } from "@seat-snaps/shared";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";

export type ActionResult = { error: string } | { success: true };

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const apiUrl = process.env.INTERNAL_API_URL ?? "http://localhost:3001";
  const res = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.message ?? "Registration failed" };
  }

  // Auto sign-in after registration
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirect: false,
  });

  redirect("/select-plan");
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw err;
  }
}

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  };

  const parsed = ChangePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to change password" };
  }
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
  };

  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  try {
    await apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(parsed.data),
    });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update profile" };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    // Auth.js v5: signOut clears the session cookie then throws NEXT_REDIRECT.
    // Re-throwing the redirect lets the Set-Cookie header propagate correctly.
    await signOut({ redirectTo: "/login" });
  } catch (e) {
    if (isRedirectError(e)) throw e;

    // Real error: Auth.js couldn't sign out, so manually scrub the cookies.
    const cookieStore = await cookies();
    const baseNames = [
      "authjs.session-token",
      "__Secure-authjs.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
    ];
    const allCookies = cookieStore.getAll().map((c) => c.name);
    for (const baseName of baseNames) {
      cookieStore.delete(baseName);
      for (const name of allCookies) {
        if (name.startsWith(`${baseName}.`)) cookieStore.delete(name);
      }
    }
    redirect("/login");
  }
}
