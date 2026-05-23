import { Controller, Get } from "@nestjs/common";
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
}
