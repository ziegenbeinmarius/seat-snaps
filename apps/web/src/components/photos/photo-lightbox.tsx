"use client";

import Image from "next/image";
import { Check, X, Trash2, Star, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PHOTO_STATUS_BADGE } from "./photo-constants";
import type { PhotoResponse } from "@seat-snaps/shared";

interface PhotoLightboxProps {
  photo: PhotoResponse;
  variant?: "desktop" | "mobile";
  isPending?: boolean;
  isHighlightPending?: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onToggleHighlight?: () => void;
}

export function PhotoLightbox({
  photo,
  variant = "desktop",
  isPending,
  isHighlightPending,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onToggleHighlight,
}: PhotoLightboxProps) {
  if (variant === "mobile") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-black/95"
        onClick={onClose}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">{photo.attendeeName}</span>
            <Badge variant={PHOTO_STATUS_BADGE[photo.status].variant} className="px-1.5 py-0 text-[10px]">
              {PHOTO_STATUS_BADGE[photo.status].label}
            </Badge>
          </div>
          <button
            className="rounded-full bg-white/10 p-2 text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <div style={{ position: "relative", width: "100%", height: "100%", maxWidth: "90vw", maxHeight: "70vh" }}>
            <Image
              src={photo.url}
              alt={`Photo by ${photo.attendeeName}`}
              fill
              sizes="90vw"
              className="rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
              priority
            />
          </div>
        </div>

        <div
          className="flex gap-3 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.status !== "approved" && onApprove && (
            <Button
              onClick={onApprove}
              disabled={isPending}
              className="flex-1 rounded-2xl py-3.5 text-sm font-semibold"
              style={{ background: "hsl(130 45% 42%)" }}
            >
              <Check className="mr-1.5 h-5 w-5" />
              Approve
            </Button>
          )}
          {photo.status !== "rejected" && onReject && (
            <Button
              onClick={onReject}
              disabled={isPending}
              variant="destructive"
              className="flex-1 rounded-2xl py-3.5 text-sm font-semibold"
              style={{ background: "hsl(0 65% 52%)" }}
            >
              <X className="mr-1.5 h-5 w-5" />
              Reject
            </Button>
          )}
          {photo.status === "approved" && onToggleHighlight && (
            <Button
              onClick={onToggleHighlight}
              disabled={isHighlightPending}
              variant="ghost"
              className="rounded-2xl px-4 py-3.5 text-sm font-semibold"
              style={{
                background: photo.isHighlight ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.1)",
                color: photo.isHighlight ? "hsl(45 90% 45%)" : "white",
              }}
            >
              <Star className={`h-5 w-5 ${photo.isHighlight ? "fill-yellow-400" : ""}`} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  const badge = PHOTO_STATUS_BADGE[photo.status];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant}>
            {badge.label}
          </Badge>
          <span className="flex items-center gap-1 text-sm text-white/70">
            <User className="h-3.5 w-3.5" />
            {photo.attendeeName}
          </span>
        </div>
        <button
          className="rounded-full bg-white/10 p-2 text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div style={{ position: "relative", width: "90vw", height: "80vh", maxWidth: "90vw", maxHeight: "80vh" }}>
        <Image
          src={photo.url}
          alt={`Photo by ${photo.attendeeName}`}
          fill
          sizes="90vw"
          className="rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
          priority
        />
      </div>

      <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
        {photo.status !== "approved" && onApprove && (
          <Button size="sm" onClick={onApprove}>
            <Check className="mr-1.5 h-4 w-4" /> Approve
          </Button>
        )}
        {photo.status !== "rejected" && onReject && (
          <Button
            size="sm"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
            onClick={onReject}
          >
            <X className="mr-1.5 h-4 w-4" /> Reject
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        )}
      </div>
    </div>
  );
}
