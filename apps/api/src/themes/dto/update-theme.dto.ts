import { IsHexColor, IsIn, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateThemeDto {
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string | null;

  @IsOptional()
  @IsHexColor()
  textColor?: string | null;

  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;

  @IsOptional()
  @IsUrl()
  backgroundUrl?: string | null;

  @IsOptional()
  @IsIn(["Inter", "Lato", "Montserrat", "Merriweather", "Playfair Display", "Roboto", "Open Sans"])
  fontFamily?: string | null;

  @IsOptional()
  @IsIn(["none", "sm", "md", "lg", "full"])
  buttonBorderRadius?: string | null;

  @IsOptional()
  @IsIn(["compact", "spacious"])
  headerStyle?: string | null;

  @IsOptional()
  @IsString()
  customCss?: string | null;

  @IsOptional()
  @IsString()
  preset?: "wedding" | "birthday" | "corporate" | "default";
}
