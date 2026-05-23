"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/actions/auth";
import type { ActionResult } from "@/actions/auth";
import { useTranslations } from "next-intl";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export function ProfileForm({ initialName, initialEmail }: ProfileFormProps) {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth.login");

  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => updateProfileAction(formData),
    null,
  );

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => changePasswordAction(formData),
    null,
  );

  return (
    <div className="space-y-8">
      {/* Profile details */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255, 252, 247, 0.75)", border: "1px solid rgba(220, 210, 195, 0.6)" }}
      >
        <h2
          className="mb-5 text-xl font-semibold"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          {t("profileDetails")}
        </h2>

        <form action={profileAction} className="space-y-4">
          {profileState && "error" in profileState && (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {profileState.error}
            </p>
          )}
          {profileState && "success" in profileState && (
            <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
              {t("updatedSuccessfully")}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium" style={{ color: "hsl(24 12% 25%)" }}>
              {tAuth("emailLabel").replace("Email", "Name")}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={initialName}
              autoComplete="name"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium" style={{ color: "hsl(24 12% 25%)" }}>
              {tAuth("emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={initialEmail}
              autoComplete="email"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={profilePending}
            className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "hsl(28 65% 44%)" }}
          >
            {profilePending ? t("saving") : t("saveChanges")}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255, 252, 247, 0.75)", border: "1px solid rgba(220, 210, 195, 0.6)" }}
      >
        <h2
          className="mb-5 text-xl font-semibold"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          {t("changePassword")}
        </h2>

        <form action={passwordAction} className="space-y-4">
          {passwordState && "error" in passwordState && (
            <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {passwordState.error}
            </p>
          )}
          {passwordState && "success" in passwordState && (
            <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
              {t("passwordChanged")}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="currentPassword" className="text-sm font-medium" style={{ color: "hsl(24 12% 25%)" }}>
              {t("currentPassword")}
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="newPassword" className="text-sm font-medium" style={{ color: "hsl(24 12% 25%)" }}>
              {t("newPassword")}
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={passwordPending}
            className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "hsl(28 65% 44%)" }}
          >
            {passwordPending ? t("updating") : t("updatePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
