import { Module } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { CreditsController } from "./credits.controller";
import { CREDITS_SERVICE } from "./domain/ICreditsService";

@Module({
  controllers: [CreditsController],
  providers: [
    CreditsService,
    {
      provide: CREDITS_SERVICE,
      useClass: CreditsService,
    },
  ],
  exports: [CreditsService],
})
export class CreditsModule {}
