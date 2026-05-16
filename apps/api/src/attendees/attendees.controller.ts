import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AttendeesService } from "./attendees.service";
import { CreateAttendeeDto } from "./dto/create-attendee.dto";
import { UpdateAttendeeDto } from "./dto/update-attendee.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { Public } from "../auth/decorators/public.decorator";
import { EventMemberGuard } from "../auth/guards/event-member.guard";

@UseGuards(EventMemberGuard)
@Controller("events/:eventId/attendees")
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Public()
  @Get("public")
  listPublic(@Param("eventId") eventId: string) {
    return this.attendeesService.listPublic(eventId);
  }

  @Get()
  list(@Param("eventId") eventId: string, @Query() query: PaginationQueryDto) {
    return this.attendeesService.listForEventPaginated(eventId, query.page!, query.limit!);
  }

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateAttendeeDto,
  ) {
    return this.attendeesService.create(eventId, dto);
  }

  @Post("checkin")
  checkIn(
    @Param("eventId") eventId: string,
    @Body() body: { qrToken: string },
  ) {
    return this.attendeesService.checkIn(eventId, body.qrToken);
  }

  @Post("import")
  async importCsv(
    @Param("eventId") eventId: string,
    @Body() body: { csv: string },
  ) {
    if (!body.csv) throw new BadRequestException("csv field is required");
    return this.attendeesService.bulkImport(eventId, body.csv);
  }

  @Get(":attendeeId")
  getOne(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
  ) {
    return this.attendeesService.getById(attendeeId, eventId);
  }

  @Patch(":attendeeId/unassign")
  @HttpCode(HttpStatus.OK)
  unassign(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
  ) {
    return this.attendeesService.clearSeatAssignment(attendeeId, eventId);
  }

  @Patch(":attendeeId")
  update(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @Body() dto: UpdateAttendeeDto,
  ) {
    return this.attendeesService.update(attendeeId, eventId, dto);
  }

  @Delete(":attendeeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
  ) {
    return this.attendeesService.delete(attendeeId, eventId);
  }
}
