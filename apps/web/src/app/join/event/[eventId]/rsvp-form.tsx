"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { useRsvpRegister } from "@/lib/api/attendees";
import { toast } from "sonner";

interface Props {
  eventId: string;
  eventTitle: string;
  onBack: () => void;
}

export function RsvpForm({ eventId, eventTitle, onBack }: Props) {
  const router = useRouter();
  const rsvpMutation = useRsvpRegister(eventId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [starters, setStarters] = useState<string[]>([""]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Enter a valid email address";
    }
    if (description.length > 200) e.description = "Max 200 characters";
    return e;
  }

  function addStarter() {
    setStarters((prev) => [...prev, ""]);
  }

  function updateStarter(index: number, value: string) {
    setStarters((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function removeStarter(index: number) {
    setStarters((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const conversationStarters = starters.map((s) => s.trim()).filter(Boolean);

    try {
      await rsvpMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        description: description.trim() || undefined,
        conversationStarters: conversationStarters.length > 0 ? conversationStarters : undefined,
      });
      toast.success("You're registered! The organizer will confirm your spot.");
      router.push(`/event/${eventId}`);
    } catch (err) {
      const message = (err as Error).message;
      if (message?.toLowerCase().includes("email")) {
        setErrors({ email: message });
      } else {
        setErrors({ submit: message ?? "Registration failed. Please try again." });
      }
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(160deg, #f5ede0 0%, #f0e6d4 40%, #ede0cc 100%)" }}
    >
      {/* Header */}
      <div
        className="px-6 py-10"
        style={{
          background: "rgba(250, 244, 234, 0.6)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(200, 175, 140, 0.3)",
        }}
      >
        <button
          onClick={onBack}
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "hsl(28 50% 50%)" }}
        >
          ← Back
        </button>
        <h1
          className="text-3xl font-semibold"
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            color: "hsl(24 12% 20%)",
          }}
        >
          {eventTitle}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          Register for this event
        </p>
      </div>

      <form id="rsvp-form" onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto p-6 space-y-4 pb-36">
        {/* Name */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(28 8% 42%)" }}
          >
            Name <span style={{ color: "hsl(0 70% 50%)" }}>*</span>
          </label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
            style={{
              background: "rgba(255, 252, 247, 0.75)",
              backdropFilter: "blur(12px)",
              border: errors.name
                ? "1.5px solid hsl(0 70% 60%)"
                : "1px solid rgba(200, 175, 140, 0.45)",
              color: "hsl(24 12% 20%)",
            }}
          />
          {errors.name && (
            <p className="mt-1 text-xs" style={{ color: "hsl(0 70% 50%)" }}>{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(28 8% 42%)" }}
          >
            Email <span style={{ color: "hsl(0 70% 50%)" }}>*</span>
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
            style={{
              background: "rgba(255, 252, 247, 0.75)",
              backdropFilter: "blur(12px)",
              border: errors.email
                ? "1.5px solid hsl(0 70% 60%)"
                : "1px solid rgba(200, 175, 140, 0.45)",
              color: "hsl(24 12% 20%)",
            }}
          />
          {errors.email && (
            <p className="mt-1 text-xs" style={{ color: "hsl(0 70% 50%)" }}>{errors.email}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(28 8% 42%)" }}
          >
            About you <span className="normal-case font-normal" style={{ color: "hsl(28 8% 60%)" }}>optional</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us a bit about yourself"
            rows={3}
            maxLength={200}
            className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none"
            style={{
              background: "rgba(255, 252, 247, 0.75)",
              backdropFilter: "blur(12px)",
              border: errors.description
                ? "1.5px solid hsl(0 70% 60%)"
                : "1px solid rgba(200, 175, 140, 0.45)",
              color: "hsl(24 12% 20%)",
            }}
          />
          <div className="flex justify-between mt-0.5">
            {errors.description ? (
              <p className="text-xs" style={{ color: "hsl(0 70% 50%)" }}>{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs" style={{ color: "hsl(28 8% 60%)" }}>
              {description.length}/200
            </p>
          </div>
        </div>

        {/* Conversation Starters */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold uppercase tracking-widest"
            style={{ color: "hsl(28 8% 42%)" }}
          >
            Conversation starters <span className="normal-case font-normal" style={{ color: "hsl(28 8% 60%)" }}>optional</span>
          </label>
          <p className="mb-2 text-xs" style={{ color: "hsl(28 8% 58%)" }}>
            What do you like to talk about?
          </p>
          <div className="space-y-2">
            {starters.map((starter, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={starter}
                  onChange={(e) => updateStarter(index, e.target.value)}
                  placeholder={`e.g. ${["Travel", "Coffee", "Music", "Tech"][index % 4]}`}
                  className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: "rgba(255, 252, 247, 0.75)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(200, 175, 140, 0.45)",
                    color: "hsl(24 12% 20%)",
                  }}
                />
                {starters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStarter(index)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70"
                    style={{ background: "rgba(200, 175, 140, 0.25)" }}
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4" style={{ color: "hsl(28 8% 45%)" }} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {starters.length < 6 && (
            <button
              type="button"
              onClick={addStarter}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: "hsl(28 50% 50%)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add another
            </button>
          )}
        </div>

        {errors.submit && (
          <p className="text-center text-sm" style={{ color: "hsl(0 70% 50%)" }}>
            {errors.submit}
          </p>
        )}
      </form>

      <div
        className="sticky bottom-0 p-6"
        style={{
          background: "rgba(250, 244, 234, 0.88)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(200, 175, 140, 0.3)",
        }}
      >
        <button
          type="submit"
          form="rsvp-form"
          disabled={rsvpMutation.isPending}
          className="w-full rounded-2xl py-4 text-base font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #c4955a 0%, #a07850 100%)" }}
        >
          {rsvpMutation.isPending ? "Registering…" : "Register for Event →"}
        </button>
      </div>
    </div>
  );
}
