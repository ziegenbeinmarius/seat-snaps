"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import { useHighlightPhotos } from "@/lib/api/photos";
import type { PhotoResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
  autoAdvanceMs?: number;
}

export function HighlightSlideshow({ eventId, autoAdvanceMs = 4000 }: Props) {
  const { data: photos = [], isLoading } = useHighlightPhotos(eventId);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const total = photos.length;

  const downloadPhoto = useCallback(async (photo: PhotoResponse) => {
    try {
      const res = await fetch(photo.url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] ?? "jpg";
      const filename = `highlight_${photo.attendeeName.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  }, []);

  const downloadAll = useCallback(async () => {
    if (photos.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      await Promise.all(
        photos.map(async (photo, i) => {
          const res = await fetch(photo.url);
          if (!res.ok) return;
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] ?? "jpg";
          zip.file(
            `${String(i + 1).padStart(3, "0")}_${photo.attendeeName.replace(/[^a-z0-9]/gi, "_")}.${ext}`,
            blob,
          );
        }),
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "highlights.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${photos.length} highlights`);
    } catch {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  }, [photos]);

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (total === 0 || paused || fullscreen) return;
    const id = setInterval(next, autoAdvanceMs);
    return () => clearInterval(id);
  }, [total, paused, fullscreen, next, autoAdvanceMs]);

  // Reset index when photos change
  useEffect(() => {
    setCurrent(0);
  }, [total]);

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="aspect-video animate-pulse bg-white/20" />
      </div>
    );
  }

  if (total === 0) return null;

  const photo = photos[current];

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="relative">
          {/* Slide image */}
          <div
            className="relative aspect-video bg-black cursor-pointer"
            onClick={() => setFullscreen(true)}
          >
            <Image
              key={photo?.id}
              src={photo?.url}
              alt={`Highlight by ${photo?.attendeeName}`}
              fill
              sizes="(max-width: 768px) 60vw, 80vw"
              className="h-full w-full object-contain transition-opacity duration-500"
            />
            <div className="absolute right-2 top-2 flex gap-1.5">
              <button
                className="rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); void downloadPhoto(photo); }}
                title="Download photo"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                className="rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Controls */}
          {total > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-opacity hover:bg-black/50"
                onClick={(e) => { e.stopPropagation(); prev(); setPaused(true); }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-opacity hover:bg-black/50"
                onClick={(e) => { e.stopPropagation(); next(); setPaused(true); }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); setPaused(true); }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="event-body text-xs font-semibold uppercase tracking-widest event-card-muted-text">
              Highlights
            </h2>
            <p className="event-body mt-0.5 text-sm event-card-desc">
              {photo?.attendeeName && (
                <span className="text-xs event-card-muted-text">by {photo.attendeeName}</span>
              )}
            </p>
          </div>
          <button
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50"
            onClick={() => void downloadAll()}
            disabled={isDownloading}
            title="Download all highlights"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download All
          </button>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          onClick={() => setFullscreen(false)}
        >
          <div className="absolute right-4 top-4 z-10 flex gap-2">
            <button
              className="rounded-full bg-white/10 p-2 text-white"
              onClick={(e) => { e.stopPropagation(); void downloadPhoto(photo); }}
              title="Download photo"
            >
              <Download className="h-6 w-6" />
            </button>
            <button
              className="rounded-full bg-white/10 p-2 text-white"
              onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative h-screen w-full"
            onClick={() => setFullscreen(false)}
          >
            <Image
              src={photo?.url ?? ""}
              alt={`Highlight by ${photo?.attendeeName}`}
              fill
              className="object-contain"
            />
          </div>

          {total > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? "w-5 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
