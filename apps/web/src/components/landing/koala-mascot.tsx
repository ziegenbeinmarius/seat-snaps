"use client";

import Image from "next/image";
import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

/** Synthesise a mechanical shutter-click via Web Audio API (no audio file needed). */
function playShutterClick() {
  try {
    const AudioCtx =
      window.AudioContext ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx() as AudioContext;
    const sampleRate = ctx.sampleRate;

    // Short noise burst that decays fast — sounds like a mechanical click.
    const bufferSize = Math.floor(sampleRate * 0.06);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.onended = () => void ctx.close();
  } catch {
    // Audio not available — fail silently.
  }
}

/**
 * Clickable koala mascot with a camera-flash easter egg.
 *
 * Clicking triggers:
 *  • a synthesised shutter-click sound
 *  • a full-screen white camera-flash overlay
 *  • a recoil animation on the koala image
 *  • a 📸 emoji that floats up and fades away
 */
export function KoalaMascot() {
  const [flashing, setFlashing] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const cooldown = useRef(false);

  const handleClick = useCallback(() => {
    if (cooldown.current) return;
    cooldown.current = true;

    playShutterClick();
    setFlashing(true);
    setShaking(true);
    setShowEmoji(true);

    // Flash lasts ~800 ms (matches CSS animation duration).
    setTimeout(() => setFlashing(false), 800);
    // Recoil lasts ~500 ms.
    setTimeout(() => setShaking(false), 500);
    // Emoji floats for ~1.2 s; re-enable click at the end.
    setTimeout(() => {
      setShowEmoji(false);
      cooldown.current = false;
    }, 1200);
  }, []);

  return (
    <div className="relative inline-block mb-3 sm:mb-6">
      {/* ── Full-screen flash overlay ──────────────────────────────────── */}
      {flashing && (
        <div
          className="pointer-events-none fixed inset-0 z-[9999] bg-white animate-camera-flash"
          aria-hidden="true"
        />
      )}

      {/* ── Floating 📸 emoji ──────────────────────────────────────────── */}
      {showEmoji && (
        <span
          className="pointer-events-none absolute -top-6 left-1/2 select-none text-2xl animate-float-up"
          style={{ transform: "translateX(-50%)" }}
          aria-hidden="true"
        >
          📸
        </span>
      )}

      {/* ── Floating koala wrapper (keeps the existing gentle bob) ─────── */}
      <div className="animate-float">
        <button
          onClick={handleClick}
          className={cn(
            "cursor-pointer select-none border-0 bg-transparent p-0",
            "rounded-full",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600",
            shaking && "animate-koala-click",
          )}
          aria-label="Click the koala for a surprise!"
          title="✦ Click me!"
        >
          <Image
            src="/images/koala-mascot.png"
            alt="SeatSnaps Koala mascot with a retro camera"
            width={240}
            height={411}
            className="h-auto w-auto max-h-[22vh] sm:max-h-[28vh] md:max-h-[32vh] lg:max-h-[36vh] drop-shadow-md transition-filter duration-75"
            priority
          />
        </button>
      </div>
    </div>
  );
}
