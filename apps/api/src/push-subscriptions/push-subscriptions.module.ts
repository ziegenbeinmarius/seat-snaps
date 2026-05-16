import { Module } from "@nestjs/common";
import { PushSubscriptionsService } from "./push-subscriptions.service";
import { PushSubscriptionsController } from "./push-subscriptions.controller";
import { PUSH_SUBSCRIPTION_SERVICE } from "./domain/IPushSubscriptionService";
import { AttendeeSessionsModule } from "../attendee-sessions/attendee-sessions.module";

@Module({
  imports: [AttendeeSessionsModule],
  controllers: [PushSubscriptionsController],
  providers: [
    PushSubscriptionsService,
    { provide: PUSH_SUBSCRIPTION_SERVICE, useClass: PushSubscriptionsService },
  ],
  exports: [PUSH_SUBSCRIPTION_SERVICE, PushSubscriptionsService],
})
export class PushSubscriptionsModule {}
