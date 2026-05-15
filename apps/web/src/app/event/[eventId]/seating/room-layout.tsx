"use client";

import { useState } from "react";
import type { TableResponse, TableShape } from "@seat-snaps/shared";

const CANVAS_W = 1000;
const CANVAS_H = 680;

const SHAPE_DEFAULTS: Record<TableShape, { w: number; h: number }> = {
  round: { w: 140, h: 140 },
  rectangular: { w: 180, h: 110 },
  long: { w: 280, h: 90 },
};

interface Props {
  tables: TableResponse[];
  attendeesMap: Record<string, string>;
  myAttendeeId: string | null;
  myTableId: string | null;
  mySeatId: string | null;
}

export function RoomLayout({ tables, attendeesMap, myAttendeeId, myTableId, mySeatId }: Props) {
  const [activeTable, setActiveTable] = useState<TableResponse | null>(null);

  // Auto-zoom: compute bounding box of all tables so content fills the view
  const PADDING = 60;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const t of tables) {
    const tx = t.positionX ?? 80;
    const ty = t.positionY ?? 80;
    const shape = (t.shape ?? "rectangular") as TableShape;
    const tw = t.width ?? SHAPE_DEFAULTS[shape].w;
    const th = t.height ?? SHAPE_DEFAULTS[shape].h;
    minX = Math.min(minX, tx);
    minY = Math.min(minY, ty);
    maxX = Math.max(maxX, tx + tw);
    maxY = Math.max(maxY, ty + th);
  }
  const hasContent = tables.length > 0 && isFinite(minX);
  const vbX = hasContent ? Math.max(0, minX - PADDING) : 0;
  const vbY = hasContent ? Math.max(0, minY - PADDING) : 0;
  const vbW = hasContent ? Math.min(CANVAS_W, maxX + PADDING) - vbX : CANVAS_W;
  const vbH = hasContent ? Math.min(CANVAS_H, maxY + PADDING) - vbY : CANVAS_H;
  // Use the content aspect ratio for the container height
  const aspectRatio = vbH / vbW;

  return (
    <div className="space-y-4">
      {/* Room canvas */}
      <div
        className="relative w-full overflow-hidden rounded-2xl glass-card"
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        <div className="absolute inset-0">
          <svg
            viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
            className="w-full h-full"
            style={{ display: "block" }}
          >
            {/* Room floor */}
            <rect
              x={0}
              y={0}
              width={CANVAS_W}
              height={CANVAS_H}
              fill="rgba(255,255,255,0.06)"
              rx={0}
            />

            {/* Grid */}
            {Array.from({ length: Math.floor(CANVAS_W / 50) }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={(i + 1) * 50}
                y1={0}
                x2={(i + 1) * 50}
                y2={CANVAS_H}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: Math.floor(CANVAS_H / 50) }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={(i + 1) * 50}
                x2={CANVAS_W}
                y2={(i + 1) * 50}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
            ))}

            {/* Tables */}
            {tables.map((table) => {
              const x = table.positionX ?? 80;
              const y = table.positionY ?? 80;
              const shape = (table.shape ?? "rectangular") as TableShape;
              const w = table.width ?? SHAPE_DEFAULTS[shape].w;
              const h = table.height ?? SHAPE_DEFAULTS[shape].h;
              const isMyTable = table.id === myTableId;
              const isActive = activeTable?.id === table.id;
              const cx = x + w / 2;
              const cy = y + h / 2;

              const fill = isMyTable
                ? "var(--event-primary, #a07850)"
                : isActive
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.12)";
              const stroke = isMyTable
                ? "var(--event-primary, #a07850)"
                : "rgba(255,255,255,0.25)";
              const strokeW = isMyTable ? 2.5 : 1.5;
              const textColor = isMyTable ? "white" : "rgba(255,255,255,0.85)";

              return (
                <g key={table.id} onClick={() => setActiveTable(activeTable?.id === table.id ? null : table)} style={{ cursor: "pointer" }}>
                  {shape === "round" ? (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={w / 2}
                      ry={h / 2}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeW}
                    />
                  ) : (
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={shape === "long" ? 6 : 10}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeW}
                    />
                  )}
                  <text
                    x={cx}
                    y={cy - (table.capacity ? 14 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={24}
                    fontWeight={700}
                    fill={textColor}
                    style={{ pointerEvents: "none" }}
                  >
                    {table.name.length > 12 ? table.name.slice(0, 11) + "…" : table.name}
                  </text>
                  {table.capacity && (
                    <text
                      x={cx}
                      y={cy + 18}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={18}
                      fill={textColor}
                      opacity={0.8}
                      style={{ pointerEvents: "none" }}
                    >
                      {table.seats?.filter((s) => s.attendeeId).length ?? 0}/{table.capacity}
                    </text>
                  )}
                  {isMyTable && (
                    <circle
                      cx={x + w - 14}
                      cy={y + 14}
                      r={12}
                      fill="white"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* My table callout */}
      {myTableId && (
        <div
          className="glass-card rounded-2xl p-4"
          style={{ border: "1.5px solid var(--event-primary)" }}
        >
          {(() => {
            const myTable = tables.find((t) => t.id === myTableId);
            if (!myTable) return null;
            const mySeat = myTable.seats?.find((s) => s.id === mySeatId);
            return (
              <>
                <p className="event-heading text-sm font-semibold event-card-title mb-1">
                  You are at{" "}
                  <span style={{ color: "var(--event-primary)" }}>{myTable.name}</span>
                  {mySeat ? ` · ${mySeat.label ?? `Seat ${mySeat.position}`}` : ""}
                </p>
                {myTable.seats && myTable.seats.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 mt-2">
                    {myTable.seats.map((seat) => {
                      const isMySeat = seat.id === mySeatId;
                      const name = seat.attendeeId
                        ? attendeesMap[seat.attendeeId] ?? "Guest"
                        : null;
                      return (
                        <div
                          key={seat.id}
                          className="rounded-xl p-2 text-center text-xs"
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
                            <div className="event-body mb-0.5 font-medium event-card-muted-text" style={{ fontSize: 9 }}>
                              {seat.label}
                            </div>
                          )}
                          <div
                            className={`event-heading font-medium ${isMySeat ? "font-bold" : ""}`}
                            style={{
                              color: isMySeat
                                ? "var(--event-primary)"
                                : seat.attendeeId
                                  ? "var(--event-card-text)"
                                  : "var(--event-card-muted)",
                            }}
                          >
                            {isMySeat ? "You" : name ?? "Empty"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Active table details (when tapped) */}
      {activeTable && activeTable.id !== myTableId && (
        <div className="glass-card rounded-2xl p-4">
          <p className="event-heading text-sm font-semibold event-card-title mb-2">
            {activeTable.name}
          </p>
          {activeTable.seats && activeTable.seats.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {activeTable.seats.map((seat) => {
                const name = seat.attendeeId ? attendeesMap[seat.attendeeId] ?? "Guest" : null;
                return (
                  <div
                    key={seat.id}
                    className="rounded-xl p-2 text-center text-xs"
                    style={
                      seat.attendeeId
                        ? { background: "rgba(0,0,0,0.04)" }
                        : {
                            border: "1px dashed var(--event-card-divider)",
                            background: "transparent",
                          }
                    }
                  >
                    {seat.label && (
                      <div className="event-body mb-0.5 font-medium event-card-muted-text" style={{ fontSize: 9 }}>
                        {seat.label}
                      </div>
                    )}
                    <div
                      className="event-heading font-medium"
                      style={{ color: seat.attendeeId ? "var(--event-card-text)" : "var(--event-card-muted)" }}
                    >
                      {name ?? "Empty"}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs event-card-muted-text">No seats assigned</p>
          )}
        </div>
      )}
    </div>
  );
}
