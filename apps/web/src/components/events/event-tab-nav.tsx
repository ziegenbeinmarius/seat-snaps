"use client";

import type { Route } from "next";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

export interface TabLink {
  href: Route;
  label: string;
  exact?: boolean;
}

interface EventTabNavProps {
  links: TabLink[];
  variant?: "desktop" | "mobile";
}

function DesktopNav({ links }: { links: TabLink[] }) {
  // usePathname from @/i18n/navigation strips the locale prefix, so
  // `pathname.startsWith(href)` works regardless of the active locale.
  const pathname = usePathname();

  return (
    <nav className="border-border -mx-1 overflow-x-auto border-b pb-2">
      <div className="flex min-w-max gap-2 px-1">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === (href as string) : pathname.startsWith(href as string);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileNav({ links }: { links: TabLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-40 overflow-x-auto border-b border-[rgba(200,175,140,0.3)]"
      style={{ background: "rgba(252, 248, 243, 0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex min-w-max px-4">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === (href as string) : pathname.startsWith(href as string);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-[hsl(28_65%_44%)] text-[hsl(28_65%_44%)]"
                  : "border-transparent text-[hsl(28_8%_52%)] hover:text-[hsl(28_8%_35%)]",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function EventTabNav({ links, variant = "desktop" }: EventTabNavProps) {
  if (variant === "mobile") return <MobileNav links={links} />;
  return <DesktopNav links={links} />;
}
