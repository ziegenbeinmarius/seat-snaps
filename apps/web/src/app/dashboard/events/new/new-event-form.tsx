"use client";

import { useRouter } from "next/navigation";
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

interface Props {
  onClose?: () => void;
}

export function NewEventForm({ onClose }: Props) {
  const router = useRouter();
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
        <Label htmlFor="event-title">Title *</Label>
        <Input id="event-title" {...register("title")} placeholder="Wedding Reception" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-description">Description</Label>
        <Textarea id="event-description" {...register("description")} placeholder="A brief description…" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event-date">Start Date *</Label>
          <DateTimePicker id="event-date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="event-end-date">End Date</Label>
          <DateTimePicker id="event-end-date" {...register("endDate")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-location">Location</Label>
        <Input id="event-location" {...register("location")} placeholder="Venue name or address" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-timezone">Timezone</Label>
        <Input id="event-timezone" {...register("timezone")} placeholder="Europe/Stockholm" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="event-type">Type *</Label>
        <Select id="event-type" {...register("type")}>
          <option value="">Select type…</option>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
          <option value="other">Other</option>
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
            Assigned seating
          </Label>
          <p className="text-xs text-muted-foreground">
            Attendees will be assigned to specific tables and seats.
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create Event"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
