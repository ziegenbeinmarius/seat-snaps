import { redirect } from "@/i18n/navigation";
import { SeatingLive } from "./seating-live";
import { getTranslations, setRequestLocale } from "next-intl/server";

const API_URL = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

interface Props {
  params: Promise<{ eventId: string; locale: string }>;
}

export default async function SeatingPage({ params }: Props) {
  const { eventId, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("attendeeApp.seating");

  const res = await fetch(`${API_URL}/api/events/${eventId}/info`, { cache: "no-store" });
  if (res.ok) {
    const info = (await res.json()) as { hasSeating: boolean };
    if (!info.hasSeating) {
      redirect(`/event/${eventId}`);
    }
  }

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <div className="mb-6 px-2">
        <h1 className="event-heading text-2xl font-semibold text-white drop-shadow-sm">
          {t("title")}
        </h1>
        <p className="event-body mt-0.5 text-sm text-white/65">{t("findSeat")}</p>
      </div>

      <SeatingLive eventId={eventId} />
    </div>
  );
}
