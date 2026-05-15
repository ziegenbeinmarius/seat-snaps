import { Module } from "@nestjs/common";
import { OrganizerInvitesService } from "./organizer-invites.service";
import { OrganizerInvitesController } from "./organizer-invites.controller";
import { ORGANIZER_INVITE_SERVICE } from "./domain/IOrganizerInviteService";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [OrganizerInvitesController],
  providers: [
    OrganizerInvitesService,
    {
      provide: ORGANIZER_INVITE_SERVICE,
      useClass: OrganizerInvitesService,
    },
  ],
  exports: [OrganizerInvitesService],
})
export class OrganizerInvitesModule {}
