"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(newLocale: string) {
    // next-intl's locale-aware router.replace handles prefix injection/removal
    // automatically — no manual string manipulation needed.
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only">{t("label")}</span>
      <select
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 cursor-pointer"
        aria-label={t("label")}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc as "en" | "sv" | "de")}
          </option>
        ))}
      </select>
    </div>
  );
}
