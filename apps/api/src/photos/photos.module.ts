import { Module } from "@nestjs/common";
import { PhotosService } from "./photos.service";
import { PhotosController } from "./photos.controller";
import { PHOTO_SERVICE } from "./domain/IPhotoService";
import { S3Service } from "../infrastructure/s3/S3Service";
import { S3_SERVICE } from "../infrastructure/s3/IS3Service";
import { AttendeeSessionsModule } from "../attendee-sessions/attendee-sessions.module";

@Module({
  imports: [AttendeeSessionsModule],
  controllers: [PhotosController],
  providers: [
    PhotosService,
    { provide: PHOTO_SERVICE, useClass: PhotosService },
    { provide: S3_SERVICE, useClass: S3Service },
  ],
})
export class PhotosModule {}
