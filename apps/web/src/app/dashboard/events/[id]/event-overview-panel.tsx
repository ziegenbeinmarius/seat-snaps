"use client";

import { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Copy, Check } from "lucide-react";
import Link from "next/link";
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
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const startDate = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = new Date(event.date).toLocaleTimeString("en-US", {
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
            <p className="text-sm font-medium text-green-600">Changes saved.</p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {event?.isFinished ? (
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Finished
              </div>
            ) : null}
            <Button
              size="sm"
              variant={event?.isFinished ? "outline" : "default"}
              onClick={() => setFinishConfirmOpen(true)}
              disabled={updateMutation.isPending}
            >
              {event?.isFinished ? "Reopen event" : "Mark as finished"}
            </Button>
            <Button size="sm" variant="outline" onClick={openEdit}>
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">Date</span>
                <span>{startDate}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">Time</span>
                <span>{startTime}</span>
              </div>
              {event.location && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">Location</span>
                  <span>{event.location}</span>
                </div>
              )}
              {event.timezone && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">Timezone</span>
                  <span>{event.timezone}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0 font-medium">Seating</span>
                <span>{event.hasSeating ? "Assigned seating" : "No seating plan"}</span>
              </div>
              {event.rsvpEnabled && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">RSVP</span>
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
                        <><Check className="h-3 w-3 text-green-600" />Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" />Copy</>
                      )}
                    </Button>
                    {pendingCount > 0 && (
                      <Link href={`/dashboard/events/${eventId}/attendees?status=pending`}>
                        <Badge className="cursor-pointer bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200">
                          {pendingCount} pending
                        </Badge>
                      </Link>
                    )}
                  </div>
                </div>
              )}
              {event.endDate && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 shrink-0 font-medium">Ends</span>
                  <span>
                    {new Date(event.endDate).toLocaleDateString("en-US", {
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
                <CardTitle className="text-base">Description</CardTitle>
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
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            {updateMutation.error && (
              <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {updateMutation.error.message}
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" {...register("description")} placeholder="A brief description…" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-date">Start Date *</Label>
                <DateTimePicker id="edit-date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-end-date">End Date</Label>
                <DateTimePicker id="edit-end-date" {...register("endDate")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" {...register("location")} placeholder="Venue name or address" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-timezone">Timezone</Label>
              <Input id="edit-timezone" {...register("timezone")} placeholder="Europe/Stockholm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-type">Type *</Label>
              <Select id="edit-type" {...register("type")}>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="other">Other</option>
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
                  Assigned seating
                </Label>
                <p className="text-xs text-muted-foreground">
                  Attendees will be assigned to specific tables and seats.
                </p>
                {!watchedHasSeating && tables.length > 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    Warning: this event already has {tables.length} table{tables.length !== 1 ? "s" : ""}. Disabling seating will orphan existing table data.
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
                    RSVP / Self-Registration
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow guests to register themselves. New sign-ups appear as pending until approved.
                  </p>
                </div>
              </div>

              {watchedRsvpEnabled && (
                <div className="space-y-3 rounded-md bg-muted/30 p-3">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Shareable RSVP link</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background border rounded px-2 py-1 truncate">
                        {getRsvpLink()}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        className="shrink-0 gap-1.5"
                        onClick={copyRsvpLink}
                      >
                        {copiedRsvp ? (
                          <><Check className="h-3.5 w-3.5 text-green-600" />Copied</>
                        ) : (
                          <><Copy className="h-3.5 w-3.5" />Copy</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">QR Code</p>
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
                            {pendingCount} pending
                          </Badge>
                        </Link>
                        <span className="text-xs text-muted-foreground">awaiting approval</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeEdit} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={finishConfirmOpen}
        onOpenChange={setFinishConfirmOpen}
        title={event?.isFinished ? "Reopen this event?" : "Mark event as finished?"}
        description={
          event?.isFinished
            ? "This will mark the event as active again."
            : "This marks the event as completed. You can still edit it afterwards."
        }
        confirmLabel={event?.isFinished ? "Reopen" : "Mark as finished"}
        variant="default"
        onConfirm={toggleFinished}
      />
    </>
  );
}
