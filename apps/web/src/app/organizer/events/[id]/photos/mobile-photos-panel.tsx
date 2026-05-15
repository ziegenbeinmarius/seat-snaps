"use client";

import { useRef, useState } from "react";
import { Check, X, Star, Loader2 } from "lucide-react";
import { useOrganizerPhotos, useUpdatePhotoStatus, useToggleHighlight } from "@/lib/api/photos";
import type { PhotoResponse, PhotoStatus } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

type Filter = "pending" | "all" | "approved";

export function MobilePhotosPanel({ eventId }: Props) {
  const { data: photos = [], isLoading } = useOrganizerPhotos(eventId);
  const updateStatus = useUpdatePhotoStatus(eventId);
  const toggleHighlight = useToggleHighlight(eventId);

  const [filter, setFilter] = useState<Filter>("pending");
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const lightbox = lightboxId ? (photos.find((p) => p.id === lightboxId) ?? null) : null;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const filtered = photos.filter((p) => {
    if (filter === "pending") return p.status === "pending";
    if (filter === "approved") return p.status === "approved";
    return p.status !== "deleted";
  });

  const counts = {
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    all: photos.filter((p) => p.status !== "deleted").length,
  };

  const handleApprove = (photo: PhotoResponse) => {
    updateStatus.mutate({ photoId: photo.id, status: "approved" });
    if (lightboxId === photo.id) setLightboxId(null);
  };

  const handleReject = (photo: PhotoResponse) => {
    updateStatus.mutate({ photoId: photo.id, status: "rejected" });
    if (lightboxId === photo.id) setLightboxId(null);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent, photo: PhotoResponse) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (dy > 40) return; // vertical scroll, ignore
    if (dx > 70) handleApprove(photo);
    else if (dx < -70) handleReject(photo);
  };

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "all", label: "All", count: counts.all },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "hsl(28 65% 44%)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {filterTabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex-1 rounded-xl py-2 text-sm font-medium transition-all"
            style={
              filter === key
                ? { background: "hsl(28 65% 44%)", color: "white" }
                : {
                    background: "rgba(255,252,247,0.75)",
                    color: "hsl(28 8% 52%)",
                    border: "1px solid rgba(220,210,195,0.6)",
                  }
            }
          >
            {label}
            {count > 0 && (
              <span
                className="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
                style={
                  filter === key
                    ? { background: "rgba(255,255,255,0.25)" }
                    : { background: "rgba(200,175,140,0.2)" }
                }
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filter === "pending" && filtered.length > 0 && (
        <p className="text-center text-xs" style={{ color: "hsl(28 8% 55%)" }}>
          Swipe right to approve · swipe left to reject
        </p>
      )}

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl py-16 text-center"
          style={{ background: "rgba(255,252,247,0.75)", border: "1px solid rgba(220,210,195,0.6)" }}
        >
          <p className="text-sm" style={{ color: "hsl(28 8% 52%)" }}>
            {filter === "pending" ? "No photos pending review." : "No photos here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="relative overflow-hidden rounded-2xl"
              onTouchStart={onTouchStart}
              onTouchEnd={(e) => onTouchEnd(e, photo)}
              onClick={() => setLightboxId(photo.id)}
            >
              <div className="aspect-square">
                <img
                  src={photo.thumbnailUrl ?? photo.url}
                  alt={`Photo by ${photo.attendeeName}`}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Status indicator */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5"
                style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              >
                <span className="truncate text-xs text-white/80">{photo.attendeeName}</span>
                {photo.status === "approved" && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-green-400" />
                )}
                {photo.status === "rejected" && (
                  <X className="h-3.5 w-3.5 shrink-0 text-red-400" />
                )}
                {photo.isHighlight && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                )}
              </div>

              {/* Quick action buttons for pending */}
              {photo.status === "pending" && (
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/80 active:bg-green-600"
                    onClick={(e) => { e.stopPropagation(); handleApprove(photo); }}
                    aria-label="Approve"
                  >
                    <Check className="h-6 w-6 text-white" />
                  </button>
                  <button
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/80 active:bg-red-600"
                    onClick={(e) => { e.stopPropagation(); handleReject(photo); }}
                    aria-label="Reject"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setLightboxId(null)}
        >
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-white">{lightbox.attendeeName}</span>
            <button
              className="rounded-full bg-white/10 p-2 text-white"
              onClick={() => setLightboxId(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center px-4">
            <img
              src={lightbox.url}
              alt={`Photo by ${lightbox.attendeeName}`}
              className="max-h-full max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Action bar */}
          <div
            className="flex gap-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.status !== "approved" && (
              <button
                onClick={() => handleApprove(lightbox)}
                disabled={updateStatus.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "hsl(130 45% 42%)" }}
              >
                <Check className="h-5 w-5" />
                Approve
              </button>
            )}
            {lightbox.status !== "rejected" && (
              <button
                onClick={() => handleReject(lightbox)}
                disabled={updateStatus.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: "hsl(0 65% 52%)" }}
              >
                <X className="h-5 w-5" />
                Reject
              </button>
            )}
            {lightbox.status === "approved" && (
              <button
                onClick={() => toggleHighlight.mutate({ photoId: lightbox.id, isHighlight: !lightbox.isHighlight })}
                disabled={toggleHighlight.isPending}
                className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold disabled:opacity-50"
                style={{
                  background: lightbox.isHighlight ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.1)",
                  color: lightbox.isHighlight ? "hsl(45 90% 45%)" : "white",
                }}
              >
                <Star className={`h-5 w-5 ${lightbox.isHighlight ? "fill-yellow-400" : ""}`} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
