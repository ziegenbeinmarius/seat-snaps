import { Injectable } from "@nestjs/common";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { IS3Service } from "./IS3Service";

@Injectable()
export class S3Service implements IS3Service {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT;
    const region = process.env.STORAGE_REGION ?? "auto";
    const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID ?? "";
    const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY ?? "";
    this.bucket = process.env.STORAGE_BUCKET_NAME ?? "";

    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType }),
    );
  }
}
