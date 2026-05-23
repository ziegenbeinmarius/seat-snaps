"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Globe, LogOut, Settings, User, Shield, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SettingsDropdownProps {
  /** Display name shown on the trigger button */
  userName?: string | null;
  /** Whether to show the Admin link */
  isAdmin?: boolean;
  /** Whether to show the Profile link */
  showProfile?: boolean;
  /** Profile link href (defaults to /dashboard/profile) */
  profileHref?: string;
  /** Whether to show the Sign Out link (default true) */
  showSignOut?: boolean;
  /** Compact icon-only trigger for tight spaces */
  compact?: boolean;
}

export function SettingsDropdown({
  userName,
  isAdmin = false,
  showProfile = true,
  profileHref = "/dashboard/profile",
  showSignOut = true,
  compact = false,
}: SettingsDropdownProps) {
  const t = useTranslations("nav");
  const tLang = useTranslations("languageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(newLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(28_65%_44%)]"
            style={{ background: "rgba(255,255,255,0.2)", color: "inherit" }}
            aria-label={t("admin")}
          >
            <Settings className="h-4 w-4" />
          </button>
        ) : (
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[rgba(200,175,140,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(28_65%_44%)] disabled:opacity-50"
            style={{ color: "hsl(24 12% 20%)", border: "1px solid hsl(33 18% 82%)" }}
            disabled={isPending}
          >
            {userName ? (
              <span className="max-w-[120px] truncate">{userName}</span>
            ) : (
              <Settings className="h-3.5 w-3.5" />
            )}
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {userName && !compact && (
          <>
            <DropdownMenuLabel className="truncate">{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          {showProfile && (
            <DropdownMenuItem asChild>
              <Link href={profileHref} className="flex w-full cursor-pointer items-center gap-2">
                <User className="h-4 w-4 opacity-60" />
                {t("myProfile")}
              </Link>
            </DropdownMenuItem>
          )}

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex w-full cursor-pointer items-center gap-2">
                <Shield className="h-4 w-4 opacity-60" />
                {t("admin")}
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Language sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <Globe className="h-4 w-4 opacity-60" />
            {tLang("label")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {routing.locales.map((loc) => (
              <DropdownMenuItem
                key={loc}
                className={loc === locale ? "font-semibold" : ""}
                onSelect={() => handleLocaleChange(loc)}
              >
                {loc === locale && (
                  <span className="mr-1 text-[hsl(28_65%_44%)]">✓</span>
                )}
                {tLang(loc as "en" | "sv" | "de")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {showSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/logout" className="flex w-full cursor-pointer items-center gap-2">
                <LogOut className="h-4 w-4 opacity-60" />
                {t("signOut")}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
