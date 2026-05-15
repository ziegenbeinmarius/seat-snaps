import { IsString, IsIn, IsInt, Min, Max, IsOptional } from "class-validator";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export class RequestUploadUrlDto {
  @IsString()
  @IsIn(["image/jpeg", "image/png", "image/webp", "image/gif"])
  contentType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_SIZE)
  contentLength?: number;
}

export { MAX_UPLOAD_SIZE };
