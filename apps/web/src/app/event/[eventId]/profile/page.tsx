"use client";

import { useState, useEffect } from "react";
import { useCurrentAttendee, useUpdateCurrentAttendee } from "@/lib/api/attendee-session";

export default function ProfilePage() {
  const { data: attendee, isLoading } = useCurrentAttendee();
  const updateMutation = useUpdateCurrentAttendee();

  const [relationInfo, setRelationInfo] = useState("");
  const [conversationStarters, setConversationStarters] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attendee) {
      setRelationInfo(attendee.relationInfo ?? "");
      setConversationStarters(attendee.conversationStarters?.join(", ") ?? "");
    }
  }, [attendee]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    const starters = conversationStarters
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await updateMutation.mutateAsync({
        relationInfo: relationInfo || undefined,
        conversationStarters: starters.length > 0 ? starters : [],
      });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 pt-8">
        <p className="event-body event-card-muted-text text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-6 pt-8">
      <div className="mb-6 px-2">
        <h1 className="event-heading text-2xl font-semibold text-white drop-shadow-sm">
          My Profile
        </h1>
        <p className="event-body mt-0.5 text-sm text-white/65">
          {attendee?.name}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 space-y-4">
        <div className="space-y-1.5">
          <label
            className="event-body text-xs font-semibold uppercase tracking-widest event-card-muted-text"
          >
            About me
          </label>
          <textarea
            className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none resize-none event-card-title"
            style={{
              borderColor: "var(--event-card-divider)",
              background: "rgba(255,255,255,0.15)",
            }}
            rows={3}
            placeholder="e.g. Easy to talk with, loves hiking…"
            value={relationInfo}
            onChange={(e) => { setRelationInfo(e.target.value); setSaved(false); }}
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="event-body text-xs font-semibold uppercase tracking-widest event-card-muted-text"
          >
            Conversation starters (comma-separated)
          </label>
          <input
            type="text"
            className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none event-card-title"
            style={{
              borderColor: "var(--event-card-divider)",
              background: "rgba(255,255,255,0.15)",
            }}
            placeholder="e.g. Travel, Coffee, Music"
            value={conversationStarters}
            onChange={(e) => { setConversationStarters(e.target.value); setSaved(false); }}
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--event-primary)" }}>{error}</p>
        )}

        {saved && (
          <p className="text-sm text-green-600">Profile updated!</p>
        )}

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--event-primary, #a07850)" }}
        >
          {updateMutation.isPending ? "Saving…" : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
