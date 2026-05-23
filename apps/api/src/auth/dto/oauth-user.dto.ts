import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class OAuthUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;

  // @IsUrl() is intentionally avoided — OAuth provider avatar URLs (e.g. Google's
  // lh3.googleusercontent.com URLs with =s96-c suffixes) can fail strict URL
  // validation. A plain string check is sufficient here.
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
