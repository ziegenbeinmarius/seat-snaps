"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import {
  useAttendees,
  useCreateAttendee,
  useUpdateAttendee,
  useDeleteAttendee,
  useImportAttendees,
  useUnassignAttendee,
  useUpdateAttendeeStatus,
  useBulkUpdateAttendeeStatus,
} from "@/lib/api/attendees";
import { useTables } from "@/lib/api/tables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AttendeeResponse } from "@seat-snaps/shared";
import { AttendeeQrDialog } from "./attendee-qr-dialog";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | "pending" | "confirmed" | "declined";

interface Props {
  eventId: string;
  hasSeating?: boolean;
  defaultStatus?: StatusFilter;
}

export function AttendeesPanel({ eventId, hasSeating = true, defaultStatus }: Props) {
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
  const updateStatusMutation = useUpdateAttendeeStatus(eventId);
  const bulkStatusMutation = useBulkUpdateAttendeeStatus(eventId);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(defaultStatus ?? "all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAttendee, setEditingAttendee] = useState<AttendeeResponse | null>(null);
  const [form, setForm] = useState({ name: "", email: "", groupLabel: "", description: "", conversationStarters: "" });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrDialog, setQrDialog] = useState<{ open: boolean; attendee: AttendeeResponse | null }>({ open: false, attendee: null });

  const pendingCount = attendees.filter((a) => a.status === "pending").length;
  const confirmedCount = attendees.filter((a) => a.status === "confirmed").length;
  const declinedCount = attendees.filter((a) => a.status === "declined").length;

  const filteredAttendees =
    statusFilter === "all" ? attendees : attendees.filter((a) => a.status === statusFilter);

  const pendingAttendees = attendees.filter((a) => a.status === "pending");

  function handleFilterChange(f: StatusFilter) {
    setStatusFilter(f);
    setSelectedIds(new Set());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pendingOnScreen = filteredAttendees.filter((a) => a.status === "pending");
    if (pendingOnScreen.every((a) => selectedIds.has(a.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingOnScreen.map((a) => a.id)));
    }
  }

  function openAdd() {
    setForm({ name: "", email: "", groupLabel: "", description: "", conversationStarters: "" });
    setError(null);
    setShowAddDialog(true);
  }

  function openEdit(a: AttendeeResponse) {
    setForm({
      name: a.name,
      email: a.email ?? "",
      groupLabel: a.groupLabel ?? "",
      description: a.description ?? "",
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
      description: form.description || undefined,
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

  async function handleApprove(attendeeId: string) {
    await updateStatusMutation.mutateAsync({ attendeeId, status: "confirmed" });
  }

  async function handleDecline(attendeeId: string) {
    await updateStatusMutation.mutateAsync({ attendeeId, status: "declined" });
  }

  async function handleApproveAllPending() {
    const ids = pendingAttendees.map((a) => a.id);
    if (ids.length === 0) return;
    await bulkStatusMutation.mutateAsync({ attendeeIds: ids, status: "confirmed" });
  }

  async function handleDeclineSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await bulkStatusMutation.mutateAsync({ attendeeIds: ids, status: "declined" });
    setSelectedIds(new Set());
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  const getQrUrl = (qrToken: string) => `/api/qr/${qrToken}`;

  const pendingOnScreen = filteredAttendees.filter((a) => a.status === "pending");
  const allPendingSelected =
    pendingOnScreen.length > 0 && pendingOnScreen.every((a) => selectedIds.has(a.id));

  const tabs: { label: string; value: StatusFilter; count: number }[] = [
    { label: "All", value: "all", count: attendees.length },
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "Confirmed", value: "confirmed", count: confirmedCount },
    { label: "Declined", value: "declined", count: declinedCount },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Attendees ({attendees.length})
          {pendingCount > 0 && (
            <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
              {pendingCount} pending
            </Badge>
          )}
        </h2>
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

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                statusFilter === tab.value
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                tab.value === "pending" && tab.count > 0 && statusFilter !== "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bulk actions for pending */}
      {(statusFilter === "pending" || statusFilter === "all") && pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
          <span className="text-sm text-amber-800 font-medium">
            {pendingCount} pending RSVP{pendingCount !== 1 ? "s" : ""}
          </span>
          <div className="ml-auto flex gap-2">
            {selectedIds.size > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
                onClick={handleDeclineSelected}
                disabled={bulkStatusMutation.isPending}
              >
                Decline Selected ({selectedIds.size})
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={handleApproveAllPending}
              disabled={bulkStatusMutation.isPending}
            >
              Approve All Pending
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filteredAttendees.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {statusFilter === "all"
              ? "No attendees yet. Add one or import from CSV."
              : `No ${statusFilter} attendees.`}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {statusFilter === "pending" && (
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allPendingSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all pending"
                    />
                  </TableHead>
                )}
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Status</TableHead>
                {hasSeating && statusFilter !== "pending" && <TableHead>Table</TableHead>}
                {statusFilter !== "pending" && <TableHead>QR / Link</TableHead>}
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendees.map((a) => (
                <TableRow key={a.id} className={a.status === "pending" ? "bg-amber-50/50" : ""}>
                  {statusFilter === "pending" && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(a.id)}
                        onCheckedChange={() => toggleSelect(a.id)}
                        aria-label={`Select ${a.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.groupLabel ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground max-w-48">
                    {a.description && (
                      <p className="text-xs truncate" title={a.description}>{a.description}</p>
                    )}
                    {a.conversationStarters && a.conversationStarters.length > 0 && (
                      <p className="text-xs text-muted-foreground/70">
                        {a.conversationStarters.length} starter{a.conversationStarters.length !== 1 ? "s" : ""}
                      </p>
                    )}
                    {!a.description && (!a.conversationStarters || a.conversationStarters.length === 0) && "—"}
                  </TableCell>
                  <TableCell>
                    {a.status === "pending" && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
                    )}
                    {a.status === "confirmed" && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
                    )}
                    {a.status === "declined" && (
                      <Badge variant="outline" className="text-muted-foreground">Declined</Badge>
                    )}
                  </TableCell>
                  {hasSeating && statusFilter !== "pending" && (
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
                  {statusFilter !== "pending" && (
                    <TableCell className="text-xs">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setQrDialog({ open: true, attendee: a })}
                      >
                        Show QR / Link
                      </Button>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      {a.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(a.id)}
                            disabled={updateStatusMutation.isPending}
                            aria-label="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDecline(a.id)}
                            disabled={updateStatusMutation.isPending}
                            aria-label="Decline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
