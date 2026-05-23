import { AlertTriangle, CalendarDays } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { EventResponse } from "@seat-snaps/shared";
import { NewEventDialog } from "@/components/events/new-event-dialog";
import { EventCard } from "@/components/events/event-card";
import { UpgradeBanner } from "@/components/credits/upgrade-banner";
import { getTranslations } from "next-intl/server";

interface EventListPageProps {
  variant: "desktop" | "mobile";
  eventHrefPrefix: string;
}

async function fetchEvents(): Promise<{ events: EventResponse[]; error: string | null }> {
  try {
    return { events: await apiRequest<EventResponse[]>("/events"), error: null };
  } catch (error) {
    return {
      events: [],
      error: error instanceof Error ? error.message : "Could not load events.",
    };
  }
}

async function DesktopHeader() {
  const t = await getTranslations("dashboard");
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
        >
          {t("myEvents")}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 50%)" }}>
          {t("myEventsSubtitle")}
        </p>
      </div>
      <NewEventDialog />
    </div>
  );
}

async function MobileHeader() {
  const t = await getTranslations("dashboard");
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-cormorant, Georgia, serif)", color: "hsl(24 12% 20%)" }}
      >
        {t("myEvents")}
      </h1>
      <NewEventDialog
        iconOnly
        className="flex h-10 w-10 items-center justify-center rounded-full shadow-md"
        style={{ background: "hsl(28 65% 44%)", color: "white" }}
      />
    </div>
  );
}

async function EmptyState({ variant }: { variant: "desktop" | "mobile" }) {
  const t = await getTranslations("dashboard");
  return (
    <div className="dashboard-glass rounded-2xl px-6 py-16 text-center">
      {variant === "mobile" && (
        <CalendarDays className="mx-auto mb-4 h-10 w-10 opacity-30" />
      )}
      <p
        className={variant === "desktop" ? "mb-4 text-base" : "mb-4 text-sm"}
        style={{ color: "hsl(28 8% 50%)" }}
      >
        {t("noEvents")}
      </p>
      {variant === "desktop" ? (
        <NewEventDialog />
      ) : (
        <NewEventDialog
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
          style={{ background: "hsl(28 65% 44%)" }}
        />
      )}
    </div>
  );
}

async function ErrorState({ message, variant }: { message: string; variant: "desktop" | "mobile" }) {
  const t = await getTranslations("errors");
  const tCommon = await getTranslations("common");
  return (
    <div className="dashboard-glass rounded-2xl px-6 py-12 text-center">
      <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
      <h2
        className={
          variant === "desktop" ? "mb-2 text-lg font-semibold" : "mb-2 text-base font-semibold"
        }
      >
        {t("couldNotLoad")}
      </h2>
      <p className="mx-auto mb-5 max-w-md text-sm text-muted-foreground">{message}</p>
      <a
        href={variant === "desktop" ? "/dashboard" : "/organizer"}
        className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        {tCommon("tryAgain")}
      </a>
    </div>
  );
}

function EventGrid({
  events,
  hrefPrefix,
  variant,
}: {
  events: EventResponse[];
  hrefPrefix: string;
  variant: "desktop" | "mobile";
}) {
  const cardVariant = variant === "desktop" ? "grid" : "list";
  const wrapperClass =
    variant === "desktop" ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3";

  return (
    <div className={wrapperClass}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          href={`${hrefPrefix}/${event.id}`}
          variant={cardVariant}
        />
      ))}
    </div>
  );
}

export async function EventListPage({ variant, eventHrefPrefix }: EventListPageProps) {
  const { events, error } = await fetchEvents();
  const isDesktop = variant === "desktop";

  return (
    <div className={isDesktop ? "space-y-8" : "px-4 py-6"}>
      {isDesktop ? <DesktopHeader /> : <MobileHeader />}

      <UpgradeBanner />

      {error ? (
        <ErrorState message={error} variant={variant} />
      ) : events.length === 0 ? (
        <EmptyState variant={variant} />
      ) : (
        <EventGrid events={events} hrefPrefix={eventHrefPrefix} variant={variant} />
      )}
    </div>
  );
}
