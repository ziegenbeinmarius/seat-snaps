"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete photo?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the photo
            {attendeeName && (
              <>
                {" "}uploaded by{" "}
                <span className="font-medium text-foreground">{attendeeName}</span>
              </>
            )}{" "}
            and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
