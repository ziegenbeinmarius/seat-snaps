"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


interface AttendeeQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  tableName?: string | null;
  joinUrl: string;
  qrUrl: string;
  eventId: string;
  attendeeId: string;
}

export function AttendeeQrDialog({
  open,
  onOpenChange,
  name,
  tableName,
  joinUrl,
  eventId,
  attendeeId,
}: AttendeeQrDialogProps) {

  // Download QR PNG handler
  const handleDownloadQr = () => {
    window.open(`/api/events/${eventId}/attendees/${attendeeId}/qr`, "_blank");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>QR & Join Link</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="font-semibold text-base text-center">{name}</div>
          {tableName && <div className="text-xs text-muted-foreground">Table: {tableName}</div>}
          <Button className="my-2" size="sm" variant="outline" onClick={handleDownloadQr}>
            Download QR PNG
          </Button>
          <div className="w-full">
            <span className="block text-xs text-muted-foreground mb-1">Join link:</span>
            <a
              href={joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-xs text-blue-700 underline hover:text-blue-900"
            >
              {joinUrl}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
