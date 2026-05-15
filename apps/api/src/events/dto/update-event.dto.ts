import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from "class-validator";

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

  @IsEnum(["wedding", "birthday", "corporate", "other"])
  @IsOptional()
  type?: "wedding" | "birthday" | "corporate" | "other";
}
