import type { Metadata } from "next";
import { Link, redirect } from "@/i18n/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.login" });
  return { title: t("signIn") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session) redirect("/dashboard");

  const t = await getTranslations("auth.login");

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)",
      }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / brand */}
        <div className="text-center">
          <h1
            className="text-4xl font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-cormorant, Georgia, serif)",
              color: "hsl(24 12% 20%)",
            }}
          >
            SeatSnaps
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
            {t("title")}
          </p>
        </div>

        {/* Glass card */}
        <div className="dashboard-glass rounded-2xl p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium hover:underline"
            style={{ color: "hsl(28 65% 44%)" }}
          >
            {t("signUp")}
          </Link>
        </p>
      </div>
    </main>
  );
}
