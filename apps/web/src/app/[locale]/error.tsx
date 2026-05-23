"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function RootError({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">{t("somethingWrong")}</h2>
      <p className="text-sm text-muted-foreground">{t("unexpectedError")}</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {tCommon("tryAgain")}
      </button>
    </div>
  );
}
