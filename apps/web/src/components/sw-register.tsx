"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const serviceWorkerUrl =
      process.env.NODE_ENV === "production" ? "/sw.js" : "/sw.js?dev=1";

    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  }, []);
  return null;
}
