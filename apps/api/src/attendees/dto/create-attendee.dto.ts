import { IsString, IsNotEmpty, IsOptional, IsEmail, IsInt, IsPositive, IsArray } from "class-validator";

export class CreateAttendeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  groupLabel?: string;

  @IsString()
  @IsOptional()
  relationInfo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conversationStarters?: string[];

  @IsInt()
  @IsPositive()
  @IsOptional()
  photoLimit?: number;
}
