import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from "class-validator";

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

  @IsEnum(["wedding", "birthday", "corporate", "other"])
  type: "wedding" | "birthday" | "corporate" | "other";
}
