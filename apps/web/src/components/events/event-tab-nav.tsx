"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TabLink {
  href: Route;
  label: string;
  isActive?: (pathname: string) => boolean;
}

interface EventTabNavProps {
  links: TabLink[];
  variant?: "desktop" | "mobile";
}

function DesktopNav({ links }: { links: TabLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="border-border -mx-1 overflow-x-auto border-b pb-2">
      <div className="flex min-w-max gap-2 px-1">
        {links.map(({ href, label, isActive }) => {
          const active = isActive ? isActive(pathname) : pathname === (href as string);
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
        {links.map(({ href, label, isActive }) => {
          const active = isActive ? isActive(pathname) : pathname === (href as string);
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
