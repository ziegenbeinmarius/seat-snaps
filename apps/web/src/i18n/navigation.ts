/**
 * Locale-aware navigation utilities powered by next-intl.
 *
 * Import `Link`, `redirect`, `usePathname`, and `useRouter` from here
 * instead of from `next/link` / `next/navigation` whenever the destination
 * is an internal app route.  The wrappers automatically prepend the active
 * locale prefix (e.g. `/sv/dashboard`) so navigation never drops the user's
 * language.
 *
 * With `localePrefix: "as-needed"` the English (default) locale keeps clean
 * URLs with no prefix — all other locales get their prefix injected.
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
