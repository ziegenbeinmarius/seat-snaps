"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ChevronDown, LayoutDashboard, LogOut, Shield, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LandingHeaderUser {
  name?: string | null;
  email?: string | null;
  isAdmin?: boolean | null;
}

interface LandingHeaderProps {
  isLoggedIn?: boolean;
  user?: LandingHeaderUser | null;
}

function getProfileInitial(user?: LandingHeaderUser | null) {
  const value = user?.name?.trim() || user?.email?.trim() || "S";
  return value.charAt(0).toUpperCase();
}

export function LandingHeader({ isLoggedIn, user }: LandingHeaderProps) {
  const t = useTranslations("nav");
  const isAuthenticated = Boolean(user || isLoggedIn);
  const displayName = user?.name?.trim() || user?.email?.trim() || t("myProfile");
  const email = user?.email?.trim();
  const navClassName = isAuthenticated
    ? "mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6"
    : "mx-auto flex max-w-5xl items-center justify-between px-6 py-3";
  const logoClassName = isAuthenticated
    ? "flex shrink-0 items-center gap-2 sm:gap-2.5"
    : "flex items-center gap-2.5";
  const wordmarkClassName = isAuthenticated
    ? "text-xl font-semibold tracking-tight sm:text-2xl"
    : "text-2xl font-semibold tracking-tight";
  const actionClassName = isAuthenticated
    ? "flex min-w-0 items-center gap-2 sm:gap-3"
    : "flex items-center gap-3";

  return (
    <header
      className="fixed top-0 right-0 left-0"
      style={{
        zIndex: 50,
        background: "rgba(245, 237, 224, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(196, 149, 106, 0.1)",
      }}
    >
      <nav className={navClassName}>
        <Link href="/" className={logoClassName}>
          <Image
            src="/images/koala-logo.png"
            alt=""
            width={38}
            height={32}
            className="hover:animate-logo-bounce transition-transform"
          />
          <span
            className={wordmarkClassName}
            style={{
              fontFamily: "var(--font-cormorant, Georgia, serif)",
              color: "hsl(24 12% 20%)",
            }}
          >
            SeatSnaps
          </span>
        </Link>

        <div className={actionClassName}>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex min-w-0 items-center gap-0 rounded-full border px-1 py-1 transition-colors hover:bg-[rgba(200,175,140,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(28_65%_44%)] sm:gap-2 sm:rounded-lg sm:px-1.5 sm:pr-3"
                  style={{ borderColor: "hsl(33 18% 82%)", color: "hsl(24 12% 20%)" }}
                  aria-label={t("myProfile")}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: "hsl(28 65% 44%)" }}
                    aria-hidden="true"
                  >
                    {getProfileInitial(user)}
                  </span>
                  <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[8rem] truncate text-sm leading-4 font-semibold">
                      {displayName}
                    </span>
                    {email ? (
                      <span className="block max-w-[8rem] truncate text-xs leading-4 opacity-65">
                        {email}
                      </span>
                    ) : null}
                  </span>
                  <ChevronDown
                    className="hidden h-3.5 w-3.5 shrink-0 opacity-60 sm:block"
                    aria-hidden="true"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: "hsl(28 65% 44%)" }}
                      aria-hidden="true"
                    >
                      {getProfileInitial(user)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[hsl(24_12%_20%)]">
                        {displayName}
                      </span>
                      {email ? (
                        <span className="block truncate text-xs font-normal text-[hsl(28_8%_50%)]">
                          {email}
                        </span>
                      ) : null}
                    </span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="flex w-full cursor-pointer items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4 opacity-60" />
                      {t("dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/profile"
                      className="flex w-full cursor-pointer items-center gap-2"
                    >
                      <User className="h-4 w-4 opacity-60" />
                      {t("myProfile")}
                    </Link>
                  </DropdownMenuItem>
                  {user?.isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex w-full cursor-pointer items-center gap-2">
                        <Shield className="h-4 w-4 opacity-60" />
                        {t("admin")}
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/logout" className="flex w-full cursor-pointer items-center gap-2">
                    <LogOut className="h-4 w-4 opacity-60" />
                    {t("signOut")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t("getStarted")}</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
