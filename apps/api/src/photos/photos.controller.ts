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
  UseGuards,
  Inject,
} from "@nestjs/common";
import { PhotosService } from "./photos.service";
import { RequestUploadUrlDto } from "./dto/request-upload-url.dto";
import { ConfirmUploadDto } from "./dto/confirm-upload.dto";
import { UpdatePhotoStatusDto } from "./dto/update-photo-status.dto";
import { AttendeeSessionGuard } from "../attendee-sessions/guards/attendee-session.guard";
import { CurrentAttendee } from "../attendee-sessions/decorators/current-attendee.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { Attendee } from "@seat-snaps/db";
import type { SessionUser } from "@seat-snaps/shared";

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
  listForOrganizer(@Param("eventId") eventId: string, @CurrentUser() user: SessionUser) {
    return this.photosService.listPhotos(eventId, user.id, "organizer");
  }

  @Public()
  @UseGuards(AttendeeSessionGuard)
  @Get("gallery")
  listForAttendee(
    @Param("eventId") eventId: string,
    @CurrentAttendee() attendee: Attendee,
  ) {
    return this.photosService.listPhotos(eventId, attendee.id, "attendee");
  }

  @Patch(":photoId")
  updateStatus(
    @Param("eventId") eventId: string,
    @Param("photoId") photoId: string,
    @Body() dto: UpdatePhotoStatusDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.photosService.updateStatus(eventId, photoId, dto.status, user.id);
  }

  @Delete(":photoId")
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePhoto(
    @Param("eventId") eventId: string,
    @Param("photoId") photoId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.photosService.deletePhoto(eventId, photoId, user.id);
  }
}
