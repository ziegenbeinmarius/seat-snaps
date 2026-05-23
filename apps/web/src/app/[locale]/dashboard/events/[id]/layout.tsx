import type { ReactNode } from "react";
import type { Route } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventHeroStrip } from "@/components/events/event-hero-strip";
import { EventTabNav, type TabLink } from "@/components/events/event-tab-nav";
import { loadEvent } from "@/lib/load-event";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string; locale: string }>;
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const event = await loadEvent(id, "/dashboard");
  const base = `/dashboard/events/${id}`;
  const t = await getTranslations("event");

  const links: TabLink[] = [
    { href: base as Route, label: t("tabs.overview"), exact: true },
    { href: `${base}/team` as Route, label: t("tabs.team") },
    { href: `${base}/attendees` as Route, label: t("tabs.attendees") },
    ...(event.hasSeating
      ? [{ href: `${base}/seating` as Route, label: t("tabs.seating") }]
      : []),
    { href: `${base}/photos` as Route, label: t("tabs.photos") },
    { href: `${base}/theme` as Route, label: t("tabs.theme") },
    { href: `${base}/schedule` as Route, label: t("tabs.schedule") },
    { href: `${base}/broadcasts` as Route, label: t("tabs.broadcasts") },
  ];

  return (
    <div className="space-y-6">
      <EventHeroStrip
        event={event}
        variant="desktop"
        backButton={
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="shrink-0 border border-white/30 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              {t("backToEvents")}
            </Link>
          </Button>
        }
      />

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href={`/organizer/events/${id}` as Route}>
            <ExternalLink className="h-3.5 w-3.5" />
            {t("organizerView")}
          </Link>
        </Button>
      </div>

      <EventTabNav links={links} variant="desktop" />

      {children}
    </div>
  );
}
