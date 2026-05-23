"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { UpdateEventSchema, type UpdateEventInput } from "@seat-snaps/shared";
import { useEvent, useUpdateEvent } from "@/lib/api/events";
import { useAttendees } from "@/lib/api/attendees";
import { useTables } from "@/lib/api/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  eventId: string;
}

function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventOverviewPanel({ eventId }: Props) {
  const t = useTranslations("event.overview");
  const tForm = useTranslations("event.overview.form");
  const tTypes = useTranslations("event.types");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { data: event, isLoading } = useEvent(eventId);
  const { data: tables = [] } = useTables(eventId);
  const { data: attendees = [] } = useAttendees(eventId);
  const updateMutation = useUpdateEvent(eventId);
  const [editOpen, setEditOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [copiedRsvp, setCopiedRsvp] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(UpdateEventSchema),
  });

  const watchedHasSeating = useWatch({ control, name: "hasSeating" });
  const watchedRsvpEnabled = useWatch({ control, name: "rsvpEnabled" });

  function openEdit() {
    if (!event) return;
    reset({
      title: event.title,
      description: event.description ?? undefined,
      date: toDatetimeLocal(event.date) as unknown as Date,
      endDate: event.endDate ? (toDatetimeLocal(event.endDate) as unknown as Date) : undefined,
      location: event.location ?? undefined,
      timezone: event.timezone ?? undefined,
      type: event.type,
      hasSeating: event.hasSeating,
      rsvpEnabled: event.rsvpEnabled,
    });
    updateMutation.reset();
    setSaved(false);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
  }

  async function onSubmit(data: UpdateEventInput) {
    try {
      await updateMutation.mutateAsync(data);
      setSaved(true);
      setEditOpen(false);
    } catch {
      // error displayed via updateMutation.error
    }
  }

  if (isLoading || !event) {
    return <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>;
  }

  const startDate = new Date(event.date).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = new Date(event.date).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const pendingCount = attendees.filter((a) => a.status === "pending").length;

  async function toggleFinished() {
    await updateMutation.mutateAsync({ isFinished: !event!.isFinished });
    setFinishConfirmOpen(false);
  }

  function getRsvpLink() {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/join/event/${eventId}`;
  }

  function getRsvpQrUrl() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
    return `/api/proxy/events/${eventId}/qr/event?appUrl=${encodeURIComponent(appUrl)}`;
  }

  async function copyRsvpLink() {
    await navigator.clipboard.writeText(getRsvpLink());
    setCopiedRsvp(true);
    setTimeout(() => setCopiedRsvp(false), 2000);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          {saved ? (
            <p className="text-sm font-medium text-green-600">{tCommon("changessaved")}</p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {event?.isFinished ? (
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {tCommon("finished")}
              </div>
            ) : null}
            <Button
              size="sm"
              variant={event?.isFinished ? "outline" : "default"}
              onClick={() => setFinishConfirmOpen(true)}
              disabled={updateMutation.isPending}
            >
              {event?.isFinished ? t("reopenEvent") : t("markAsFinished")}
            </Button>
            <Button size="sm" variant="outline" onClick={openEdit}>
              {tCommon("edit")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("details")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("date")}</span>
                <span>{startDate}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("time")}</span>
                <span>{startTime}</span>
              </div>
              {event.location && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("location")}</span>
                  <span>{event.location}</span>
                </div>
              )}
              {event.timezone && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("timezone")}</span>
                  <span>{event.timezone}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("seating")}</span>
                <span>{event.hasSeating ? t("assignedSeating") : t("noSeatingPlan")}</span>
              </div>
              {event.rsvpEnabled && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("rsvp")}</span>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <code className="text-xs bg-muted border rounded px-2 py-0.5 truncate max-w-[220px]">
                      {getRsvpLink()}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 gap-1 text-xs"
                      onClick={copyRsvpLink}
                    >
                      {copiedRsvp ? (
                        <><Check className="h-3 w-3 text-green-600" />{tCommon("copied")}</>
                      ) : (
                        <><Copy className="h-3 w-3" />{tCommon("copy")}</>
                      )}
                    </Button>
                    {pendingCount > 0 && (
                      <Link href={`/dashboard/events/${eventId}/attendees?status=pending`}>
                        <Badge className="cursor-pointer bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                          {t("pending", { count: pendingCount })}
                        </Badge>
                      </Link>
                    )}
                  </div>
                </div>
              )}
              {event.endDate && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">{t("ends")}</span>
                  <span>
                    {new Date(event.endDate).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("description")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{event.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("editEvent")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {updateMutation.error && (
              <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {updateMutation.error.message}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-title">{tForm("titleRequired")}</Label>
              <Input id="edit-title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description">{tForm("description")}</Label>
              <Textarea id="edit-description" {...register("description")} placeholder={tForm("descriptionPlaceholder")} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-date">{tForm("startDate")}</Label>
                <DateTimePicker id="edit-date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-end-date">{tForm("endDate")}</Label>
                <DateTimePicker id="edit-end-date" {...register("endDate")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-location">{tForm("location")}</Label>
              <Input id="edit-location" {...register("location")} placeholder={tForm("locationPlaceholder")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-timezone">{tForm("timezone")}</Label>
              <Input id="edit-timezone" {...register("timezone")} placeholder={tForm("timezonePlaceholder")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-type">{tForm("type")}</Label>
              <Select id="edit-type" {...register("type")}>
                <option value="wedding">{tTypes("wedding")}</option>
                <option value="birthday">{tTypes("birthday")}</option>
                <option value="corporate">{tTypes("corporate")}</option>
                <option value="other">{tTypes("other")}</option>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Controller
                name="hasSeating"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="edit-has-seating"
                    className="mt-0.5"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div>
                <Label htmlFor="edit-has-seating" className="cursor-pointer font-medium">
                  {tForm("assignedSeating")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {tForm("assignedSeatingDesc")}
                </p>
                {!watchedHasSeating && tables.length > 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    {tables.length === 1
                      ? tForm("assignedSeatingWarning", { count: tables.length })
                      : tForm("assignedSeatingWarningPlural", { count: tables.length })}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-md border p-3 space-y-3">
              <div className="flex items-start gap-3">
                <Controller
                  name="rsvpEnabled"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="edit-rsvp-enabled"
                      className="mt-0.5"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div>
                  <Label htmlFor="edit-rsvp-enabled" className="cursor-pointer font-medium">
                    {tForm("rsvpSelfReg")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {tForm("rsvpSelfRegDesc")}
                  </p>
                </div>
              </div>

              {watchedRsvpEnabled && (
                <div className="space-y-3 rounded-md bg-muted/30 p-3">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">{tForm("rsvpQrCode")}</p>
                      <img
                        src={getRsvpQrUrl()}
                        alt="RSVP QR code"
                        className="h-24 w-24 rounded border"
                      />
                    </div>
                    {pendingCount > 0 && (
                      <div className="flex flex-col justify-center pt-5 gap-1">
                        <Link
                          href={`/dashboard/events/${eventId}/attendees?status=pending`}
                          onClick={closeEdit}
                        >
                          <Badge className="cursor-pointer bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                            {t("pending", { count: pendingCount })}
                          </Badge>
                        </Link>
                        <span className="text-xs text-muted-foreground">{t("awaitingApproval")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeEdit} disabled={updateMutation.isPending}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? tCommon("saving") : t("saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={finishConfirmOpen}
        onOpenChange={setFinishConfirmOpen}
        title={event?.isFinished ? t("reopenEventTitle") : t("markEventFinished")}
        description={
          event?.isFinished
            ? t("reopenEventDesc")
            : t("markEventFinishedDesc")
        }
        confirmLabel={event?.isFinished ? t("reopen") : t("markAsFinished")}
        variant="default"
        onConfirm={toggleFinished}
      />
    </>
  );
}
