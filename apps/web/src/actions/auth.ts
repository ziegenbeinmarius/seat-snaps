"use server";

import { signIn, signOut } from "@/auth";
import { RegisterSchema } from "@seat-snaps/shared";
import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  redirect("/dashboard");
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

export async function logoutAction(): Promise<void> {
  try {
    await signOut({ redirect: false });
  } catch {
    // Ignore and clear cookies below as a fallback.
  }

  const cookieStore = await cookies();
  const baseNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];

  const allCookies = cookieStore.getAll().map((cookie) => cookie.name);

  for (const baseName of baseNames) {
    cookieStore.delete(baseName);
    for (const name of allCookies) {
      if (name.startsWith(`${baseName}.`)) {
        cookieStore.delete(name);
      }
    }
  }

  redirect("/login");
}
