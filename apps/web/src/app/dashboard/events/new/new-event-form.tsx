"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateEventSchema, type CreateEventInput } from "@seat-snaps/shared";
import { useCreateEvent } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function NewEventForm() {
  const router = useRouter();
  const { mutateAsync, isPending, error } = useCreateEvent();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(CreateEventSchema),
  });

  async function onSubmit(data: CreateEventInput) {
    const event = await mutateAsync(data);
    router.push(`/dashboard/events/${event.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error.message}
        </p>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Title *</label>
        <Input {...register("title")} placeholder="Wedding Reception" />
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
          <option value="">Select type…</option>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
          <option value="other">Other</option>
        </Select>
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
