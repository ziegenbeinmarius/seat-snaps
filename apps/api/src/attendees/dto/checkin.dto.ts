import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class CheckinDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  qrToken: string;
}
