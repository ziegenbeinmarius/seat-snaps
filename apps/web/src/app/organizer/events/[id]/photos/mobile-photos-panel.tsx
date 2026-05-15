"use client";

import { useState } from "react";
import { Check, X, Star, Loader2, Trash2 } from "lucide-react";
import {
  useOrganizerPhotos,
  useUpdatePhotoStatus,
  useToggleHighlight,
  useDeletePhoto,
} from "@/lib/api/photos";
import type { PhotoResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

type Filter = "pending" | "all" | "approved";

export function MobilePhotosPanel({ eventId }: Props) {
  const { data: photos = [], isLoading } = useOrganizerPhotos(eventId);
  const updateStatus = useUpdatePhotoStatus(eventId);
  const toggleHighlight = useToggleHighlight(eventId);
  const deletePhoto = useDeletePhoto(eventId);

  const [filter, setFilter] = useState<Filter>("pending");
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const lightbox = lightboxId ? (photos.find((p) => p.id === lightboxId) ?? null) : null;
  const [mutationError, setMutationError] = useState<string | null>(null);

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

  const onError = (err: Error) => setMutationError(err.message);

  const handleApprove = (photo: PhotoResponse) => {
    setMutationError(null);
    updateStatus.mutate({ photoId: photo.id, status: "approved" }, { onError });
    if (lightboxId === photo.id) setLightboxId(null);
  };

  const handleReject = (photo: PhotoResponse) => {
    setMutationError(null);
    updateStatus.mutate({ photoId: photo.id, status: "rejected" }, { onError });
    if (lightboxId === photo.id) setLightboxId(null);
  };

  const handleDelete = (photo: PhotoResponse) => {
    setMutationError(null);
    deletePhoto.mutate(photo.id, { onError });
    if (lightboxId === photo.id) setLightboxId(null);
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

      {mutationError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutationError}</p>
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
            <div key={photo.id} className="overflow-hidden rounded-2xl">
              {/* Thumbnail — tap to open lightbox */}
              <div
                className="aspect-square cursor-pointer"
                onClick={() => setLightboxId(photo.id)}
              >
                <img
                  src={photo.thumbnailUrl ?? photo.url}
                  alt={`Photo by ${photo.attendeeName}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Action strip below photo */}
              <div
                className="flex items-center justify-between gap-1 px-2 py-1.5"
                style={{ background: "rgba(0,0,0,0.7)" }}
              >
                <span className="min-w-0 flex-1 truncate text-xs text-white/80">
                  {photo.attendeeName}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  {photo.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(photo)}
                      disabled={updateStatus.isPending}
                      aria-label="Approve"
                      className="disabled:opacity-40"
                    >
                      <Check className="h-4 w-4 text-green-400" />
                    </button>
                  )}
                  {photo.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(photo)}
                      disabled={updateStatus.isPending}
                      aria-label="Reject"
                      className="disabled:opacity-40"
                    >
                      <X className="h-4 w-4 text-red-400" />
                    </button>
                  )}
                  {photo.status === "approved" && (
                    <button
                      onClick={() =>
                        toggleHighlight.mutate(
                          { photoId: photo.id, isHighlight: !photo.isHighlight },
                          { onError },
                        )
                      }
                      disabled={toggleHighlight.isPending}
                      aria-label={photo.isHighlight ? "Remove highlight" : "Highlight"}
                      className="disabled:opacity-40"
                    >
                      <Star
                        className={`h-4 w-4 ${photo.isHighlight ? "fill-yellow-400 text-yellow-400" : "text-white/50"}`}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={deletePhoto.isPending}
                    aria-label="Delete"
                    className="disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4 text-white/50 hover:text-red-400" />
                  </button>
                </div>
              </div>
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
              onClick={(e) => { e.stopPropagation(); setLightboxId(null); }}
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
                onClick={() =>
                  toggleHighlight.mutate(
                    { photoId: lightbox.id, isHighlight: !lightbox.isHighlight },
                    { onError },
                  )
                }
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
            <button
              onClick={() => handleDelete(lightbox)}
              disabled={deletePhoto.isPending}
              className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white/70 disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
