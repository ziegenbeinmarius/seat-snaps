import { IsString, IsIn } from "class-validator";

export class UpdatePhotoStatusDto {
  @IsString()
  @IsIn(["approved", "rejected"])
  status!: "approved" | "rejected";
}
