"use client";

import { Megaphone, Bell } from "lucide-react";
import { useAttendeeBroadcasts } from "@/lib/api/broadcasts";
import { useSocket } from "@/components/broadcast/socket-provider";
import type { BroadcastResponse } from "@seat-snaps/shared";
import { MobilePageHeading } from "@/components/mobile/mobile-page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  eventId: string;
}

function BroadcastCard({ broadcast, locale }: { broadcast: BroadcastResponse; locale: string }) {
  const createdAt = new Date(broadcast.createdAt);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 event-card-muted-text" />
          <div className="flex-1 min-w-0">
            <p className="event-heading font-semibold event-card-title">{broadcast.title}</p>
            <p className="event-body mt-1 text-sm event-card-desc">{broadcast.content}</p>
            <p className="event-body mt-2 text-xs event-card-muted-text">
              {createdAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}{" "}
              {createdAt.toLocaleDateString(locale)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnnouncementsClient({ eventId }: Props) {
  const t = useTranslations("attendeeApp.announcements");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { data: historicBroadcasts = [], isLoading } = useAttendeeBroadcasts(eventId);
  const { broadcasts: liveBroadcasts } = useSocket();

  const seen = new Set<string>();
  const allBroadcasts: BroadcastResponse[] = [];
  for (const b of [...liveBroadcasts, ...historicBroadcasts]) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      allBroadcasts.push(b);
    }
  }

  return (
    <div className="min-h-screen px-4 pb-6 pt-8 event-body">
      <MobilePageHeading className="px-2">{t("title")}</MobilePageHeading>

      {isLoading && (
        <p className="text-sm text-white/60">{tCommon("loading")}</p>
      )}

      {!isLoading && allBroadcasts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Bell className="h-8 w-8 event-card-muted-text" />
            <p className="event-body text-sm event-card-muted-text">{t("noAnnouncements")}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {allBroadcasts.map((b) => (
          <BroadcastCard key={b.id} broadcast={b} locale={locale} />
        ))}
      </div>
    </div>
  );
}
