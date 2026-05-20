import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsBoolean } from "class-validator";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

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
  type: "wedding" | "birthday" | "corporate" | "other";

  @IsBoolean()
  @IsOptional()
  hasSeating?: boolean;

  @IsBoolean()
  @IsOptional()
  rsvpEnabled?: boolean;
}
