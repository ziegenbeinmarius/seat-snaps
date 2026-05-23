import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAuth } from "@/lib/require-auth";
import { apiRequest } from "@/lib/api";
import type { UserProfileResponse } from "@seat-snaps/shared";
import { ProfileForm } from "./profile-form";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = { title: "My Profile — SeatSnaps" };

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");

  const session = await requireAuth();

  let profile: UserProfileResponse | null = null;
  try {
    profile = await apiRequest<UserProfileResponse>("/auth/me");
  } catch {
    // Fall back to session data
  }

  const name = profile?.name ?? session.user?.name ?? "";
  const email = profile?.email ?? session.user?.email ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm transition-colors hover:opacity-70"
          style={{ color: "hsl(28 65% 44%)" }}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>
      </div>

      <div>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          {t("title")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 50%)" }}>
          {t("subtitle")}
        </p>
      </div>

      <ProfileForm initialName={name} initialEmail={email} />
    </div>
  );
}
