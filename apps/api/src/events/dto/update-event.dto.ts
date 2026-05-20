import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsBoolean } from "class-validator";

export class UpdateEventDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(["wedding", "birthday", "corporate", "other"])
  @IsOptional()
  type?: "wedding" | "birthday" | "corporate" | "other";

  @IsBoolean()
  @IsOptional()
  hasSeating?: boolean;

  @IsBoolean()
  @IsOptional()
  isFinished?: boolean;

  @IsBoolean()
  @IsOptional()
  rsvpEnabled?: boolean;
}
