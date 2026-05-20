"use client";

import { useAttendees, useUpdateAttendeeStatus, useBulkUpdateAttendeeStatus } from "@/lib/api/attendees";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { CheckCircle2, Clock, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
  initialAttendees: AttendeeResponse[];
}

export function OrganizerAttendeesPanel({ eventId, initialAttendees }: Props) {
  const { data: attendees = initialAttendees } = useAttendees(eventId);
  const updateStatusMutation = useUpdateAttendeeStatus(eventId);
  const bulkStatusMutation = useBulkUpdateAttendeeStatus(eventId);

  const checkedIn = attendees.filter((a) => a.checkedInAt != null).length;
  const pendingAttendees = attendees.filter((a) => a.status === "pending");
  const nonPendingAttendees = attendees.filter((a) => a.status !== "pending");

  async function handleApprove(attendeeId: string) {
    await updateStatusMutation.mutateAsync({ attendeeId, status: "confirmed" });
  }

  async function handleDecline(attendeeId: string) {
    await updateStatusMutation.mutateAsync({ attendeeId, status: "declined" });
  }

  async function handleApproveAll() {
    const ids = pendingAttendees.map((a) => a.id);
    if (ids.length === 0) return;
    await bulkStatusMutation.mutateAsync({ attendeeIds: ids, status: "confirmed" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-cormorant, Georgia, serif)" }}>
          Attendees
        </h2>
        <span className="text-sm text-[hsl(28_8%_52%)]">
          {checkedIn} / {attendees.length} checked in
        </span>
      </div>

      {/* Pending RSVP section */}
      {pendingAttendees.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-amber-800">
              Pending RSVP ({pendingAttendees.length})
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 text-xs h-7 px-2"
              onClick={handleApproveAll}
              disabled={bulkStatusMutation.isPending}
            >
              Approve All
            </Button>
          </div>
          <div className="space-y-2">
            {pendingAttendees.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                  {a.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[hsl(28_8%_20%)]">{a.name}</p>
                  {a.email && (
                    <p className="truncate text-xs text-[hsl(28_8%_52%)]">{a.email}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleApprove(a.id)}
                    disabled={updateStatusMutation.isPending}
                    aria-label="Approve"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDecline(a.id)}
                    disabled={updateStatusMutation.isPending}
                    aria-label="Decline"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed / all other attendees */}
      {nonPendingAttendees.length === 0 && pendingAttendees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-[hsl(28_8%_52%)]">
            No attendees yet.
          </CardContent>
        </Card>
      ) : nonPendingAttendees.length > 0 ? (
        <div className="space-y-2">
          {pendingAttendees.length > 0 && (
            <h3 className="text-sm font-semibold text-[hsl(28_8%_52%)]">
              Confirmed ({nonPendingAttendees.filter((a) => a.status === "confirmed").length})
            </h3>
          )}
          {nonPendingAttendees.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 rounded-xl border border-[rgba(200,175,140,0.3)] bg-white/60 px-4 py-3"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  a.checkedInAt
                    ? "bg-[hsl(28_65%_44%)] text-white"
                    : "bg-[rgba(200,175,140,0.2)] text-[hsl(28_8%_52%)]",
                )}
              >
                {a.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[hsl(28_8%_20%)]">{a.name}</p>
                {(a.email ?? a.groupLabel) && (
                  <p className="truncate text-xs text-[hsl(28_8%_52%)]">
                    {a.groupLabel ?? a.email}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                {a.checkedInAt ? (
                  <span className="flex items-center gap-1 text-xs text-[hsl(28_65%_44%)]">
                    <CheckCircle2 className="h-4 w-4" />
                    {new Date(a.checkedInAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-[hsl(28_8%_65%)]">
                    <Clock className="h-4 w-4" />
                    Not yet
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
