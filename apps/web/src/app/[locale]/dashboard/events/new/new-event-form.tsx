"use client";

import { useRouter } from "@/i18n/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateEventSchema, type CreateEventInput } from "@seat-snaps/shared";
import { useCreateEvent } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

interface Props {
  onClose?: () => void;
}

export function NewEventForm({ onClose }: Props) {
  const router = useRouter();
  const t = useTranslations("event");
  const tCommon = useTranslations("common");
  const { mutateAsync, isPending, error } = useCreateEvent();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventSchema),
    defaultValues: {
      hasSeating: true,
      rsvpEnabled: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  async function onSubmit(data: CreateEventInput) {
    const event = await mutateAsync(data);
    onClose?.();
    router.push(`/dashboard/events/${event.id}`);
  }

  function handleCancel() {
    if (onClose) onClose();
    else router.back();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error.message}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="event-title">{t("overview.form.titleRequired")}</Label>
        <Input id="event-title" {...register("title")} placeholder={t("new.titlePlaceholder")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-description">{t("overview.form.description")}</Label>
        <Textarea id="event-description" {...register("description")} placeholder={t("overview.form.descriptionPlaceholder")} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event-date">{t("overview.form.startDate")}</Label>
          <DateTimePicker id="event-date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-end-date">{t("overview.form.endDate")}</Label>
          <DateTimePicker id="event-end-date" {...register("endDate")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-location">{t("overview.form.location")}</Label>
        <Input id="event-location" {...register("location")} placeholder={t("overview.form.locationPlaceholder")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-timezone">{t("overview.form.timezone")}</Label>
        <Input id="event-timezone" {...register("timezone")} placeholder={t("overview.form.timezonePlaceholder")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-type">{t("overview.form.type")}</Label>
        <Select id="event-type" {...register("type")}>
          <option value="">{t("overview.form.selectType")}</option>
          <option value="wedding">{t("types.wedding")}</option>
          <option value="birthday">{t("types.birthday")}</option>
          <option value="corporate">{t("types.corporate")}</option>
          <option value="other">{t("types.other")}</option>
        </Select>
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      <div className="flex items-center gap-3 rounded-md border p-3">
        <Controller
          name="hasSeating"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="event-has-seating"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <div>
          <Label htmlFor="event-has-seating" className="cursor-pointer font-medium">
            {t("overview.form.assignedSeating")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t("overview.form.assignedSeatingDesc")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-md border p-3">
        <Controller
          name="rsvpEnabled"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="event-rsvp-enabled"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <div>
          <Label htmlFor="event-rsvp-enabled" className="cursor-pointer font-medium">
            {t("new.rsvpSelfReg")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t("new.rsvpSelfRegDesc")}
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("new.creating") : t("new.createEvent")}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
