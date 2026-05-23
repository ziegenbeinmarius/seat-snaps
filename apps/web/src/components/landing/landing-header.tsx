"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

interface LandingHeaderProps {
  isLoggedIn?: boolean;
}

export function LandingHeader({ isLoggedIn }: LandingHeaderProps) {
  const t = useTranslations("nav");
  return (
    <header
      className="fixed top-0 left-0 right-0"
      style={{
        zIndex: 50,
        background: "rgba(245, 237, 224, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(196, 149, 106, 0.1)",
      }}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/koala-logo.png"
            alt=""
            width={38}
            height={32}
            className="transition-transform hover:animate-logo-bounce"
          />
          <span
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
          >
            SeatSnaps
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">{t("dashboard")}</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/profile">{t("myProfile")}</Link>
              </Button>
            </>
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
