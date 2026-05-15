import { IsString, IsOptional, IsUUID } from "class-validator";

export class CreateAttendeeSessionDto {
  @IsOptional()
  @IsString()
  qrToken?: string;

  @IsOptional()
  @IsUUID()
  attendeeId?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsString()
  deviceFingerprint?: string;
}
