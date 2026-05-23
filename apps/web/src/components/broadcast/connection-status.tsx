"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSocket } from "./socket-provider";

export function ConnectionStatus() {
  const { connected } = useSocket();
  const [show, setShow] = useState(false);
  const t = useTranslations("broadcast");

  useEffect(() => {
    if (connected) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(id);
  }, [connected]);

  if (!show) return null;

  return (
    <div className="flex items-center gap-1.5 px-4 py-1 text-xs" style={{ background: "rgba(0,0,0,0.08)" }}>
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span className="opacity-60">{t("reconnecting")}</span>
    </div>
  );
}
