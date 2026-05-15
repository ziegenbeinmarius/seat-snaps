"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Check, X, Star, Loader2 } from "lucide-react";
import { usePhotoModeration } from "@/lib/api/use-photo-moderation";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { DeletePhotoDialog } from "@/components/photos/delete-photo-dialog";
import type { PhotoResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

type MobileFilter = "pending" | "all" | "approved";

export function MobilePhotosPanel({ eventId }: Props) {
  const {
    photos,
    counts,
    isLoading,
    approve,
    reject,
    remove,
    toggleHighlightPhoto,
    updateStatus,
    deletePhoto,
    toggleHighlight,
  } = usePhotoModeration(eventId);

  const [filter, setFilter] = useState<MobileFilter>("pending");
  const [lightbox, setLightbox] = useState<PhotoResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhotoResponse | null>(null);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const filtered = photos.filter((p) => {
    if (filter === "pending") return p.status === "pending";
    if (filter === "approved") return p.status === "approved";
    return p.status !== "deleted";
  });

  const mobileCounts = {
    pending: counts.pending,
    approved: counts.approved,
    all: photos.filter((p) => p.status !== "deleted").length,
  };

  const handleApprove = (photo: PhotoResponse) => {
    approve(photo);
    if (lightbox?.id === photo.id) setLightbox(null);
  };

  const handleReject = (photo: PhotoResponse) => {
    reject(photo);
    if (lightbox?.id === photo.id) setLightbox(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    setDeleteTarget(null);
    if (lightbox?.id === deleteTarget.id) setLightbox(null);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent, photo: PhotoResponse) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (dy > 40) return;
    if (dx > 70) handleApprove(photo);
    else if (dx < -70) handleReject(photo);
  };

  const filterTabs: { key: MobileFilter; label: string; count: number }[] = [
    { key: "pending", label: "Pending", count: mobileCounts.pending },
    { key: "approved", label: "Approved", count: mobileCounts.approved },
    { key: "all", label: "All", count: mobileCounts.all },
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
              onClick={() => setLightbox(photo)}
            >
              <div className="relative aspect-square">
                <Image
                  src={photo.thumbnailUrl ?? photo.url}
                  alt={`Photo by ${photo.attendeeName}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5"
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

              {photo.status === "pending" && (
                <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 transition-opacity active:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/80">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/80">
                    <X className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <PhotoLightbox
          photo={lightbox}
          variant="mobile"
          isPending={updateStatus.isPending}
          isHighlightPending={toggleHighlight.isPending}
          onClose={() => setLightbox(null)}
          onApprove={() => handleApprove(lightbox)}
          onReject={() => handleReject(lightbox)}
          onToggleHighlight={() => toggleHighlightPhoto(lightbox)}
        />
      )}

      <DeletePhotoDialog
        open={!!deleteTarget}
        attendeeName={deleteTarget?.attendeeName}
        isPending={deletePhoto.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
