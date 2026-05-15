"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  useTables,
  useCreateTable,
  useDeleteTable,
  useUpdateTable,
  useBulkUpdatePositions,
  useAssignSeat,
  useUnassignSeat,
} from "@/lib/api/tables";
import { useAttendees } from "@/lib/api/attendees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { TableResponse, SeatResponse, TableShape } from "@seat-snaps/shared";

// Virtual canvas dimensions
const CANVAS_W = 1000;
const CANVAS_H = 680;

// Default table dimensions per shape (in canvas units)
const SHAPE_DEFAULTS: Record<TableShape, { w: number; h: number }> = {
  round: { w: 90, h: 90 },
  rectangular: { w: 120, h: 80 },
  long: { w: 190, h: 65 },
};

interface Props {
  eventId: string;
}

interface DragState {
  tableId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

export function LayoutEditor({ eventId }: Props) {
  const { data: tables = [], isLoading } = useTables(eventId);
  const { data: attendees = [] } = useAttendees(eventId);
  const createTable = useCreateTable(eventId);
  const deleteTable = useDeleteTable(eventId);
  const updateTable = useUpdateTable(eventId);
  const bulkUpdatePositions = useBulkUpdatePositions(eventId);
  const assignSeat = useAssignSeat(eventId);
  const unassignSeat = useUnassignSeat(eventId);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [localPositions, setLocalPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [dragging, setDragging] = useState<DragState | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", capacity: "", shape: "rectangular" as TableShape });
  const [addError, setAddError] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null);
  const [assignDialog, setAssignDialog] = useState<SeatResponse | null>(null);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState("");

  // Compute canvas scale based on container width
  useEffect(() => {
    function updateScale() {
      if (!canvasRef.current) return;
      const w = canvasRef.current.parentElement?.clientWidth ?? CANVAS_W;
      setScale(Math.min(1, w / CANVAS_W));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Sync local positions from server data on first load / after saves
  useEffect(() => {
    if (!dragging) {
      const next: Record<string, { x: number; y: number }> = {};
      for (const t of tables) {
        if (!(t.id in localPositions)) {
          next[t.id] = { x: t.positionX ?? 80, y: t.positionY ?? 80 };
        }
      }
      if (Object.keys(next).length > 0) {
        setLocalPositions((prev) => ({ ...prev, ...next }));
      }
    }
  }, [tables]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPos = (t: TableResponse) =>
    localPositions[t.id] ?? { x: t.positionX ?? 80, y: t.positionY ?? 80 };

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, table: TableResponse) => {
      e.stopPropagation();
      const pos = getPos(table);
      setDragging({
        tableId: table.id,
        startX: e.clientX,
        startY: e.clientY,
        origX: pos.x,
        origY: pos.y,
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setSelectedTable(table);
    },
    [localPositions], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = (e.clientX - dragging.startX) / scale;
      const dy = (e.clientY - dragging.startY) / scale;
      const t = tables.find((t) => t.id === dragging.tableId);
      const tw = t?.width ?? SHAPE_DEFAULTS[t?.shape ?? "rectangular"].w;
      const th = t?.height ?? SHAPE_DEFAULTS[t?.shape ?? "rectangular"].h;
      const newX = Math.max(0, Math.min(CANVAS_W - tw, dragging.origX + dx));
      const newY = Math.max(0, Math.min(CANVAS_H - th, dragging.origY + dy));
      setLocalPositions((prev) => ({ ...prev, [dragging.tableId]: { x: newX, y: newY } }));
    },
    [dragging, scale, tables],
  );

  const handlePointerUp = useCallback(async () => {
    if (!dragging) return;
    const pos = localPositions[dragging.tableId];
    if (pos) {
      await bulkUpdatePositions.mutateAsync([
        { tableId: dragging.tableId, positionX: pos.x, positionY: pos.y },
      ]);
    }
    setDragging(null);
  }, [dragging, localPositions, bulkUpdatePositions]);

  async function handleCreateTable() {
    setAddError(null);
    const defaults = SHAPE_DEFAULTS[addForm.shape];
    try {
      const t = await createTable.mutateAsync({
        name: addForm.name,
        capacity: addForm.capacity ? parseInt(addForm.capacity) : undefined,
        shape: addForm.shape,
        width: defaults.w,
        height: defaults.h,
        positionX: 80,
        positionY: 80,
      });
      setLocalPositions((prev) => ({ ...prev, [t.id]: { x: 80, y: 80 } }));
      setAddForm({ name: "", capacity: "", shape: "rectangular" });
      setShowAddDialog(false);
    } catch (e) {
      setAddError((e as Error).message);
    }
  }

  async function handleDeleteTable(id: string) {
    if (!confirm("Delete this table and all its seats?")) return;
    await deleteTable.mutateAsync(id);
    setLocalPositions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (selectedTable?.id === id) setSelectedTable(null);
  }

  async function handleAssign() {
    if (!assignDialog || !selectedAttendeeId) return;
    await assignSeat.mutateAsync({ seatId: assignDialog.id, attendeeId: selectedAttendeeId });
    setAssignDialog(null);
    setSelectedAttendeeId("");
  }

  async function handleUnassign(seatId: string) {
    await unassignSeat.mutateAsync(seatId);
  }

  const getAttendeeName = (id: string | null) =>
    id ? (attendees.find((a) => a.id === id)?.name ?? id.slice(0, 8)) : "";

  const unassignedAttendees = attendees.filter((a) => !a.seatId);

  const currentSelectedTable = tables.find((t) => t.id === selectedTable?.id) ?? null;

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex gap-4">
      {/* Canvas area */}
      <div className="flex-1 min-w-0">
        <div className="mb-3 flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            Add Table
          </Button>
          <span className="text-xs text-muted-foreground">
            Drag tables to reposition. Click to select and assign seats.
          </span>
        </div>

        <div
          className="relative overflow-hidden rounded-xl border bg-muted/30"
          style={{ width: "100%", paddingBottom: `${(CANVAS_H / CANVAS_W) * 100}%` }}
        >
          <div
            ref={canvasRef}
            className="absolute inset-0"
            style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Grid lines */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={CANVAS_W}
              height={CANVAS_H}
            >
              {Array.from({ length: Math.floor(CANVAS_W / 50) }).map((_, i) => (
                <line
                  key={`v${i}`}
                  x1={(i + 1) * 50}
                  y1={0}
                  x2={(i + 1) * 50}
                  y2={CANVAS_H}
                  stroke="currentColor"
                  strokeOpacity={0.06}
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
                  stroke="currentColor"
                  strokeOpacity={0.06}
                  strokeWidth={1}
                />
              ))}
            </svg>

            {/* Tables */}
            {tables.map((table) => {
              const pos = getPos(table);
              const shape = table.shape ?? "rectangular";
              const w = table.width ?? SHAPE_DEFAULTS[shape].w;
              const h = table.height ?? SHAPE_DEFAULTS[shape].h;
              const isSelected = selectedTable?.id === table.id;
              const isDragging = dragging?.tableId === table.id;

              return (
                <div
                  key={table.id}
                  onPointerDown={(e) => handlePointerDown(e, table)}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: w,
                    height: h,
                    borderRadius: shape === "round" ? "50%" : 8,
                    background: isSelected
                      ? "hsl(var(--primary))"
                      : "hsl(var(--card))",
                    border: `2px solid ${isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}`,
                    color: isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                    cursor: isDragging ? "grabbing" : "grab",
                    userSelect: "none",
                    touchAction: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: "center",
                    padding: 4,
                    boxShadow: isDragging
                      ? "0 8px 24px rgba(0,0,0,0.15)"
                      : "0 2px 6px rgba(0,0,0,0.06)",
                    zIndex: isDragging ? 10 : 1,
                    transition: isDragging ? "none" : "box-shadow 0.15s",
                  }}
                >
                  <span className="truncate w-full text-center px-1">{table.name}</span>
                  {table.capacity && (
                    <span style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>
                      {table.seats?.filter((s) => s.attendeeId).length ?? 0}/{table.capacity}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side panel — table details */}
      <div className="w-64 shrink-0">
        {currentSelectedTable ? (
          <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{currentSelectedTable.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive h-7 px-2 text-xs"
                onClick={() => handleDeleteTable(currentSelectedTable.id)}
              >
                Delete
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Shape: {currentSelectedTable.shape ?? "rectangular"} ·{" "}
              Capacity: {currentSelectedTable.capacity ?? "—"}
            </p>

            <div className="space-y-1.5">
              {(currentSelectedTable.seats ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">No seats</p>
              ) : (
                (currentSelectedTable.seats ?? []).map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-xs"
                  >
                    <span className="truncate max-w-[120px]">
                      {seat.label ?? `Seat ${seat.position}`}
                      {seat.attendeeId && (
                        <span className="ml-1 font-medium">
                          — {getAttendeeName(seat.attendeeId)}
                        </span>
                      )}
                    </span>
                    {seat.attendeeId ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs shrink-0"
                        onClick={() => handleUnassign(seat.id)}
                      >
                        ×
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-xs shrink-0"
                        onClick={() => {
                          setAssignDialog(seat);
                          setSelectedAttendeeId("");
                        }}
                      >
                        +
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
            Click a table to manage seats
          </div>
        )}
      </div>

      {/* Add table dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Table name *"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            />
            <Input
              placeholder="Capacity (seats)"
              type="number"
              min={1}
              value={addForm.capacity}
              onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })}
            />
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={addForm.shape}
              onChange={(e) => setAddForm({ ...addForm, shape: e.target.value as TableShape })}
            >
              <option value="rectangular">Rectangular</option>
              <option value="round">Round</option>
              <option value="long">Long / Banquet</option>
            </select>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTable}
              disabled={!addForm.name || createTable.isPending}
            >
              {createTable.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign seat dialog */}
      <Dialog open={!!assignDialog} onOpenChange={(open) => { if (!open) setAssignDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to {assignDialog?.label}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {unassignedAttendees.length === 0 ? (
              <p className="text-sm text-muted-foreground">All attendees are already seated.</p>
            ) : (
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedAttendeeId}
                onChange={(e) => setSelectedAttendeeId(e.target.value)}
              >
                <option value="">Select an attendee…</option>
                {unassignedAttendees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedAttendeeId || assignSeat.isPending}
            >
              {assignSeat.isPending ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
