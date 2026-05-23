import { redirect } from "next/navigation";

/**
 * Root page — redirects to the default locale (/en).
 *
 * This is a safety-net for cases where the next-intl middleware rewrite is
 * bypassed (e.g. static export, edge-cache miss, or middleware chain issues).
 * The middleware already issues a 307 redirect for `/` → `/en`, so this page
 * should rarely be reached in practice.
 */
export default function RootPage() {
  redirect("/en");
}
