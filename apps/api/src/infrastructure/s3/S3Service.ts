import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>("app.storageEndpoint");
    const region = config.getOrThrow<string>("app.storageRegion");
    const accessKeyId = config.getOrThrow<string>("app.storageAccessKeyId");
    const secretAccessKey = config.getOrThrow<string>("app.storageSecretAccessKey");
    this.bucket = config.getOrThrow<string>("app.storageBucketName");

    this.client = new S3Client({
      region,
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
    contentLength?: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ...(contentLength != null ? { ContentLength: contentLength } : {}),
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
