import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray } from "class-validator";

export class RsvpRegistrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conversationStarters?: string[];
}
