"use client";

import { useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface Props {
  eventId: string;
}

export function ThemeSyncer({ eventId }: Props) {
  useEffect(() => {
    let mounted = true;

    async function sync() {
      try {
        const [eventRes, themeRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/events/${eventId}/info`),
          fetch(`${API_URL}/api/events/${eventId}/theme`),
        ]);

        if (!mounted) return;

        const el = document.querySelector("[data-event-theme]") as HTMLElement | null;
        if (!el) return;

        if (eventRes.status === "fulfilled" && eventRes.value.ok) {
          const event = (await eventRes.value.json()) as { type: string };
          el.setAttribute("data-event-theme", event.type ?? "other");
        }

        if (themeRes.status === "fulfilled" && themeRes.value.ok) {
          const theme = (await themeRes.value.json()) as {
            primaryColor?: string | null;
            secondaryColor?: string | null;
          };
          if (theme.primaryColor) {
            el.style.setProperty("--event-primary", theme.primaryColor);
          } else {
            el.style.removeProperty("--event-primary");
          }
          if (theme.secondaryColor) {
            el.style.setProperty("--event-secondary", theme.secondaryColor);
          } else {
            el.style.removeProperty("--event-secondary");
          }
        }
      } catch {
        // silently ignore — theme sync is best-effort
      }
    }

    sync();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [eventId]);

  return null;
}
