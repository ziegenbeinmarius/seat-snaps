export interface IS3Service {
  getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn?: number,
    contentLength?: number,
  ): Promise<string>;
  getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
  deleteObject(key: string): Promise<void>;
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
}

export const S3_SERVICE = Symbol("IS3Service");
