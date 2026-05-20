"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, Star, Loader2, Trash2 } from "lucide-react";
import { usePhotoModeration } from "@/lib/api/use-photo-moderation";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { DeletePhotoDialog } from "@/components/photos/delete-photo-dialog";
import type { PhotoResponse } from "@seat-snaps/shared";
import { MobilePageHeading } from "@/components/mobile/mobile-page-heading";
import { Card, CardContent } from "@/components/ui/card";

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
    toggleHighlight,
    updateStatus,
    deletePhoto,
  } = usePhotoModeration(eventId);

  const [filter, setFilter] = useState<MobileFilter>("pending");
  const [lightbox, setLightbox] = useState<PhotoResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhotoResponse | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

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
    setMutationError(null);
    approve(photo);
    if (lightbox?.id === photo.id) setLightbox(null);
  };

  const handleReject = (photo: PhotoResponse) => {
    setMutationError(null);
    reject(photo);
    if (lightbox?.id === photo.id) setLightbox(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setMutationError(null);
    remove(deleteTarget.id);
    setDeleteTarget(null);
    if (lightbox?.id === deleteTarget.id) setLightbox(null);
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
      <MobilePageHeading variant="organizer">Photos</MobilePageHeading>
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

      {mutationError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutationError}</p>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {filter === "pending" ? "No photos pending review." : "No photos here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-2xl">
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => setLightbox(photo)}
              >
                <Image
                  src={photo.thumbnailUrl ?? photo.url}
                  alt={`Photo by ${photo.attendeeName}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              <div
                className="flex items-center justify-between gap-1 px-2 py-2"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <span className="min-w-0 flex-1 truncate text-xs text-white/80">
                  {photo.attendeeName}
                </span>
                <div className="flex shrink-0 items-center gap-3">
                  {photo.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(photo)}
                      disabled={updateStatus.isPending}
                      aria-label="Approve"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 disabled:opacity-40"
                    >
                      <Check className="h-5 w-5 text-green-400" />
                    </button>
                  )}
                  {photo.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(photo)}
                      disabled={updateStatus.isPending}
                      aria-label="Reject"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 disabled:opacity-40"
                    >
                      <X className="h-5 w-5 text-red-400" />
                    </button>
                  )}
                  {photo.status === "approved" && (
                    <button
                      onClick={() => {
                        setMutationError(null);
                        toggleHighlightPhoto(photo);
                      }}
                      disabled={toggleHighlight.isPending}
                      aria-label={photo.isHighlight ? "Remove highlight" : "Highlight"}
                      className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
                    >
                      <Star
                        className={`h-5 w-5 ${photo.isHighlight ? "fill-yellow-400 text-yellow-400" : "text-white/50"}`}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(photo)}
                    disabled={deletePhoto.isPending}
                    aria-label="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 disabled:opacity-40"
                  >
                    <Trash2 className="h-5 w-5 text-white/50" />
                  </button>
                </div>
              </div>
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
          onDelete={() => {
            setDeleteTarget(lightbox);
            setLightbox(null);
          }}
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
