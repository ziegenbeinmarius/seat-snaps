"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useScheduleItems, useCreateScheduleItem, useUpdateScheduleItem, useDeleteScheduleItem } from "@/lib/api/schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ScheduleItemResponse } from "@seat-snaps/shared";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  eventId: string;
  eventDate?: Date | string;
  eventTimezone?: string | null;
}

function formatTime(d: Date | string, locale: string, timeZone?: string | null) {
  return new Date(d).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

function formatDate(d: Date | string, locale: string, timeZone?: string | null) {
  return new Date(d).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  });
}

function toDatetimeLocal(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function SchedulePanel({ eventId, eventDate, eventTimezone }: Props) {
  const t = useTranslations("event.schedule");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { data: items = [], isLoading } = useScheduleItems(eventId);
  const createMutation = useCreateScheduleItem(eventId);
  const updateMutation = useUpdateScheduleItem(eventId);
  const deleteMutation = useDeleteScheduleItem(eventId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItemResponse | null>(null);
  const [form, setForm] = useState({ title: "", description: "", startTime: "", endTime: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const sorted = [...items].sort((a, b) => {
    const diff = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    return diff !== 0 ? diff : a.position - b.position;
  });

  function openAdd() {
    const defaultStartTime = eventDate ? toDatetimeLocal(eventDate) : "";
    setForm({ title: "", description: "", startTime: defaultStartTime, endTime: "" });
    setError(null);
    setShowAddDialog(true);
  }

  function openEdit(item: ScheduleItemResponse) {
    setForm({
      title: item.title,
      description: item.description ?? "",
      startTime: toDatetimeLocal(item.startTime),
      endTime: toDatetimeLocal(item.endTime),
    });
    setError(null);
    setEditingItem(item);
  }

  function closeDialog() {
    setShowAddDialog(false);
    setEditingItem(null);
  }

  function validate(): string | null {
    if (!form.title.trim()) return t("fields.title");
    if (!form.startTime) return t("fields.startTime");
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      startTime: new Date(form.startTime).toISOString(),
      endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
    };

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ itemId: editingItem.id, data: payload });
        setEditingItem(null);
      } else {
        await createMutation.mutateAsync(payload);
        setShowAddDialog(false);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="event-heading text-lg font-semibold">Schedule ({items.length})</h2>
        <Button size="sm" onClick={openAdd}>
          {t("addItem")}
        </Button>
      </div>

      {error && !showAddDialog && !editingItem && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t("noItems")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(item.startTime, locale, eventTimezone)} · {formatTime(item.startTime, locale, eventTimezone)}
                    {item.endTime && ` – ${formatTime(item.endTime, locale, eventTimezone)}`}
                  </p>
                  {item.description && (
                    <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => openEdit(item)}
                    aria-label={tCommon("edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDelete(item.id)}
                    aria-label={tCommon("delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        title={t("deleteTitle")}
        description={t("deleteDesc")}
        confirmLabel={tCommon("delete")}
        onConfirm={() => { const id = confirmDelete; setConfirmDelete(null); if (id) void handleDelete(id); }}
      />

      <Dialog
        open={showAddDialog || !!editingItem}
        onOpenChange={(open) => { if (!open) closeDialog(); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? t("editItem") : t("addItem")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="schedule-title">{t("fields.title")}</Label>
              <Input
                id="schedule-title"
                placeholder={t("fields.title")}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schedule-description">{t("fields.description")}</Label>
              <Textarea
                id="schedule-description"
                placeholder={t("fields.description")}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schedule-start">{t("fields.startTime")}</Label>
              <DateTimePicker
                id="schedule-start"
                value={form.startTime}
                onChange={(e) => {
                  const startTime = e.target.value;
                  const updates: Partial<typeof form> = { startTime };
                  if (!form.endTime && startTime) {
                    const end = new Date(new Date(startTime).getTime() + 60 * 60 * 1000);
                    updates.endTime = toDatetimeLocal(end);
                  }
                  setForm({ ...form, ...updates });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="schedule-end">{t("fields.endTime")}</Label>
              <DateTimePicker
                id="schedule-end"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
