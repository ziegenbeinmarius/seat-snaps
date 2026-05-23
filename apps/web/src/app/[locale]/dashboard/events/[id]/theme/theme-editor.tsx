"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEventTheme, useUpdateTheme } from "@/lib/api/themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FontFamily, ButtonBorderRadius, HeaderStyle } from "@seat-snaps/shared";

const PRESETS = [
  {
    id: "wedding" as const,
    name: "Wedding",
    description: "Elegant & romantic",
    primary: "#b56b7e",
    secondary: "#f9eef1",
    accent: "#d4a8b4",
  },
  {
    id: "birthday" as const,
    name: "Birthday",
    description: "Fun & colorful",
    primary: "#e8623a",
    secondary: "#fff3ee",
    accent: "#f8a44c",
  },
  {
    id: "corporate" as const,
    name: "Corporate",
    description: "Professional & clean",
    primary: "#2558c4",
    secondary: "#eff4ff",
    accent: "#4a7fe0",
  },
  {
    id: "default" as const,
    name: "Default",
    description: "Warm & classic",
    primary: "#a07850",
    secondary: "#f7f0e6",
    accent: "#c4a882",
  },
];

const FONT_FAMILIES: FontFamily[] = [
  "Inter",
  "Lato",
  "Montserrat",
  "Merriweather",
  "Playfair Display",
  "Roboto",
  "Open Sans",
];

const BUTTON_RADII: { value: ButtonBorderRadius; label: string }[] = [
  { value: "none", label: "Square" },
  { value: "sm", label: "Slightly rounded" },
  { value: "md", label: "Rounded" },
  { value: "lg", label: "Very rounded" },
  { value: "full", label: "Pill" },
];

const HEADER_STYLES: { value: HeaderStyle; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "spacious", label: "Spacious" },
];

const BUTTON_RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  logoUrl: string;
  backgroundUrl: string;
  fontFamily: string;
  buttonBorderRadius: string;
  headerStyle: string;
  customCss: string;
}

function ColorRow({
  label,
  value,
  onChange,
  error,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  optional?: boolean;
}) {
  const safeColor = HEX_REGEX.test(value) ? value : "#000000";
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-3">
        <Label className="w-36 shrink-0">
          {label}
          {optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
        </Label>
        <input
          type="color"
          value={safeColor}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-input"
          aria-label={`${label} color picker`}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={optional ? "—" : "#000000"}
          className="w-28 font-mono text-sm"
          maxLength={7}
          aria-label={`${label} hex value`}
        />
        {optional && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      {error && <p className="ml-[9.5rem] text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ThemePreview({ state }: { state: ThemeState }) {
  const primary = HEX_REGEX.test(state.primaryColor) ? state.primaryColor : "#a07850";
  const secondary = HEX_REGEX.test(state.secondaryColor) ? state.secondaryColor : "#f7f0e6";
  const accent = HEX_REGEX.test(state.accentColor) ? state.accentColor : primary;
  const buttonRadius = BUTTON_RADIUS_MAP[state.buttonBorderRadius] ?? "8px";
  const gradient = `linear-gradient(145deg, ${accent} 0%, ${primary} 50%, ${primary}bb 100%)`;
  const font = state.fontFamily ? `"${state.fontFamily}", system-ui, sans-serif` : undefined;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ background: gradient, fontFamily: font, minHeight: 380 }}
    >
      {/* Mocked header */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          color: primary,
        }}
      >
        <div className="h-4 w-4 rounded-full" style={{ background: primary, opacity: 0.4 }} />
        <span>Guest Name</span>
      </div>

      {/* Hero */}
      <div className="px-4 pb-4 pt-6">
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
        >
          Event
        </span>
        <h1 className="mt-2 text-2xl font-semibold leading-tight text-white drop-shadow-sm">
          Sample Event
        </h1>
        <p className="mt-1 text-sm text-white/80">Friday, June 6, 2025</p>
        <p className="mt-3 text-base font-medium text-white">Welcome, John!</p>
      </div>

      {/* Cards */}
      <div className="space-y-3 px-4 pb-4">
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: primary, opacity: 0.7 }}>
            Schedule
          </div>
          <div
            className="flex items-center gap-3 rounded-xl p-2"
            style={{ background: `${primary}18` }}
          >
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: primary }} />
            <div>
              <div className="text-xs font-semibold" style={{ color: primary }}>
                Happening now
              </div>
              <div className="text-sm font-medium" style={{ color: "hsl(24 12% 16%)" }}>
                Dinner Reception
              </div>
            </div>
          </div>
        </div>

        <button
          className="w-full py-2 text-sm font-semibold text-white shadow-sm"
          style={{ background: primary, borderRadius: buttonRadius, border: "none" }}
          tabIndex={-1}
        >
          View Seating Chart
        </button>

        {state.customCss && (
          <div
            className="rounded-lg px-3 py-2 text-xs"
            style={{ background: "rgba(0,0,0,0.15)", color: "rgba(255,255,255,0.8)" }}
          >
            Custom CSS active
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  eventId: string;
}

export function ThemeEditor({ eventId }: Props) {
  const { data: theme, isLoading } = useEventTheme(eventId);
  const updateTheme = useUpdateTheme(eventId);

  const [state, setState] = useState<ThemeState>({
    primaryColor: "#a07850",
    secondaryColor: "#f7f0e6",
    accentColor: "",
    textColor: "",
    logoUrl: "",
    backgroundUrl: "",
    fontFamily: "",
    buttonBorderRadius: "",
    headerStyle: "",
    customCss: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ThemeState, string>>>({});

  useEffect(() => {
    if (theme) {
      setState({
        primaryColor: theme.primaryColor ?? "#a07850",
        secondaryColor: theme.secondaryColor ?? "#f7f0e6",
        accentColor: theme.accentColor ?? "",
        textColor: theme.textColor ?? "",
        logoUrl: theme.logoUrl ?? "",
        backgroundUrl: theme.backgroundUrl ?? "",
        fontFamily: theme.fontFamily ?? "",
        buttonBorderRadius: theme.buttonBorderRadius ?? "",
        headerStyle: theme.headerStyle ?? "",
        customCss: theme.customCss ?? "",
      });
    }
  }, [theme]);

  function set<K extends keyof ThemeState>(key: K, value: ThemeState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ThemeState, string>> = {};
    for (const field of ["primaryColor", "secondaryColor"] as const) {
      if (state[field] && !HEX_REGEX.test(state[field])) {
        next[field] = "Must be a valid hex color (e.g. #ff0000)";
      }
    }
    for (const field of ["accentColor", "textColor"] as const) {
      if (state[field] && !HEX_REGEX.test(state[field])) {
        next[field] = "Must be a valid hex color (e.g. #ff0000)";
      }
    }
    for (const field of ["logoUrl", "backgroundUrl"] as const) {
      if (state[field]) {
        try {
          new URL(state[field]);
        } catch {
          next[field] = "Must be a valid URL (e.g. https://...)";
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    updateTheme.mutate(
      { preset: preset.id },
      {
        onSuccess: () => {
          setState((prev) => ({
            ...prev,
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            accentColor: preset.accent,
          }));
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleSave() {
    if (!validate()) return;
    updateTheme.mutate(
      {
        primaryColor: state.primaryColor || undefined,
        secondaryColor: state.secondaryColor || undefined,
        accentColor: state.accentColor || null,
        textColor: state.textColor || null,
        logoUrl: state.logoUrl || null,
        backgroundUrl: state.backgroundUrl || null,
        fontFamily: (state.fontFamily as FontFamily) || null,
        buttonBorderRadius: (state.buttonBorderRadius as ButtonBorderRadius) || null,
        headerStyle: (state.headerStyle as HeaderStyle) || null,
        customCss: state.customCss || null,
      },
      {
        onError: (err) => toast.error(err.message),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Editor column */}
      <div className="space-y-5">
        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  disabled={updateTheme.isPending}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <div
                    className="h-10 w-full rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${preset.accent} 0%, ${preset.primary} 60%)`,
                    }}
                  />
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ColorRow
              label="Primary"
              value={state.primaryColor}
              onChange={(v) => set("primaryColor", v)}
              error={errors.primaryColor}
            />
            <ColorRow
              label="Secondary"
              value={state.secondaryColor}
              onChange={(v) => set("secondaryColor", v)}
              error={errors.secondaryColor}
            />
            <ColorRow
              label="Accent"
              value={state.accentColor}
              onChange={(v) => set("accentColor", v)}
              error={errors.accentColor}
              optional
            />
            <ColorRow
              label="Text override"
              value={state.textColor}
              onChange={(v) => set("textColor", v)}
              error={errors.textColor}
              optional
            />
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="font-family">Font family</Label>
              <Select
                id="font-family"
                value={state.fontFamily}
                onChange={(e) => set("fontFamily", e.target.value)}
              >
                <option value="">Default (Inter)</option>
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="button-radius">Button style</Label>
              <Select
                id="button-radius"
                value={state.buttonBorderRadius}
                onChange={(e) => set("buttonBorderRadius", e.target.value)}
              >
                <option value="">Default</option>
                {BUTTON_RADII.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="header-style">Header style</Label>
              <Select
                id="header-style"
                value={state.headerStyle}
                onChange={(e) => set("headerStyle", e.target.value)}
              >
                <option value="">Default</option>
                {HEADER_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                value={state.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                placeholder="https://..."
                type="url"
              />
              {errors.logoUrl && (
                <p className="text-xs text-destructive">{errors.logoUrl}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bg-url">Background image URL</Label>
              <Input
                id="bg-url"
                value={state.backgroundUrl}
                onChange={(e) => set("backgroundUrl", e.target.value)}
                placeholder="https://..."
                type="url"
              />
              {errors.backgroundUrl && (
                <p className="text-xs text-destructive">{errors.backgroundUrl}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="custom-css">Custom CSS</Label>
            <Textarea
              id="custom-css"
              value={state.customCss}
              onChange={(e) => set("customCss", e.target.value)}
              placeholder={`/* Attendee page overrides */\n.glass-card { border-radius: 16px; }\n\n/* Available CSS variables:\n   --event-primary, --event-secondary\n   --event-accent, --event-text */`}
              className="min-h-32 font-mono text-sm"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              CSS is injected into attendee pages. Available variables:{" "}
              <code className="rounded bg-muted px-1 font-mono">--event-primary</code>,{" "}
              <code className="rounded bg-muted px-1 font-mono">--event-secondary</code>,{" "}
              <code className="rounded bg-muted px-1 font-mono">--event-accent</code>. Classes:{" "}
              <code className="rounded bg-muted px-1 font-mono">.glass-card</code>,{" "}
              <code className="rounded bg-muted px-1 font-mono">.event-heading</code>.
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={updateTheme.isPending}
          className="w-full sm:w-auto"
        >
          {updateTheme.isPending ? "Saving…" : "Save theme"}
        </Button>
      </div>

      {/* Live preview column */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ThemePreview state={state} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
