import { IsEmail, IsString, MinLength, IsOptional, IsUrl } from "class-validator";

export class OAuthUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
