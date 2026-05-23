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
import { useTranslations, useLocale } from "next-intl";

interface TeamPanelProps {
  eventId: string;
  initialMembers: EventMember[];
}

export function TeamPanel({ eventId, initialMembers }: TeamPanelProps) {
  const t = useTranslations("event.team");
  const tCommon = useTranslations("common");
  const locale = useLocale();

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

  const roleLabel: Record<string, string> = {
    owner: t("roles.owner"),
    organizer: t("roles.organizer"),
  };
  const statusLabel: Record<string, string> = {
    accepted: t("statuses.accepted"),
    active: t("statuses.active"),
    pending: t("statuses.pending"),
    expired: t("statuses.expired"),
  };

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
          <CardTitle className="text-base">{t("members")}</CardTitle>
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            {t("inviteOrganiser")}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.email")}</TableHead>
                <TableHead>{t("columns.role")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.user?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.user?.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === "owner" ? "default" : "secondary"}>
                      {roleLabel[m.role] ?? m.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{statusLabel[m.status] ?? m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {m.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeMember.mutate(m.userId)}
                      >
                        {tCommon("remove")}
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
            <CardTitle className="text-base">{t("pendingInvites")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.email")}</TableHead>
                  <TableHead>{t("columns.role")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.expiresAt")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell>{roleLabel[inv.role] ?? inv.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={inv.status === "accepted" ? "default" : inv.status === "expired" ? "destructive" : "secondary"}
                      >
                        {statusLabel[inv.status] ?? inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inv.expiresAt).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell>
                      {inv.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(inv.token)}
                        >
                          {copiedToken === inv.token ? tCommon("copied") : t("copyLink")}
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
            <DialogTitle>{t("inviteTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onInviteSubmit)} className="space-y-4 pt-2">
            {createInvite.error && (
              <p className="text-sm text-destructive">{createInvite.error.message}</p>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("inviteEmail")}</label>
              <Input {...register("email")} type="email" placeholder="organiser@example.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("inviteExpiry")}</label>
              <Input
                type="number"
                min={1}
                max={30}
                {...register("expiresInDays", { valueAsNumber: true })}
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createInvite.isPending}>
                {createInvite.isPending ? t("sending") : t("sendInvite")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
