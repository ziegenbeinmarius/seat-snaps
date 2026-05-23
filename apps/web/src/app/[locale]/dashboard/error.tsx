"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const tCommon = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">{t("somethingWrong")}</h2>
      <p className="text-sm text-muted-foreground">{error.message || t("unexpectedErrorWithMsg")}</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {tCommon("tryAgain")}
        </button>
        <Link href="/dashboard" className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent">
          {t("backToDashboard")}
        </Link>
      </div>
    </div>
  );
}
