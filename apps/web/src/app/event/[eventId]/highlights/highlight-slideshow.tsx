"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useHighlightPhotos } from "@/lib/api/photos";

interface Props {
  eventId: string;
  autoAdvanceMs?: number;
}

export function HighlightSlideshow({ eventId, autoAdvanceMs = 4000 }: Props) {
  const { data: photos = [], isLoading } = useHighlightPhotos(eventId);
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [paused, setPaused] = useState(false);

  const total = photos.length;

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
            <img
              key={photo?.id}
              src={photo?.url}
              alt={`Highlight by ${photo?.attendeeName}`}
              className="h-full w-full object-contain transition-opacity duration-500"
            />
            <button
              className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); setFullscreen(true); }}
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
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

        <div className="px-4 py-3">
          <h2 className="event-body text-xs font-semibold uppercase tracking-widest event-card-muted-text">
            Highlights
          </h2>
          <p className="event-body mt-0.5 text-sm event-card-desc">
            {photo?.attendeeName && (
              <span className="text-xs event-card-muted-text">by {photo.attendeeName}</span>
            )}
          </p>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          onClick={() => setFullscreen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setFullscreen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={photo?.url}
            alt={`Highlight by ${photo?.attendeeName}`}
            className="max-h-screen max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

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
