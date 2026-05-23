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
import { MAX_UPLOAD_SIZE } from "./dto/request-upload-url.dto";

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
    contentLength?: number,
  ): Promise<UploadUrlResult> {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException("Unsupported content type");
    }

    if (contentLength != null && contentLength > MAX_UPLOAD_SIZE) {
      throw new BadRequestException(`File size exceeds maximum of ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB`);
    }

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) {
      throw new NotFoundException("Attendee not found");
    }

    if (attendee.status !== "confirmed") {
      throw new ForbiddenException(
        "Photo uploads are only available to confirmed attendees",
      );
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

    const uploadUrl = await this.s3.getSignedUploadUrl(key, contentType, undefined, contentLength);
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

    // Keep photo as pending — organizer must manually approve
    const updated = await this.photoRepository.updateStatus(photoId, "pending");
    const withThumb = thumbnailKey
      ? await this.updateThumbnailKey(photoId, thumbnailKey, updated)
      : updated;

    const attendee = await this.attendeeRepository.findById(attendeeId);
    return this.attachUrls(withThumb, attendee?.name ?? "Unknown");
  }

  async listPhotos(
    eventId: string,
    requesterId: string,
    requesterType: "attendee" | "organizer",
  ): Promise<PhotoWithUrl[]> {
    if (requesterType === "organizer") {
      const photos = await this.photoRepository.findByEventId(eventId);
      const attendees = await this.attendeeRepository.findByEventId(eventId);
      const nameMap = new Map(attendees.map((a) => [a.id, a.name]));
      return Promise.all(
        photos.map((p) => this.attachUrls(p, nameMap.get(p.attendeeId) ?? "Unknown")),
      );
    }

    // Attendees only see their own photos (pending + approved, not rejected/deleted)
    const attendee = await this.attendeeRepository.findById(requesterId);
    const allPhotos = await this.photoRepository.findByAttendeeId(requesterId);
    const photos = allPhotos.filter((p) => p.status !== "deleted" && p.status !== "rejected");
    const attendeeName = attendee?.name ?? "Unknown";
    return Promise.all(photos.map((p) => this.attachUrls(p, attendeeName)));
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
    const attendee = await this.attendeeRepository.findById(photo.attendeeId);
    const updated = await this.photoRepository.updateStatus(photoId, status);
    return this.attachUrls(updated, attendee?.name ?? "Unknown");
  }

  async toggleHighlight(
    eventId: string,
    photoId: string,
    isHighlight: boolean,
    userId: string,
  ): Promise<PhotoWithUrl> {
    await this.requireOrganizer(eventId, userId);
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");
    if (photo.status !== "approved") {
      throw new BadRequestException("Only approved photos can be highlighted");
    }

    let highlightOrder: number | null = null;
    if (isHighlight) {
      const existing = await this.photoRepository.findByEventId(eventId, { isHighlight: true });
      highlightOrder = existing.length;
    }

    const updated = await this.photoRepository.updateHighlight(photoId, isHighlight, highlightOrder);
    const attendee = await this.attendeeRepository.findById(photo.attendeeId);
    return this.attachUrls(updated, attendee?.name ?? "Unknown");
  }

  async listHighlights(eventId: string): Promise<PhotoWithUrl[]> {
    const photos = await this.photoRepository.findByEventId(eventId, {
      status: "approved",
      isHighlight: true,
    });

    const attendees = await this.attendeeRepository.findByEventId(eventId);
    const nameMap = new Map(attendees.map((a) => [a.id, a.name]));

    return Promise.all(
      photos.map((p) => this.attachUrls(p, nameMap.get(p.attendeeId) ?? "Unknown")),
    );
  }

  async deletePhoto(eventId: string, photoId: string, userId: string): Promise<void> {
    await this.requireOrganizer(eventId, userId);
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");

    const deletes = [this.s3.deleteObject(photo.s3Key).catch(() => undefined)];
    if (photo.thumbnailKey) {
      deletes.push(this.s3.deleteObject(photo.thumbnailKey).catch(() => undefined));
    }
    await Promise.all(deletes);
    await this.photoRepository.delete(photoId);
  }

  private async requireOrganizer(eventId: string, userId: string): Promise<void> {
    const [event, membership] = await Promise.all([
      this.eventRepository.findById(eventId),
      this.membershipRepository.findByUserAndEvent(userId, eventId),
    ]);
    if (!event) throw new NotFoundException("Event not found");
    if (!membership) throw new ForbiddenException("Access denied");
  }

  private async attachUrls(photo: Photo, attendeeName: string): Promise<PhotoWithUrl> {
    const [url, thumbnailUrl] = await Promise.all([
      this.s3.getSignedDownloadUrl(photo.s3Key),
      photo.thumbnailKey
        ? this.s3.getSignedDownloadUrl(photo.thumbnailKey)
        : Promise.resolve(undefined),
    ]);
    return { ...photo, url, thumbnailUrl, attendeeName };
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
