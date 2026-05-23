import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { EventHeroStrip } from "@/components/events/event-hero-strip";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { loadEvent } from "@/lib/load-event";
import { setRequestLocale } from "next-intl/server";

interface Props {
  children: ReactNode;
  params: Promise<{ id: string; locale: string }>;
}

export default async function OrganizerEventLayout({ children, params }: Props) {
  const { id, locale } = await params;
  setRequestLocale(locale);
  const event = await loadEvent(id, "/organizer");

  return (
    <div>
      <EventHeroStrip
        event={event}
        variant="mobile"
        backButton={
          <Link
            href="/organizer"
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
        action={
          <SettingsDropdown
            compact
            showProfile={false}
            showSignOut
          />
        }
      />

      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
