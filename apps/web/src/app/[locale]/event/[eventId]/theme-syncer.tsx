"use client";

import { useEffect } from "react";

interface Props {
  eventId: string;
}

const BORDER_RADIUS_MAP: Record<string, string> = {
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
};

const FONT_CSS_VAR_MAP: Record<string, string> = {
  "Inter": "var(--font-inter, 'Inter', system-ui, sans-serif)",
  "Lato": "var(--font-lato, 'Lato', system-ui, sans-serif)",
  "Montserrat": "var(--font-montserrat, 'Montserrat', system-ui, sans-serif)",
  "Merriweather": "var(--font-merriweather, 'Merriweather', Georgia, serif)",
  "Playfair Display": "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  "Roboto": "var(--font-roboto, 'Roboto', system-ui, sans-serif)",
  "Open Sans": "var(--font-opensans, 'Open Sans', system-ui, sans-serif)",
};

interface ThemeData {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  textColor?: string | null;
  fontFamily?: string | null;
  buttonBorderRadius?: string | null;
  headerStyle?: string | null;
  backgroundUrl?: string | null;
  customCss?: string | null;
}

function applyTheme(el: HTMLElement, theme: ThemeData) {
  const setOrRemove = (prop: string, value: string | null | undefined) => {
    if (value) el.style.setProperty(prop, value);
    else el.style.removeProperty(prop);
  };

  setOrRemove("--event-primary", theme.primaryColor);
  setOrRemove("--event-secondary", theme.secondaryColor);
  setOrRemove("--event-accent", theme.accentColor);
  setOrRemove("--event-text", theme.textColor);
  setOrRemove("--event-active-color", theme.primaryColor);

  if (theme.fontFamily && FONT_CSS_VAR_MAP[theme.fontFamily]) {
    const fontVal = FONT_CSS_VAR_MAP[theme.fontFamily];
    el.style.setProperty("--event-heading-font", fontVal);
    el.style.setProperty("--event-body-font", fontVal);
  } else {
    el.style.removeProperty("--event-heading-font");
    el.style.removeProperty("--event-body-font");
  }

  if (theme.buttonBorderRadius && BORDER_RADIUS_MAP[theme.buttonBorderRadius]) {
    setOrRemove("--event-button-radius", BORDER_RADIUS_MAP[theme.buttonBorderRadius]);
  } else {
    el.style.removeProperty("--event-button-radius");
  }

  setOrRemove("--event-header-style", theme.headerStyle);

  if (theme.primaryColor) {
    const accent = theme.accentColor ?? theme.primaryColor;
    el.style.setProperty(
      "--event-gradient",
      `linear-gradient(145deg, ${accent} 0%, ${theme.primaryColor} 45%, ${theme.primaryColor}bb 100%)`,
    );
  }

  const bgEl = el.querySelector("[aria-hidden='true'].fixed") as HTMLElement | null;
  if (bgEl) {
    bgEl.style.background = theme.backgroundUrl
      ? `url(${theme.backgroundUrl}) center/cover no-repeat fixed, var(--event-gradient)`
      : "var(--event-gradient)";
  }

  const existingCustomStyle = document.getElementById("event-custom-css");
  if (theme.customCss) {
    if (existingCustomStyle) {
      existingCustomStyle.textContent = theme.customCss;
    } else {
      const style = document.createElement("style");
      style.id = "event-custom-css";
      style.textContent = theme.customCss;
      document.head.appendChild(style);
    }
  } else if (existingCustomStyle) {
    existingCustomStyle.remove();
  }
}

export function ThemeSyncer({ eventId }: Props) {
  useEffect(() => {
    let mounted = true;

    async function sync() {
      try {
        const [eventRes, themeRes] = await Promise.allSettled([
          fetch(`/api/proxy/events/${eventId}/info`),
          fetch(`/api/proxy/events/${eventId}/theme`),
        ]);

        if (!mounted) return;

        const el = document.querySelector("[data-event-theme]") as HTMLElement | null;
        if (!el) return;

        if (eventRes.status === "fulfilled" && eventRes.value.ok) {
          const event = (await eventRes.value.json()) as { type: string };
          el.setAttribute("data-event-theme", event.type ?? "other");
        }

        if (themeRes.status === "fulfilled" && themeRes.value.ok) {
          const theme = (await themeRes.value.json()) as ThemeData;
          applyTheme(el, theme);
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
