import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { SeatsService } from "./seats.service";
import { AssignSeatDto } from "./dto/assign-seat.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:eventId/seats")
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  list(@Param("eventId") eventId: string, @CurrentUser() user: SessionUser) {
    return this.seatsService.listForEvent(eventId, user.id);
  }

  @Patch(":seatId/assign")
  assign(
    @Param("eventId") eventId: string,
    @Param("seatId") seatId: string,
    @Body() dto: AssignSeatDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.seatsService.assign(seatId, eventId, dto.attendeeId, user.id);
  }

  @Patch(":seatId/unassign")
  @HttpCode(HttpStatus.OK)
  unassign(
    @Param("eventId") eventId: string,
    @Param("seatId") seatId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.seatsService.unassign(seatId, eventId, user.id);
  }
}
