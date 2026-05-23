import {
  Controller,
  Get,
  Post,
  Body,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CheckoutDto } from "./dto/checkout.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Get("tiers")
  listTiers() {
    return this.paymentsService.listTiers();
  }

  @Post("checkout")
  checkout(@Body() dto: CheckoutDto, @CurrentUser() user: SessionUser) {
    return this.paymentsService.checkout(dto.tierId, user.id);
  }

  @Get("history")
  listPayments(@CurrentUser() user: SessionUser) {
    return this.paymentsService.listPayments(user.id);
  }
}
