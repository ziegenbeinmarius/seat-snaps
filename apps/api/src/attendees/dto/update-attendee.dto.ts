import { IsString, IsOptional, IsEmail, IsInt, IsPositive, IsArray } from "class-validator";

export class UpdateAttendeeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  groupLabel?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conversationStarters?: string[];

  @IsInt()
  @IsPositive()
  @IsOptional()
  photoLimit?: number;
}
