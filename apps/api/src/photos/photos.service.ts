import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import sharp from "sharp";
import type { Photo } from "@seat-snaps/db";
import type { IPhotoRepository, PhotoStatus } from "../domain/repositories/IPhotoRepository";
import { PHOTO_REPOSITORY } from "../domain/repositories/IPhotoRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IS3Service } from "../infrastructure/s3/IS3Service";
import { S3_SERVICE } from "../infrastructure/s3/IS3Service";
import type { IPhotoService, UploadUrlResult, PhotoWithUrl } from "./domain/IPhotoService";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

@Injectable()
export class PhotosService implements IPhotoService {
  constructor(
    @Inject(PHOTO_REPOSITORY) private readonly photoRepository: IPhotoRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    @Inject(S3_SERVICE) private readonly s3: IS3Service,
  ) {}

  async requestUploadUrl(
    eventId: string,
    contentType: string,
    attendeeId: string,
  ): Promise<UploadUrlResult> {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException("Unsupported content type");
    }

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) {
      throw new NotFoundException("Attendee not found");
    }

    const existing = await this.photoRepository.findByAttendeeId(attendeeId);
    const activePhotos = existing.filter((p) => p.status !== "deleted" && p.status !== "rejected");
    if (activePhotos.length >= attendee.photoLimit) {
      throw new BadRequestException(
        `Photo limit reached (${attendee.photoLimit} photos per attendee)`,
      );
    }

    const ext = contentType.split("/")[1] ?? "jpg";
    const key = `events/${eventId}/photos/${randomUUID()}.${ext}`;

    const photo = await this.photoRepository.create({
      eventId,
      attendeeId,
      s3Key: key,
      status: "pending",
    });

    const uploadUrl = await this.s3.getSignedUploadUrl(key, contentType);
    return { uploadUrl, key, photoId: photo.id };
  }

  async confirmUpload(
    eventId: string,
    photoId: string,
    attendeeId: string,
  ): Promise<PhotoWithUrl> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId || photo.attendeeId !== attendeeId) {
      throw new NotFoundException("Photo not found");
    }
    if (photo.status !== "pending") {
      throw new BadRequestException("Photo already confirmed");
    }

    // Generate thumbnail
    let thumbnailKey: string | undefined;
    try {
      const ext = photo.s3Key.split(".").pop() ?? "jpg";
      thumbnailKey = photo.s3Key.replace(`.${ext}`, `_thumb.${ext}`);

      // Download original from S3
      const downloadUrl = await this.s3.getSignedDownloadUrl(photo.s3Key, 60);
      const response = await fetch(downloadUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const thumbBuffer = await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        await this.s3.putObject(thumbnailKey, thumbBuffer, "image/jpeg");
      } else {
        thumbnailKey = undefined;
      }
    } catch {
      thumbnailKey = undefined;
    }

    // Update photo to approved (auto-approve on confirm)
    const updated = await this.photoRepository.updateStatus(photoId, "approved");
    const withThumb = thumbnailKey
      ? await this.updateThumbnailKey(photoId, thumbnailKey, updated)
      : updated;

    return this.attachUrls(withThumb);
  }

  async listPhotos(
    eventId: string,
    requesterId: string,
    requesterType: "attendee" | "organizer",
  ): Promise<PhotoWithUrl[]> {
    let photos: Photo[];
    if (requesterType === "organizer") {
      photos = await this.photoRepository.findByEventId(eventId);
    } else {
      photos = await this.photoRepository.findByEventId(eventId, { status: "approved" });
    }
    return Promise.all(photos.map((p) => this.attachUrls(p)));
  }

  async updateStatus(
    eventId: string,
    photoId: string,
    status: PhotoStatus,
    userId: string,
  ): Promise<PhotoWithUrl> {
    await this.requireOrganizer(eventId, userId);
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");
    const updated = await this.photoRepository.updateStatus(photoId, status);
    return this.attachUrls(updated);
  }

  async deletePhoto(eventId: string, photoId: string, userId: string): Promise<void> {
    await this.requireOrganizer(eventId, userId);
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");

    await this.s3.deleteObject(photo.s3Key).catch(() => undefined);
    if (photo.thumbnailKey) {
      await this.s3.deleteObject(photo.thumbnailKey).catch(() => undefined);
    }
    await this.photoRepository.delete(photoId);
  }

  private async requireOrganizer(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");
  }

  private async attachUrls(photo: Photo): Promise<PhotoWithUrl> {
    const url = await this.s3.getSignedDownloadUrl(photo.s3Key);
    const thumbnailUrl = photo.thumbnailKey
      ? await this.s3.getSignedDownloadUrl(photo.thumbnailKey)
      : undefined;
    return { ...photo, url, thumbnailUrl };
  }

  private async updateThumbnailKey(
    photoId: string,
    thumbnailKey: string,
    photo: Photo,
  ): Promise<Photo> {
    // Direct DB update for thumbnail key — use repository
    const updated = await this.photoRepository.updateThumbnailKey(photoId, thumbnailKey);
    return updated ?? photo;
  }
}
