"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, ZoomIn, X } from "lucide-react";
import { useOrganizerPhotos, useUpdatePhotoStatus, useDeletePhoto } from "@/lib/api/photos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PhotoResponse, PhotoStatus } from "@seat-snaps/shared";

type Filter = "all" | PhotoStatus;

interface Props {
  eventId: string;
}

const STATUS_BADGE: Record<PhotoStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  deleted: { label: "Deleted", variant: "outline" },
};

export function PhotoModerationPanel({ eventId }: Props) {
  const { data: photos = [], isLoading } = useOrganizerPhotos(eventId);
  const updateStatus = useUpdatePhotoStatus(eventId);
  const deletePhoto = useDeletePhoto(eventId);

  const [filter, setFilter] = useState<Filter>("all");
  const [lightbox, setLightbox] = useState<PhotoResponse | null>(null);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());

  const filtered = photos.filter((p) => filter === "all" || p.status === filter);

  const toggleSelect = (id: string) => {
    setBulkSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const bulkApprove = async () => {
    await Promise.all(
      [...bulkSelected].map((id) => updateStatus.mutateAsync({ photoId: id, status: "approved" })),
    );
    setBulkSelected(new Set());
  };

  const bulkReject = async () => {
    await Promise.all(
      [...bulkSelected].map((id) => updateStatus.mutateAsync({ photoId: id, status: "rejected" })),
    );
    setBulkSelected(new Set());
  };

  const counts = {
    all: photos.length,
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    rejected: photos.filter((p) => p.status === "rejected").length,
    deleted: photos.filter((p) => p.status === "deleted").length,
  };

  const filterTabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setBulkSelected(new Set()); }}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {bulkSelected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">{bulkSelected.size} selected</span>
          <Button size="sm" variant="outline" onClick={bulkApprove} disabled={updateStatus.isPending}>
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve all
          </Button>
          <Button size="sm" variant="outline" onClick={bulkReject} disabled={updateStatus.isPending}>
            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject all
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No photos in this filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((photo) => {
            const selected = bulkSelected.has(photo.id);
            const badge = STATUS_BADGE[photo.status];
            return (
              <div
                key={photo.id}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                {/* Checkbox */}
                <button
                  className="absolute left-2 top-2 z-10"
                  onClick={() => toggleSelect(photo.id)}
                >
                  <div
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-white/80 border-white/60"
                    }`}
                  >
                    {selected && <span className="text-[10px] leading-none">✓</span>}
                  </div>
                </button>

                {/* Status badge */}
                <div className="absolute right-2 top-2 z-10">
                  <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0">
                    {badge.label}
                  </Badge>
                </div>

                {/* Image */}
                <button
                  className="block aspect-square w-full"
                  onClick={() => setLightbox(photo)}
                >
                  <img
                    src={photo.thumbnailUrl ?? photo.url}
                    alt="Photo"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center justify-between gap-1 bg-white px-2 py-1.5">
                  <div className="flex gap-1">
                    {photo.status !== "approved" && (
                      <button
                        title="Approve"
                        onClick={() =>
                          updateStatus.mutate({ photoId: photo.id, status: "approved" })
                        }
                        className="rounded p-1 text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {photo.status !== "rejected" && (
                      <button
                        title="Reject"
                        onClick={() =>
                          updateStatus.mutate({ photoId: photo.id, status: "rejected" })
                        }
                        className="rounded p-1 text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    title="Delete"
                    onClick={() => {
                      if (confirm("Delete this photo permanently?")) {
                        deletePhoto.mutate(photo.id);
                      }
                    }}
                    className="rounded p-1 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Badge variant={STATUS_BADGE[lightbox.status].variant}>
              {STATUS_BADGE[lightbox.status].label}
            </Badge>
            <button
              className="rounded-full bg-white/10 p-2 text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <img
            src={lightbox.url}
            alt="Photo"
            className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
            {lightbox.status !== "approved" && (
              <Button
                size="sm"
                onClick={async () => {
                  await updateStatus.mutateAsync({ photoId: lightbox.id, status: "approved" });
                  setLightbox(null);
                }}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
              </Button>
            )}
            {lightbox.status !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  await updateStatus.mutateAsync({ photoId: lightbox.id, status: "rejected" });
                  setLightbox(null);
                }}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Reject
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
