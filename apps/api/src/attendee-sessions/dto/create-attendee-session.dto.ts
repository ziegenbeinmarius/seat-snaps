import { IsString, IsOptional } from "class-validator";

export class CreateAttendeeSessionDto {
  @IsString()
  qrToken: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
