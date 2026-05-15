"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeletePhotoDialogProps {
  open: boolean;
  attendeeName?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeletePhotoDialog({
  open,
  attendeeName,
  isPending,
  onConfirm,
  onCancel,
}: DeletePhotoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete photo?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently remove the photo
          {attendeeName && (
            <>
              {" "}uploaded by{" "}
              <span className="font-medium text-foreground">{attendeeName}</span>
            </>
          )}{" "}
          and cannot be undone.
        </p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
