"use client";

import { useState } from "react";
import { LayoutEditor } from "./layout-editor";
import { useTables, useCreateTable, useDeleteTable, useAssignSeat, useUnassignSeat } from "@/lib/api/tables";
import { useAttendees } from "@/lib/api/attendees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { SeatResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

type ViewMode = "layout" | "list";

export function SeatingPanel({ eventId }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("layout");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">View:</span>
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "layout"
                ? "bg-accent text-accent-foreground"
                : "bg-background text-muted-foreground hover:bg-accent/50"
            }`}
            onClick={() => setViewMode("layout")}
          >
            Layout
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-border ${
              viewMode === "list"
                ? "bg-accent text-accent-foreground"
                : "bg-background text-muted-foreground hover:bg-accent/50"
            }`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
        </div>
      </div>

      {viewMode === "layout" ? (
        <LayoutEditor eventId={eventId} />
      ) : (
        <ListSeatingPanel eventId={eventId} />
      )}
    </div>
  );
}

function ListSeatingPanel({ eventId }: Props) {
  const { data: tables = [], isLoading: tablesLoading } = useTables(eventId);
  const { data: attendees = [] } = useAttendees(eventId);
  const createTable = useCreateTable(eventId);
  const deleteTable = useDeleteTable(eventId);
  const assignSeat = useAssignSeat(eventId);
  const unassignSeat = useUnassignSeat(eventId);

  const [showAddTable, setShowAddTable] = useState(false);
  const [tableForm, setTableForm] = useState({ name: "", capacity: "" });
  const [error, setError] = useState<string | null>(null);
  const [assignDialog, setAssignDialog] = useState<{ seat: SeatResponse } | null>(null);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState("");

  const unassignedAttendees = attendees.filter((a) => !a.seatId);

  async function handleCreateTable() {
    setError(null);
    try {
      await createTable.mutateAsync({
        name: tableForm.name,
        capacity: tableForm.capacity ? parseInt(tableForm.capacity) : undefined,
      });
      setTableForm({ name: "", capacity: "" });
      setShowAddTable(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDeleteTable(tableId: string) {
    if (!confirm("Delete this table and all its seats?")) return;
    await deleteTable.mutateAsync(tableId);
  }

  async function handleAssign() {
    if (!assignDialog || !selectedAttendeeId) return;
    try {
      await assignSeat.mutateAsync({ seatId: assignDialog.seat.id, attendeeId: selectedAttendeeId });
      setAssignDialog(null);
      setSelectedAttendeeId("");
    } catch (e) {
      alert((e as Error).message);
    }
  }

  async function handleUnassign(seatId: string) {
    await unassignSeat.mutateAsync(seatId);
  }

  function getAttendeeName(attendeeId: string | null): string {
    if (!attendeeId) return "";
    return attendees.find((a) => a.id === attendeeId)?.name ?? attendeeId.slice(0, 8);
  }

  if (tablesLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAddTable(true)}>
          Add Table
        </Button>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No tables yet. Switch to Layout view to start planning.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{table.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-7 px-2"
                    onClick={() => handleDeleteTable(table.id)}
                  >
                    Delete
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Capacity: {table.capacity ?? "—"}
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                {(table.seats ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No seats</p>
                ) : (
                  (table.seats ?? []).map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between rounded-md border border-border px-2 py-1 text-xs"
                    >
                      <span>
                        {seat.label ?? `Seat ${seat.position}`}
                        {seat.attendeeId && (
                          <span className="ml-2 font-medium text-foreground">
                            — {getAttendeeName(seat.attendeeId)}
                          </span>
                        )}
                      </span>
                      {seat.attendeeId ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleUnassign(seat.id)}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setAssignDialog({ seat });
                            setSelectedAttendeeId("");
                          }}
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Table name *"
              value={tableForm.name}
              onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
            />
            <Input
              placeholder="Capacity (number of seats)"
              type="number"
              min={1}
              value={tableForm.capacity}
              onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTable(false)}>Cancel</Button>
            <Button
              onClick={handleCreateTable}
              disabled={!tableForm.name || createTable.isPending}
            >
              {createTable.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignDialog}
        onOpenChange={(open) => { if (!open) setAssignDialog(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Attendee to {assignDialog?.seat.label}</DialogTitle>
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
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
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
