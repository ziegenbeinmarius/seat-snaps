"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import jsQR from "jsqr";
import { useCheckinByQrToken } from "@/lib/api/attendees";
import { CheckCircle, XCircle, Camera, Loader2, UserCheck } from "lucide-react";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { useTranslations } from "next-intl";

interface Props {
  eventId: string;
}

type ScanState =
  | { type: "idle" }
  | { type: "scanning" }
  | { type: "processing" }
  | { type: "success"; attendee: AttendeeResponse }
  | { type: "error"; message: string };

export function CheckinPanel({ eventId }: Props) {
  const t = useTranslations("organizer.checkin");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef<boolean>(false);

  const [state, setState] = useState<ScanState>({ type: "idle" });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkin = useCheckinByQrToken(eventId);
  const checkinRef = useRef(checkin);
  useEffect(() => { checkinRef.current = checkin; });

  const extractQrToken = (text: string): string | null => {
    try {
      const url = new URL(text);
      const parts = url.pathname.split("/");
      const joinIdx = parts.indexOf("join");
      if (joinIdx !== -1 && parts[joinIdx + 1]) {
        return parts[joinIdx + 1];
      }
    } catch {
      if (/^[0-9a-f-]{36}$/i.test(text)) return text;
    }
    return null;
  };

  const handleQrCode = useCallback(async (rawText: string) => {
    if (cooldownRef.current || lastScannedRef.current === rawText) return;
    const token = extractQrToken(rawText);
    if (!token) return;

    cooldownRef.current = true;
    lastScannedRef.current = rawText;
    setState({ type: "processing" });

    try {
      const attendee = await checkinRef.current.mutateAsync(token);
      setState({ type: "success", attendee });
    } catch (err) {
      setState({ type: "error", message: (err as Error).message ?? t("failed") });
    }

    setTimeout(() => {
      cooldownRef.current = false;
      lastScannedRef.current = "";
      setState({ type: "scanning" });
    }, 3000);
  }, [t]);

  const handleQrCodeRef = useRef(handleQrCode);
  useEffect(() => { handleQrCodeRef.current = handleQrCode; });

  const scan = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scan);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      void handleQrCodeRef.current(code.data);
    }

    rafRef.current = requestAnimationFrame(scan);
  }, []);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setState({ type: "scanning" });
        rafRef.current = requestAnimationFrame(scan);
      } catch {
        if (active) setCameraError(t("cameraDenied"));
      }
    }

    void startCamera();
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    };
  }, [scan, retryCount, t]);

  const overlay = state.type !== "idle" && state.type !== "scanning";

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold" style={{ color: "hsl(24 12% 20%)" }}>
          {t("title")}
        </h2>
        <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          {t("subtitle")}
        </p>
      </div>

      {cameraError ? (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
          style={{ background: "rgba(255,252,247,0.75)", border: "1px solid rgba(220,210,195,0.6)" }}
        >
          <Camera className="h-12 w-12 opacity-30" />
          <p className="text-sm" style={{ color: "hsl(0 65% 50%)" }}>
            {cameraError}
          </p>
          <button
            onClick={() => {
              setCameraError(null);
              setRetryCount((c) => c + 1);
            }}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "hsl(28 65% 44%)" }}
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "1 / 1" }}>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan frame overlay */}
          {!overlay && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="h-52 w-52 rounded-2xl"
                style={{
                  border: "3px solid rgba(255,255,255,0.8)",
                  boxShadow: "0 0 0 2000px rgba(0,0,0,0.45)",
                }}
              />
            </div>
          )}

          {/* State overlay */}
          {overlay && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70">
              {state.type === "processing" && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-white" />
                  <p className="text-sm font-medium text-white">{t("processing")}</p>
                </>
              )}
              {state.type === "success" && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-400" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">{state.attendee.name}</p>
                    {state.attendee.groupLabel && (
                      <p className="text-sm text-white/70">{state.attendee.groupLabel}</p>
                    )}
                    <p className="mt-1 text-xs text-green-400">{t("success")}</p>
                  </div>
                </>
              )}
              {state.type === "error" && (
                <>
                  <XCircle className="h-16 w-16 text-red-400" />
                  <div className="text-center">
                    <p className="text-base font-medium text-white">{t("failed")}</p>
                    <p className="text-sm text-white/70">{state.message}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recently checked in will appear here via React Query cache refresh */}
      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{ background: "rgba(255,252,247,0.75)", border: "1px solid rgba(220,210,195,0.6)" }}
      >
        <UserCheck className="h-5 w-5 shrink-0" style={{ color: "hsl(28 65% 44%)" }} />
        <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
          {t("hint")}
        </p>
      </div>
    </div>
  );
}
