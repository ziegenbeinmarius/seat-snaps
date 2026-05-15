import { IsUUID } from "class-validator";

export class ConfirmUploadDto {
  @IsUUID()
  photoId!: string;
}
