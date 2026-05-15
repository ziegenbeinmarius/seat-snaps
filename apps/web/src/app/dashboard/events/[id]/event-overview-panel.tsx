"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateEventSchema, type UpdateEventInput } from "@seat-snaps/shared";
import { useEvent, useUpdateEvent } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  const updateMutation = useUpdateEvent(eventId);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEventInput>({
    resolver: zodResolver(UpdateEventSchema),
  });

  function startEdit() {
    if (!event) return;
    reset({
      title: event.title,
      description: event.description ?? undefined,
      date: toDatetimeLocal(event.date) as unknown as Date,
      endDate: event.endDate ? (toDatetimeLocal(event.endDate) as unknown as Date) : undefined,
      location: event.location ?? undefined,
      type: event.type,
    });
    setSaved(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    updateMutation.reset();
  }

  async function onSubmit(data: UpdateEventInput) {
    try {
      await updateMutation.mutateAsync(data);
      setSaved(true);
      setEditing(false);
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

  if (editing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {updateMutation.error && (
          <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {updateMutation.error.message}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Title *</label>
          <Input {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <Input {...register("description")} placeholder="A brief description…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Start Date *</label>
            <Input type="datetime-local" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">End Date</label>
            <Input type="datetime-local" {...register("endDate")} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Location</label>
          <Input {...register("location")} placeholder="Venue name or address" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Type *</label>
          <Select {...register("type")}>
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday</option>
            <option value="corporate">Corporate</option>
            <option value="other">Other</option>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={cancelEdit}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {saved ? (
          <p className="text-sm font-medium text-green-600">Changes saved.</p>
        ) : (
          <span />
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={startEdit}
          aria-label="Edit event"
        >
          <Pencil className="h-4 w-4" />
        </Button>
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
  );
}
