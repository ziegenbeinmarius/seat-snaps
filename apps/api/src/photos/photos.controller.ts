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
} from "@nestjs/common";
import { PhotosService } from "./photos.service";
import { RequestUploadUrlDto } from "./dto/request-upload-url.dto";
import { ConfirmUploadDto } from "./dto/confirm-upload.dto";
import { UpdatePhotoStatusDto } from "./dto/update-photo-status.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { AttendeeSessionGuard } from "../attendee-sessions/guards/attendee-session.guard";
import { CurrentAttendee } from "../attendee-sessions/decorators/current-attendee.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { EventMemberGuard } from "../auth/guards/event-member.guard";
import type { Attendee } from "@seat-snaps/db";

@UseGuards(EventMemberGuard)
@Controller("events/:eventId/photos")
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Public()
  @UseGuards(AttendeeSessionGuard)
  @Post("upload-url")
  requestUploadUrl(
    @Param("eventId") eventId: string,
    @Body() dto: RequestUploadUrlDto,
    @CurrentAttendee() attendee: Attendee,
  ) {
    return this.photosService.requestUploadUrl(eventId, dto.contentType, attendee.id);
  }

  @Public()
  @UseGuards(AttendeeSessionGuard)
  @Post("confirm")
  confirmUpload(
    @Param("eventId") eventId: string,
    @Body() dto: ConfirmUploadDto,
    @CurrentAttendee() attendee: Attendee,
  ) {
    return this.photosService.confirmUpload(eventId, dto.photoId, attendee.id);
  }

  @Get()
  listForOrganizer(@Param("eventId") eventId: string, @Query() query: PaginationQueryDto) {
    return this.photosService.listPhotosPaginated(eventId, "organizer", query.page!, query.limit!);
  }

  @Public()
  @UseGuards(AttendeeSessionGuard)
  @Get("gallery")
  listForAttendee(
    @Param("eventId") eventId: string,
    @CurrentAttendee() attendee: Attendee,
    @Query() query: PaginationQueryDto,
  ) {
    return this.photosService.listPhotosPaginated(eventId, "attendee", query.page!, query.limit!);
  }

  @Patch(":photoId")
  updateStatus(
    @Param("eventId") eventId: string,
    @Param("photoId") photoId: string,
    @Body() dto: UpdatePhotoStatusDto,
  ) {
    return this.photosService.updateStatus(eventId, photoId, dto.status);
  }

  @Public()
  @Get("highlights")
  listHighlights(@Param("eventId") eventId: string) {
    return this.photosService.listHighlights(eventId);
  }

  @Patch(":photoId/highlight")
  toggleHighlight(
    @Param("eventId") eventId: string,
    @Param("photoId") photoId: string,
    @Body() body: { isHighlight: boolean },
  ) {
    return this.photosService.toggleHighlight(eventId, photoId, body.isHighlight);
  }

  @Delete(":photoId")
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePhoto(
    @Param("eventId") eventId: string,
    @Param("photoId") photoId: string,
  ) {
    return this.photosService.deletePhoto(eventId, photoId);
  }
}
