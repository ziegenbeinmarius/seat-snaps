"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Loader2, QrCode, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";

type ScannerState = "idle" | "starting" | "scanning" | "found" | "error";
type ErrorKey = "cameraUnavailable" | "cameraBlocked";

function extractJoinToken(text: string): string | null {
  try {
    const url = new URL(text);
    const parts = url.pathname.split("/");
    const joinIndex = parts.indexOf("join");
    if (joinIndex !== -1 && parts[joinIndex + 1]) {
      return parts[joinIndex + 1];
    }
  } catch {
    if (/^[0-9a-f-]{36}$/i.test(text)) return text;
  }

  return null;
}

export function AttendScanner() {
  const t = useTranslations("attend");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const navigatingRef = useRef(false);

  const [state, setState] = useState<ScannerState>("idle");
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA || navigatingRef.current) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(image.data, image.width, image.height, { inversionAttempts: "dontInvert" });

    if (code) {
      const token = extractJoinToken(code.data);
      if (token) {
        navigatingRef.current = true;
        setState("found");
        stopCamera();
        window.location.href = `/join/${token}`;
        return;
      }
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, [stopCamera]);

  useEffect(() => {
    let active = true;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorKey("cameraUnavailable");
        setState("error");
        return;
      }

      setErrorKey(null);
      setState("starting");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        setState("scanning");
        rafRef.current = requestAnimationFrame(scanLoop);
      } catch {
        setErrorKey("cameraBlocked");
        setState("error");
      }
    }

    void start();

    return () => {
      active = false;
      stopCamera();
    };
  }, [retryKey, scanLoop, stopCamera]);

  return (
    <div className="mt-5 rounded-2xl border border-[rgba(220,210,195,0.7)] bg-[rgba(255,252,247,0.6)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <QrCode className="h-4 w-4" style={{ color: "#a07850" }} />
        <p className="text-sm font-medium" style={{ color: "hsl(24 12% 20%)" }}>
          {t("scanTitle")}
        </p>
      </div>

      {state === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50/80 p-3 text-left">
          <p className="text-xs leading-relaxed text-red-700">{errorKey ? t(errorKey) : ""}</p>
          <button
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {t("tryAgain")}
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "1 / 1" }}>
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="h-44 w-44 rounded-2xl"
              style={{
                border: "3px solid rgba(255,255,255,0.85)",
                boxShadow: "0 0 0 2000px rgba(0,0,0,0.35)",
              }}
            />
          </div>

          {(state === "starting" || state === "found") && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              {state === "starting" ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : (
                <p className="text-sm font-medium text-white">{t("opening")}</p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed" style={{ color: "hsl(28 8% 45%)" }}>
        {t("sessionHint")}
      </p>
    </div>
  );
}
