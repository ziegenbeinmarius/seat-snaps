"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/broadcast/socket-provider";
import { usePublicTables } from "@/lib/api/tables";
import { useCurrentAttendee, useEventAttendeesPublic } from "@/lib/api/attendee-session";
import { RoomLayout } from "./room-layout";

interface Props {
  eventId: string;
}

export function SeatingLive({ eventId }: Props) {
  const qc = useQueryClient();
  const { seatingUpdateAt } = useSocket();

  const { data: tables = [] } = usePublicTables(eventId);
  const { data: attendee } = useCurrentAttendee();
  const { data: attendeesList = [] } = useEventAttendeesPublic(eventId);

  useEffect(() => {
    if (seatingUpdateAt === null) return;
    void qc.invalidateQueries({ queryKey: ["events", eventId, "tables", "public"] });
    void qc.invalidateQueries({ queryKey: ["attendee-session", "me"] });
    void qc.invalidateQueries({ queryKey: ["events", eventId, "attendees", "public"] });
  }, [seatingUpdateAt, eventId, qc]);

  const attendeesMap = Object.fromEntries(attendeesList.map((a) => [a.id, a.name]));
  const hasPositions = tables.some((t) => t.positionX != null && t.positionY != null);

  if (tables.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
        <p className="event-body event-card-muted-text">No seating plan yet</p>
      </div>
    );
  }

  if (hasPositions) {
    return (
      <RoomLayout
        tables={tables}
        attendeesMap={attendeesMap}
        myAttendeeId={attendee?.id ?? null}
        myTableId={attendee?.tableId ?? null}
        mySeatId={attendee?.seatId ?? null}
      />
    );
  }

  // Fallback list view when no positions set
  return (
    <div className="space-y-3">
      {tables.map((table) => {
        const isMyTable = table.id === attendee?.tableId;
        return (
          <div
            key={table.id}
            className="glass-card rounded-2xl p-4"
            style={
              isMyTable
                ? { background: "var(--event-card-chip-bg)", border: "1.5px solid var(--event-primary)" }
                : {}
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="event-heading font-semibold event-card-title">
                {table.name}
                {isMyTable && (
                  <span
                    className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ background: "var(--event-primary)" }}
                  >
                    Your table
                  </span>
                )}
              </h3>
              {table.capacity && (
                <span className="event-body text-xs event-card-muted-text">
                  {table.capacity} seats
                </span>
              )}
            </div>

            {table.seats && table.seats.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {table.seats.map((seat) => {
                  const isMySeat = seat.attendeeId === attendee?.id;
                  const occupantName = seat.attendeeId
                    ? attendeesMap[seat.attendeeId] ?? "Guest"
                    : null;

                  return (
                    <div
                      key={seat.id}
                      className="rounded-xl p-3 text-center"
                      style={
                        isMySeat
                          ? {
                              background: "var(--event-card-chip-bg)",
                              outline: `2px solid var(--event-primary)`,
                              outlineOffset: "-1px",
                            }
                          : seat.attendeeId
                            ? { background: "rgba(0,0,0,0.04)" }
                            : {
                                border: "1px dashed var(--event-card-divider)",
                                background: "transparent",
                              }
                      }
                    >
                      {seat.label && (
                        <div className="event-body mb-0.5 text-xs font-medium event-card-muted-text">
                          {seat.label}
                        </div>
                      )}
                      <div
                        className={`event-heading text-sm font-medium ${isMySeat ? "font-bold" : ""}`}
                        style={{
                          color: isMySeat
                            ? "var(--event-primary)"
                            : seat.attendeeId
                              ? "var(--event-card-text)"
                              : "var(--event-card-muted)",
                        }}
                      >
                        {isMySeat ? "You" : occupantName ?? "Empty"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
