"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminEvents, useForceDeleteEvent } from "@/lib/api/admin";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminEventsPanel() {
  const { data: events, isLoading, error } = useAdminEvents();
  const deleteEvent = useForceDeleteEvent();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-destructive">Failed to load events: {error.message}</p>;
  if (!events) return null;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteEvent.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Attendees</TableHead>
              <TableHead className="text-center">Photos</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{event.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.ownerName ?? "No owner"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">{event.attendeeCount}</TableCell>
                  <TableCell className="text-center">{event.photoCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/events/${event.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDelete({ id: event.id, title: event.title })}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete <strong>{confirmDelete?.title}</strong>? This
            will also remove all attendees, photos, tables, and seating data. This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
