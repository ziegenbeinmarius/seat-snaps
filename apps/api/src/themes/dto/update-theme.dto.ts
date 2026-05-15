import { IsHexColor, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateThemeDto {
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;

  @IsOptional()
  @IsUrl()
  backgroundUrl?: string | null;

  @IsOptional()
  @IsString()
  preset?: "wedding" | "birthday" | "corporate" | "default";
}
