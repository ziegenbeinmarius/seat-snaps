"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useAttendees, useCreateAttendee, useUpdateAttendee, useDeleteAttendee, useImportAttendees, useUnassignAttendee } from "@/lib/api/attendees";
import { useTables } from "@/lib/api/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { AttendeeQrDialog } from "./attendee-qr-dialog";

interface Props {
  eventId: string;
  hasSeating?: boolean;
}

export function AttendeesPanel({ eventId, hasSeating = true }: Props) {
    // Helper to build the join URL for an attendee
    const getJoinUrl = (qrToken: string) => {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      return `${base}/join/${qrToken}`;
    };
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
  const [form, setForm] = useState({ name: "", email: "", groupLabel: "", relationInfo: "", conversationStarters: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openAdd() {
    setForm({ name: "", email: "", groupLabel: "", relationInfo: "", conversationStarters: "" });
    setError(null);
    setShowAddDialog(true);
  }

  function openEdit(a: AttendeeResponse) {
    setForm({
      name: a.name,
      email: a.email ?? "",
      groupLabel: a.groupLabel ?? "",
      relationInfo: a.relationInfo ?? "",
      conversationStarters: a.conversationStarters?.join(", ") ?? "",
    });
    setError(null);
    setEditingAttendee(a);
  }

  function buildPayload() {
    const starters = form.conversationStarters
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      name: form.name,
      email: form.email || undefined,
      groupLabel: form.groupLabel || undefined,
      relationInfo: form.relationInfo || undefined,
      conversationStarters: starters.length > 0 ? starters : undefined,
    };
  }

  async function handleSubmit() {
    setError(null);
    try {
      if (editingAttendee) {
        await updateMutation.mutateAsync({ attendeeId: editingAttendee.id, data: buildPayload() });
        setEditingAttendee(null);
      } else {
        await createMutation.mutateAsync(buildPayload());
        setShowAddDialog(false);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
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

  const [qrDialog, setQrDialog] = useState<{ open: boolean; attendee: AttendeeResponse | null }>({ open: false, attendee: null });

  // Helper to get QR code image URL for an attendee
  const getQrUrl = (qrToken: string) => {
    // Use the same join URL as the QR code route
    return `/api/qr/${qrToken}`;
  };

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
                <TableHead>Profile</TableHead>
                {hasSeating && <TableHead>Table</TableHead>}
                <TableHead>QR / Link</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.groupLabel ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-48">
                    {a.relationInfo && (
                      <p className="text-xs truncate" title={a.relationInfo}>{a.relationInfo}</p>
                    )}
                    {a.conversationStarters && a.conversationStarters.length > 0 && (
                      <p className="text-xs text-muted-foreground/70">
                        {a.conversationStarters.length} starter{a.conversationStarters.length !== 1 ? "s" : ""}
                      </p>
                    )}
                    {!a.relationInfo && (!a.conversationStarters || a.conversationStarters.length === 0) && "—"}
                  </TableCell>
                  {hasSeating && (
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
                  )}
                  <TableCell className="text-xs">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQrDialog({ open: true, attendee: a })}
                    >
                      Show QR / Link
                    </Button>
                  </TableCell>
                    {qrDialog.attendee && (
                      <AttendeeQrDialog
                        open={qrDialog.open}
                        onOpenChange={(open: boolean) => setQrDialog({ open, attendee: open ? qrDialog.attendee : null })}
                        name={qrDialog.attendee.name}
                        tableName={qrDialog.attendee.tableId ? tableMap.get(qrDialog.attendee.tableId) ?? null : null}
                        joinUrl={getJoinUrl(qrDialog.attendee.qrToken)}
                        qrUrl={getQrUrl(qrDialog.attendee.qrToken)}
                        eventId={eventId}
                        attendeeId={qrDialog.attendee.id}
                      />
                    )}
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(a)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmDelete(a.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        title="Delete this attendee?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); }}
      />

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
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Group</Label>
              <Input
                placeholder="Group"
                value={form.groupLabel}
                onChange={(e) => setForm({ ...form, groupLabel: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                placeholder="e.g. Easy to talk with, loves hiking…"
                value={form.relationInfo}
                onChange={(e) => setForm({ ...form, relationInfo: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label>Conversation starters (comma-separated)</Label>
              <Input
                placeholder="e.g. Travel, Coffee, Music"
                value={form.conversationStarters}
                onChange={(e) => setForm({ ...form, conversationStarters: e.target.value })}
              />
            </div>
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
      {/* Bulk QR download button at bottom */}
      <div className="flex justify-end pt-6">
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
            window.open(`/api/proxy/events/${eventId}/qr/bulk?appUrl=${encodeURIComponent(appUrl)}`, "_blank");
          }}
        >
          Download All QR Codes (HTML)
        </Button>
      </div>
    </div>
  );
}
