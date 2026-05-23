import { logoutAction } from "@/actions/auth";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function LogoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.logout");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-10">
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">{t("description")}</p>
      <form action={logoutAction} className="mt-6">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("signOut")}
        </button>
      </form>
    </main>
  );
}
