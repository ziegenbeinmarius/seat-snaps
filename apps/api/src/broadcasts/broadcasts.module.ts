import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { BroadcastsService } from "./broadcasts.service";
import { BroadcastsController } from "./broadcasts.controller";
import { EventGateway } from "./event.gateway";
import { BROADCAST_SERVICE } from "./domain/IBroadcastService";
import { AttendeeSessionsModule } from "../attendee-sessions/attendee-sessions.module";
import { PushSubscriptionsModule } from "../push-subscriptions/push-subscriptions.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.AUTH_SECRET,
        signOptions: { algorithm: "HS256", expiresIn: "30d" },
        verifyOptions: { algorithms: ["HS256"] },
      }),
    }),
    AttendeeSessionsModule,
    PushSubscriptionsModule,
  ],
  controllers: [BroadcastsController],
  providers: [
    BroadcastsService,
    { provide: BROADCAST_SERVICE, useClass: BroadcastsService },
    EventGateway,
  ],
  exports: [EventGateway],
})
export class BroadcastsModule {}
