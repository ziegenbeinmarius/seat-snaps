import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { PAYMENT_SERVICE } from "./domain/IPaymentService";
import { CreditsModule } from "../credits/credits.module";

@Module({
  imports: [CreditsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: PAYMENT_SERVICE,
      useClass: PaymentsService,
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
