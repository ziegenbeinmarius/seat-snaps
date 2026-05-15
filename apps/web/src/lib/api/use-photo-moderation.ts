"use client";

import { useState } from "react";
import { useOrganizerPhotos, useUpdatePhotoStatus, useDeletePhoto, useToggleHighlight } from "./photos";
import type { PhotoResponse, PhotoStatus } from "@seat-snaps/shared";

export type PhotoFilter = "all" | PhotoStatus | "highlight";

export function usePhotoModeration(eventId: string) {
  const { data: photos = [], isLoading } = useOrganizerPhotos(eventId);
  const updateStatus = useUpdatePhotoStatus(eventId);
  const deletePhoto = useDeletePhoto(eventId);
  const toggleHighlight = useToggleHighlight(eventId);
  const [filter, setFilter] = useState<PhotoFilter>("all");

  const filtered = photos.filter((p) => {
    if (filter === "all") return true;
    if (filter === "highlight") return p.isHighlight;
    return p.status === filter;
  });

  const counts = {
    all: photos.length,
    pending: photos.filter((p) => p.status === "pending").length,
    approved: photos.filter((p) => p.status === "approved").length,
    rejected: photos.filter((p) => p.status === "rejected").length,
    deleted: photos.filter((p) => p.status === "deleted").length,
    highlight: photos.filter((p) => p.isHighlight).length,
  };

  function approve(photo: PhotoResponse) {
    updateStatus.mutate({ photoId: photo.id, status: "approved" });
  }

  function reject(photo: PhotoResponse) {
    updateStatus.mutate({ photoId: photo.id, status: "rejected" });
  }

  function approveAsync(photo: PhotoResponse) {
    return updateStatus.mutateAsync({ photoId: photo.id, status: "approved" });
  }

  function rejectAsync(photo: PhotoResponse) {
    return updateStatus.mutateAsync({ photoId: photo.id, status: "rejected" });
  }

  function remove(photoId: string) {
    deletePhoto.mutate(photoId);
  }

  function toggleHighlightPhoto(photo: PhotoResponse) {
    toggleHighlight.mutate({ photoId: photo.id, isHighlight: !photo.isHighlight });
  }

  return {
    photos,
    filtered,
    counts,
    filter,
    setFilter,
    isLoading,
    approve,
    reject,
    approveAsync,
    rejectAsync,
    remove,
    toggleHighlightPhoto,
    updateStatus,
    deletePhoto,
    toggleHighlight,
  };
}
