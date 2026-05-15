import type { PhotoStatus } from "@seat-snaps/shared";

export const PHOTO_STATUS_BADGE: Record<
  PhotoStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  deleted: { label: "Deleted", variant: "outline" },
};
