"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, Trash2, ZoomIn, User, Star, Download, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import { usePhotoModeration, type PhotoFilter } from "@/lib/api/use-photo-moderation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PHOTO_STATUS_BADGE } from "@/components/photos/photo-constants";
import { PhotoLightbox } from "@/components/photos/photo-lightbox";
import { DeletePhotoDialog } from "@/components/photos/delete-photo-dialog";
import type { PhotoResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

export function PhotoModerationPanel({ eventId }: Props) {
  const {
    filtered,
    counts,
    filter,
    setFilter,
    isLoading,
    approveAsync,
    rejectAsync,
    remove,
    toggleHighlightPhoto,
    updateStatus,
    deletePhoto,
  } = usePhotoModeration(eventId);

  const [lightbox, setLightbox] = useState<PhotoResponse | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<PhotoResponse | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleSelect = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const bulkApprove = async () => {
    await Promise.all(
      [...bulkSelected].map((id) =>
        updateStatus.mutateAsync({ photoId: id, status: "approved" }),
      ),
    );
    setBulkSelected(new Set());
  };

  const bulkReject = async () => {
    await Promise.all(
      [...bulkSelected].map((id) =>
        updateStatus.mutateAsync({ photoId: id, status: "rejected" }),
      ),
    );
    setBulkSelected(new Set());
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    setDeleteTarget(null);
    if (lightbox?.id === deleteTarget.id) setLightbox(null);
  };

  const downloadAll = async (photosToDownload: PhotoResponse[], zipName: string) => {
    if (photosToDownload.length === 0) {
      toast.error("No photos to download");
      return;
    }
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      await Promise.all(
        photosToDownload.map(async (photo, i) => {
          const res = await fetch(photo.url);
          if (!res.ok) return;
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] ?? "jpg";
          zip.file(`${String(i + 1).padStart(3, "0")}_${photo.attendeeName.replace(/[^a-z0-9]/gi, "_")}.${ext}`, blob);
        }),
      );
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${photosToDownload.length} photos`);
    } catch {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const filterTabs: { key: PhotoFilter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
    { key: "highlight", label: `Highlights (${counts.highlight})` },
  ];

  const downloadablePhotos = filter === "approved"
    ? filtered.filter((p) => p.status === "approved")
    : filter === "highlight"
    ? filtered.filter((p) => p.isHighlight)
    : null;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              setBulkSelected(new Set());
            }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
        {downloadablePhotos && downloadablePhotos.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              downloadAll(
                downloadablePhotos,
                `photos-${filter}-${Date.now()}.zip`,
              )
            }
            disabled={isDownloading}
            className="ml-auto"
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" />
            )}
            Download all ({downloadablePhotos.length})
          </Button>
        )}
      </div>

      {/* Bulk actions */}
      {bulkSelected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">{bulkSelected.size} selected</span>
          <Button
            size="sm"
            variant="outline"
            onClick={bulkApprove}
            disabled={updateStatus.isPending}
          >
            <Check className="mr-1.5 h-3.5 w-3.5" /> Approve all
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={bulkReject}
            disabled={updateStatus.isPending}
          >
            <X className="mr-1.5 h-3.5 w-3.5" /> Reject all
          </Button>
          <button
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setBulkSelected(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No photos in this filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((photo) => {
            const selected = bulkSelected.has(photo.id);
            const badge = PHOTO_STATUS_BADGE[photo.status];
            return (
              <div
                key={photo.id}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                <div className="relative aspect-square">
                  <Image
                    src={photo.thumbnailUrl ?? photo.url}
                    alt={`Photo by ${photo.attendeeName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                    style={{ borderRadius: "inherit" }}
                    priority={filter === "highlight"}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                  <button
                    className="absolute left-2 top-2 z-20"
                    onClick={() => toggleSelect(photo.id)}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-white/60 bg-white/80"
                      }`}
                    >
                      {selected && <span className="text-[10px] leading-none">✓</span>}
                    </div>
                  </button>

                  <div className="absolute right-2 top-2 z-20">
                    <Badge variant={badge.variant} className="px-1.5 py-0 text-[10px]">
                      {badge.label}
                    </Badge>
                  </div>

                  <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    {photo.status !== "approved" && (
                      <button
                        title="Approve"
                        onClick={() =>
                          updateStatus.mutate({ photoId: photo.id, status: "approved" })
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      title="View full size"
                      onClick={() => setLightbox(photo)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white shadow backdrop-blur-sm transition-transform hover:scale-110"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    {photo.status !== "rejected" && (
                      <button
                        title="Reject"
                        onClick={() =>
                          updateStatus.mutate({ photoId: photo.id, status: "rejected" })
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 bg-white px-2 py-1.5">
                  <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{photo.attendeeName}</span>
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {photo.status === "approved" && (
                      <button
                        title={photo.isHighlight ? "Remove from highlights" : "Add to highlights"}
                        onClick={() => toggleHighlightPhoto(photo)}
                        className={`rounded p-1 transition-colors ${
                          photo.isHighlight
                            ? "text-yellow-500 hover:bg-yellow-50"
                            : "text-muted-foreground hover:bg-yellow-50 hover:text-yellow-500"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${photo.isHighlight ? "fill-yellow-400" : ""}`} />
                      </button>
                    )}
                    <button
                      title="Delete permanently"
                      onClick={() => setDeleteTarget(photo)}
                      className="rounded p-1 text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightbox && (
        <PhotoLightbox
          photo={lightbox}
          variant="desktop"
          isPending={updateStatus.isPending}
          onClose={() => setLightbox(null)}
          onApprove={async () => {
            await approveAsync(lightbox);
            setLightbox(null);
          }}
          onReject={async () => {
            await rejectAsync(lightbox);
            setLightbox(null);
          }}
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
