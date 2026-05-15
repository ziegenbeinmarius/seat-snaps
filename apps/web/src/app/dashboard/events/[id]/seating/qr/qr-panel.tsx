"use client";

import { useAttendees } from "@/lib/api/attendees";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Props {
  eventId: string;
}

export function QrPanel({ eventId }: Props) {
  const { data: attendees = [], isLoading } = useAttendees(eventId);

  function downloadBulk() {
    window.open(`${API_BASE}/api/events/${eventId}/qr/bulk`, "_blank");
  }

  function downloadEventQr() {
    window.open(`${API_BASE}/api/events/${eventId}/qr/event`, "_blank");
  }

  function downloadAttendeeQr(attendeeId: string) {
    window.open(`${API_BASE}/api/events/${eventId}/attendees/${attendeeId}/qr`, "_blank");
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">QR Codes</h2>
        <div className="flex gap-2">
          <button
            onClick={downloadEventQr}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
          >
            Event QR
          </button>
          <button
            onClick={downloadBulk}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Download All (HTML)
          </button>
        </div>
      </div>

      {attendees.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attendees yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {attendees.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <div>
                <p className="text-sm font-medium">{a.name}</p>
                {a.groupLabel && (
                  <p className="text-xs text-muted-foreground">{a.groupLabel}</p>
                )}
              </div>
              <button
                onClick={() => downloadAttendeeQr(a.id)}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
              >
                QR PNG
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
