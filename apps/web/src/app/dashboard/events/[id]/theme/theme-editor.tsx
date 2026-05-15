"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEventTheme, useUpdateTheme } from "@/lib/api/themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PRESETS = [
  {
    id: "wedding",
    name: "Wedding",
    description: "Elegant and romantic",
    primary: "#d4a0a0",
    secondary: "#f5e6e0",
  },
  {
    id: "birthday",
    name: "Birthday",
    description: "Fun and colorful",
    primary: "#f59e0b",
    secondary: "#fef3c7",
  },
  {
    id: "corporate",
    name: "Corporate",
    description: "Professional and clean",
    primary: "#1e40af",
    secondary: "#eff6ff",
  },
  {
    id: "default",
    name: "Default",
    description: "Standard blue theme",
    primary: "#3b82f6",
    secondary: "#eff6ff",
  },
];

interface Props {
  eventId: string;
}

export function ThemeEditor({ eventId }: Props) {
  const { data: theme, isLoading } = useEventTheme(eventId);
  const updateTheme = useUpdateTheme(eventId);

  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#eff6ff");
  const [logoUrl, setLogoUrl] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");

  useEffect(() => {
    if (theme) {
      setPrimaryColor(theme.primaryColor ?? "#3b82f6");
      setSecondaryColor(theme.secondaryColor ?? "#eff6ff");
      setLogoUrl(theme.logoUrl ?? "");
      setBackgroundUrl(theme.backgroundUrl ?? "");
    }
  }, [theme]);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    updateTheme.mutate(
      { preset: preset.id as "wedding" | "birthday" | "corporate" | "default" },
      {
        onSuccess: () => {
          setPrimaryColor(preset.primary);
          setSecondaryColor(preset.secondary);
          toast.success(`${preset.name} theme applied`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  function handleSave() {
    updateTheme.mutate(
      {
        primaryColor,
        secondaryColor,
        logoUrl: logoUrl || null,
        backgroundUrl: backgroundUrl || null,
      },
      {
        onSuccess: () => toast.success("Theme saved"),
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
    <div className="space-y-6">
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
                className="flex flex-col items-center gap-2 rounded-xl border border-border p-3 text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={updateTheme.isPending}
              >
                <div className="flex gap-1">
                  <div
                    className="h-8 w-8 rounded-full border border-border"
                    style={{ background: preset.primary }}
                  />
                  <div
                    className="h-8 w-8 rounded-full border border-border"
                    style={{ background: preset.secondary }}
                  />
                </div>
                <span className="font-medium">{preset.name}</span>
                <span className="text-xs text-muted-foreground">{preset.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="w-36 text-sm font-medium">Primary color</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-input"
            />
            <span className="font-mono text-sm text-muted-foreground">{primaryColor}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="w-36 text-sm font-medium">Secondary color</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="h-9 w-16 cursor-pointer rounded border border-input"
            />
            <span className="font-mono text-sm text-muted-foreground">{secondaryColor}</span>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Logo URL</label>
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Background image URL</label>
            <Input
              value={backgroundUrl}
              onChange={(e) => setBackgroundUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSave} disabled={updateTheme.isPending} className="w-full sm:w-auto">
            {updateTheme.isPending ? "Saving…" : "Save theme"}
          </Button>
        </CardContent>
      </Card>

      {(primaryColor || secondaryColor) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-24 items-center justify-center rounded-xl text-sm font-medium"
              style={{ background: secondaryColor, color: primaryColor }}
            >
              Event theme preview
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
