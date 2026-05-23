import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });
  return { title: t("createAccount") };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session) redirect("/dashboard");

  const t = await getTranslations("auth.register");

  return (
    <main
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)",
      }}
    >
      <div className="w-full max-w-sm space-y-6">
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

        <div className="dashboard-glass rounded-2xl p-6">
          <RegisterForm />
        </div>

        <p className="text-center text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          {t("alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium hover:underline"
            style={{ color: "hsl(28 65% 44%)" }}
          >
            {t("signIn")}
          </Link>
        </p>
      </div>
    </main>
  );
}
