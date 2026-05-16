import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { SeatsService } from "./seats.service";
import { AssignSeatDto } from "./dto/assign-seat.dto";
import { EventMemberGuard } from "../auth/guards/event-member.guard";

@UseGuards(EventMemberGuard)
@Controller("events/:eventId/seats")
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get()
  list(@Param("eventId") eventId: string) {
    return this.seatsService.listForEvent(eventId);
  }

  @Patch(":seatId/assign")
  assign(
    @Param("eventId") eventId: string,
    @Param("seatId") seatId: string,
    @Body() dto: AssignSeatDto,
  ) {
    return this.seatsService.assign(seatId, eventId, dto.attendeeId);
  }

  @Patch(":seatId/unassign")
  @HttpCode(HttpStatus.OK)
  unassign(
    @Param("eventId") eventId: string,
    @Param("seatId") seatId: string,
  ) {
    return this.seatsService.unassign(seatId, eventId);
  }
}
