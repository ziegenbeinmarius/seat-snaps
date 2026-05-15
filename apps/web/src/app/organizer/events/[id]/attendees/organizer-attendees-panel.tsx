"use client";

import { useAttendees } from "@/lib/api/attendees";
import { Card, CardContent } from "@/components/ui/card";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  eventId: string;
  initialAttendees: AttendeeResponse[];
}

export function OrganizerAttendeesPanel({ eventId, initialAttendees }: Props) {
  const { data: attendees = initialAttendees } = useAttendees(eventId);

  const checkedIn = attendees.filter((a) => a.checkedInAt != null).length;

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

      {attendees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-[hsl(28_8%_52%)]">
            No attendees yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {attendees.map((a) => (
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
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
