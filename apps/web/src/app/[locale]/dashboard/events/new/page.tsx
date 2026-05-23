import type { Metadata } from "next";
import { NewEventForm } from "@/components/events/new-event-form";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const metadata: Metadata = { title: "New Event" };

export default async function NewEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("event.new");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("createEvent")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <NewEventForm />
    </div>
  );
}
