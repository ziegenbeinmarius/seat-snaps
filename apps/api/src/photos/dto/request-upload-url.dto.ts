import { IsString, IsIn } from "class-validator";

export class RequestUploadUrlDto {
  @IsString()
  @IsIn(["image/jpeg", "image/png", "image/webp", "image/gif"])
  contentType!: string;
}
