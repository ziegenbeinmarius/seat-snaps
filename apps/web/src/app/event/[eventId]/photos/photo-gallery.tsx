"use client";

import React, { useState, useRef, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { Camera, Upload, X, ZoomIn } from "lucide-react";
import {
  useAttendeePhotos,
  useRequestUploadUrl,
  useConfirmUpload,
} from "@/lib/api/photos";
import type { PhotoResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
  photoLimit: number;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 5,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
};

export function PhotoGallery({ eventId, photoLimit }: Props) {
  const { data: photos = [], isLoading } = useAttendeePhotos(eventId);
  const requestUrl = useRequestUploadUrl(eventId);
  const confirmUpload = useConfirmUpload(eventId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [lightbox, setLightbox] = useState<PhotoResponse | null>(null);
  const [error, setError] = useState<string>("");

  const myPhotos = photos;
  const remaining = photoLimit - myPhotos.length;

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (remaining <= 0) {
        setError("You've reached your photo limit.");
        return;
      }

      setError("");
      setUploading(true);
      try {
        setUploadProgress("Compressing…");
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
        const contentType = compressed.type || "image/jpeg";

        setUploadProgress("Requesting upload URL…");
        const { uploadUrl, photoId } = await requestUrl.mutateAsync({ contentType });

        setUploadProgress("Uploading to storage…");
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: compressed,
          headers: { "Content-Type": contentType },
        });
        if (!uploadRes.ok) throw new Error("Upload failed");

        setUploadProgress("Confirming…");
        await confirmUpload.mutateAsync({ photoId });
        setUploadProgress("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setUploadProgress("");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [remaining, requestUrl, confirmUpload],
  );

  return (
    <div className="p-4 space-y-4">
      {/* Upload area */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            {myPhotos.length}/{photoLimit} photos uploaded
          </span>
          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (myPhotos.length / photoLimit) * 100)}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {uploading ? (
          <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-blue-200 p-4 text-blue-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm">{uploadProgress || "Uploading…"}</span>
          </div>
        ) : remaining > 0 ? (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-6 transition-colors hover:border-blue-300 hover:bg-blue-50">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <Camera className="h-8 w-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">Take or upload a photo</p>
              <p className="text-xs text-gray-400 mt-0.5">{remaining} remaining</p>
            </div>
            <div className="flex gap-2 mt-1">
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                <Camera className="h-3 w-3" /> Camera
              </span>
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <Upload className="h-3 w-3" /> Gallery
              </span>
            </div>
          </label>
        ) : (
          <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
            You've used all {photoLimit} photo slots
          </div>
        )}
      </div>

      {/* Gallery grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : myPhotos.length > 0 ? (
        <div className="grid grid-cols-3 gap-1">
          {myPhotos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setLightbox(photo)}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 group"
            >
              <img
                src={photo.thumbnailUrl ?? photo.url}
                alt="Photo"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity">
                <ZoomIn className="h-6 w-6 text-white" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <Camera className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No photos yet — be the first to snap one!</p>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightbox.url}
            alt="Photo"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
