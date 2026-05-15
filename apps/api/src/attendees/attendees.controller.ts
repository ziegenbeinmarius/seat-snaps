import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { AttendeesService } from "./attendees.service";
import { CreateAttendeeDto } from "./dto/create-attendee.dto";
import { UpdateAttendeeDto } from "./dto/update-attendee.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:eventId/attendees")
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Public()
  @Get("public")
  listPublic(@Param("eventId") eventId: string) {
    return this.attendeesService.listPublic(eventId);
  }

  @Get()
  list(@Param("eventId") eventId: string, @CurrentUser() user: SessionUser) {
    return this.attendeesService.listForEvent(eventId, user.id);
  }

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateAttendeeDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.create(eventId, dto, user.id);
  }

  @Post("import")
  async importCsv(
    @Param("eventId") eventId: string,
    @Body() body: { csv: string },
    @CurrentUser() user: SessionUser,
  ) {
    if (!body.csv) throw new BadRequestException("csv field is required");
    return this.attendeesService.bulkImport(eventId, body.csv, user.id);
  }

  @Get(":attendeeId")
  getOne(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.getById(attendeeId, eventId, user.id);
  }

  @Patch(":attendeeId")
  update(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @Body() dto: UpdateAttendeeDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.update(attendeeId, eventId, dto, user.id);
  }

  @Delete(":attendeeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.delete(attendeeId, eventId, user.id);
  }
}
