"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { useAttendees, useCreateAttendee, useUpdateAttendee, useDeleteAttendee, useImportAttendees, useUnassignAttendee } from "@/lib/api/attendees";
import { useTables } from "@/lib/api/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AttendeeResponse } from "@seat-snaps/shared";

interface Props {
  eventId: string;
}

export function AttendeesPanel({ eventId }: Props) {
  const { data: attendees = [], isLoading } = useAttendees(eventId);
  const { data: tables = [] } = useTables(eventId);
  const tableMap = new Map(tables.map((t) => [t.id, t.name]));
  const createMutation = useCreateAttendee(eventId);
  const updateMutation = useUpdateAttendee(eventId);
  const deleteMutation = useDeleteAttendee(eventId);
  const importMutation = useImportAttendees(eventId);
  const unassignMutation = useUnassignAttendee(eventId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<AttendeeResponse | null>(null);
  const [form, setForm] = useState({ name: "", email: "", groupLabel: "" });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm({ name: "", email: "", groupLabel: "" });
    setError(null);
    setShowAddDialog(true);
  }

  function openEdit(a: AttendeeResponse) {
    setForm({ name: a.name, email: a.email ?? "", groupLabel: a.groupLabel ?? "" });
    setError(null);
    setEditingAttendee(a);
  }

  async function handleSubmit() {
    setError(null);
    try {
      if (editingAttendee) {
        await updateMutation.mutateAsync({
          attendeeId: editingAttendee.id,
          data: { name: form.name, email: form.email || undefined, groupLabel: form.groupLabel || undefined },
        });
        setEditingAttendee(null);
      } else {
        await createMutation.mutateAsync({ name: form.name, email: form.email || undefined, groupLabel: form.groupLabel || undefined });
        setShowAddDialog(false);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this attendee?")) return;
    await deleteMutation.mutateAsync(id);
  }

  async function handleCsvImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importMutation.mutateAsync(text);
    } catch (err) {
      alert((err as Error).message);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Attendees ({attendees.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvImport}
          />
          <Button size="sm" onClick={openAdd}>
            Add Attendee
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : attendees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No attendees yet. Add one or import from CSV.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Table</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.groupLabel ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.tableId ? (
                      tableMap.has(a.tableId) ? (
                        tableMap.get(a.tableId)
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="text-destructive text-xs">Stale assignment</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => unassignMutation.mutate(a.id)}
                            disabled={unassignMutation.isPending}
                          >
                            Fix
                          </Button>
                        </span>
                      )
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(a.id)}
                      >
                        Del
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog
        open={showAddDialog || !!editingAttendee}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingAttendee(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAttendee ? "Edit Attendee" : "Add Attendee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="Group"
              value={form.groupLabel}
              onChange={(e) => setForm({ ...form, groupLabel: e.target.value })}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingAttendee(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name || isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
