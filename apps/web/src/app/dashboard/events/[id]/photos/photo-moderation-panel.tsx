"use client";

import { useState } from "react";
import { Check, X, Trash2, ZoomIn, User } from "lucide-react";
import { useOrganizerPhotos, useUpdatePhotoStatus, useDeletePhoto } from "@/lib/api/photos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PhotoResponse, PhotoStatus } from "@seat-snaps/shared";

type Filter = "all" | PhotoStatus;

interface Props {
  eventId: string;
}

const STATUS_BADGE: Record<
  PhotoStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
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
  const [deleteTarget, setDeleteTarget] = useState<PhotoResponse | null>(null);

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
    deletePhoto.mutate(deleteTarget.id);
    setDeleteTarget(null);
    if (lightbox?.id === deleteTarget.id) setLightbox(null);
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
      <div className="flex flex-wrap gap-2">
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
            const badge = STATUS_BADGE[photo.status];
            return (
              <div
                key={photo.id}
                className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                {/* Image area */}
                <div className="relative aspect-square">
                  <img
                    src={photo.thumbnailUrl ?? photo.url}
                    alt={`Photo by ${photo.attendeeName}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Decorative hover overlay — never intercepts clicks */}
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

                  {/* Checkbox — top-left */}
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

                  {/* Status badge — top-right */}
                  <div className="absolute right-2 top-2 z-20">
                    <Badge variant={badge.variant} className="px-1.5 py-0 text-[10px]">
                      {badge.label}
                    </Badge>
                  </div>

                  {/* Hover quick actions — centred on image */}
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

                {/* Action bar — below image, outside image area so no overlap */}
                <div className="flex items-center justify-between gap-1 bg-white px-2 py-1.5">
                  <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{photo.attendeeName}</span>
                  </span>
                  <button
                    title="Delete permanently"
                    onClick={() => setDeleteTarget(photo)}
                    className="shrink-0 rounded p-1 text-red-500 transition-colors hover:bg-red-50"
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
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_BADGE[lightbox.status].variant}>
                {STATUS_BADGE[lightbox.status].label}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-white/70">
                <User className="h-3.5 w-3.5" />
                {lightbox.attendeeName}
              </span>
            </div>
            <button
              className="rounded-full bg-white/10 p-2 text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <img
            src={lightbox.url}
            alt={`Photo by ${lightbox.attendeeName}`}
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
                <Check className="mr-1.5 h-4 w-4" /> Approve
              </Button>
            )}
            {lightbox.status !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={async () => {
                  await updateStatus.mutateAsync({ photoId: lightbox.id, status: "rejected" });
                  setLightbox(null);
                }}
              >
                <X className="mr-1.5 h-4 w-4" /> Reject
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setDeleteTarget(lightbox);
                setLightbox(null);
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete photo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently remove the photo uploaded by{" "}
            <span className="font-medium text-foreground">{deleteTarget?.attendeeName}</span> and
            cannot be undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deletePhoto.isPending}
            >
              {deletePhoto.isPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
