"use client";

import { useState } from "react";
import { Megaphone, Send, Trash2 } from "lucide-react";
import { useBroadcasts, useCreateBroadcast, useDeleteBroadcast } from "@/lib/api/broadcasts";
import { useTables } from "@/lib/api/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { BroadcastResponse, BroadcastTargetType } from "@seat-snaps/shared";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  eventId: string;
}

function BroadcastItem({
  broadcast,
  onDelete,
  isDeleting,
  locale,
}: {
  broadcast: BroadcastResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  locale: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{broadcast.title}</p>
        <p className="text-sm text-muted-foreground">{broadcast.content}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {broadcast.targetType === "all" ? "All attendees" : broadcast.targetType === "table" ? "Specific table" : "Custom"}{" "}
          · {new Date(broadcast.createdAt).toLocaleString(locale)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
        disabled={isDeleting}
        onClick={() => onDelete(broadcast.id)}
        aria-label="Delete broadcast"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function BroadcastsPanel({ eventId }: Props) {
  const t = useTranslations("event.broadcasts");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const { data: broadcasts = [], isLoading } = useBroadcasts(eventId);
  const { data: tables = [] } = useTables(eventId);
  const createMutation = useCreateBroadcast(eventId);
  const deleteMutation = useDeleteBroadcast(eventId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<BroadcastTargetType>("all");
  const [targetId, setTargetId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const QUICK_TEMPLATES = [
    { title: "Return to seats", content: "Please return to your seats." },
    { title: "Photo time", content: "Everyone gather for a group photo!" },
    { title: "Dinner is served", content: "Dinner is now being served. Please make your way to your table." },
  ];

  function applyTemplate(template: { title: string; content: string }) {
    setTitle(template.title);
    setContent(template.content);
    setTargetType("all");
    setTargetId("");
  }

  async function handleSend() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError(null);
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        targetType,
        targetId: targetType !== "all" && targetId ? targetId : undefined,
      });
      setTitle("");
      setContent("");
      setTargetType("all");
      setTargetId("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold text-lg">{t("send")}</h2>

          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((tmpl) => (
              <Button
                key={tmpl.title}
                variant="outline"
                size="sm"
                onClick={() => applyTemplate(tmpl)}
              >
                {tmpl.title}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bc-title">{t("title")}</Label>
            <Input
              id="bc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bc-content">{t("message")}</Label>
            <Textarea
              id="bc-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to announce?"
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bc-target">Send to</Label>
            <select
              id="bc-target"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as BroadcastTargetType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All attendees</option>
              <option value="table">Specific table</option>
            </select>
          </div>

          {targetType === "table" && (
            <div className="space-y-2">
              <Label htmlFor="bc-table">Table</Label>
              <select
                id="bc-table"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a table…</option>
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>{tbl.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={handleSend}
            disabled={createMutation.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {createMutation.isPending ? t("sending") : t("send")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 font-semibold text-lg">{t("history")}</h2>
          {isLoading && <p className="text-sm text-muted-foreground">{tCommon("loading")}</p>}
          {!isLoading && broadcasts.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noHistory")}</p>
          )}
          {broadcasts.map((b) => (
            <BroadcastItem
              key={b.id}
              broadcast={b}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === b.id}
              locale={locale}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
