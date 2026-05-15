"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateInviteSchema, type EventMember } from "@seat-snaps/shared";

type InviteFormValues = { email: string; role: "organizer"; expiresInDays?: number };
import { useEventMembers, useRemoveMember } from "@/lib/api/events";
import { useCreateInvite, useEventInvites } from "@/lib/api/invites";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeamPanelProps {
  eventId: string;
  initialMembers: EventMember[];
}

export function TeamPanel({ eventId, initialMembers }: TeamPanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: members = initialMembers } = useEventMembers(eventId);
  const { data: invites = [] } = useEventInvites(eventId);
  const removeMember = useRemoveMember(eventId);
  const createInvite = useCreateInvite(eventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(CreateInviteSchema),
    defaultValues: { role: "organizer", expiresInDays: 7 },
  });

  async function onInviteSubmit(data: InviteFormValues) {
    await createInvite.mutateAsync({ ...data, expiresInDays: data.expiresInDays ?? 7 });
    reset();
    setInviteOpen(false);
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Members</CardTitle>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            Invite Organiser
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.user?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.user?.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "owner" ? "default" : "secondary"} className="capitalize">
                      {m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {m.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMember.mutate(m.userId)}
                      >
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell className="capitalize">{inv.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === "accepted" ? "default" : inv.status === "expired" ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {inv.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(inv.token)}
                        >
                          {copiedToken === inv.token ? "Copied!" : "Copy Link"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Organiser</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4 pt-2">
            {createInvite.error && (
              <p className="text-sm text-destructive">{createInvite.error.message}</p>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email *</label>
              <Input {...register("email")} type="email" placeholder="organiser@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Expires in (days)</label>
              <Input
                type="number"
                min={1}
                max={30}
                {...register("expiresInDays", { valueAsNumber: true })}
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInvite.isPending}>
                {createInvite.isPending ? "Sending…" : "Create Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
