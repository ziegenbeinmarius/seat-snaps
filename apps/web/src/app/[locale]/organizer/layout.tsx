import React from "react";
import { requireAuth } from "@/lib/require-auth";
import { APP_BACKGROUND } from "@/lib/event-helpers";
import { OrganizerNav } from "./organizer-nav";
import { setRequestLocale } from "next-intl/server";

export default async function OrganizerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAuth();

  return (
    <div
      className="min-h-screen"
      style={{ background: APP_BACKGROUND }}
    >
      <main className="mx-auto max-w-lg pb-20">{children}</main>
      <OrganizerNav />
    </div>
  );
}
