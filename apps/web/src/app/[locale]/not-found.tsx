import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="text-6xl font-bold text-muted-foreground">{t("404")}</div>
      <h1 className="text-2xl font-semibold">{t("pageNotFound")}</h1>
      <p className="text-muted-foreground">{t("pageNotFoundDesc")}</p>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {t("backToDashboard")}
      </Link>
    </div>
  );
}
