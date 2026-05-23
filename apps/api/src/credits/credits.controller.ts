import { Controller, Get, Post, ConflictException } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("credits")
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  getBalance(@CurrentUser() user: SessionUser) {
    return this.creditsService.getBalance(user.id);
  }

  @Post("trial")
  async claimTrial(@CurrentUser() user: SessionUser) {
    const granted = await this.creditsService.grantFreeTrialIfEligible(user.id);
    if (!granted) {
      throw new ConflictException("Free trial has already been used");
    }
    return this.creditsService.getBalance(user.id);
  }
}
