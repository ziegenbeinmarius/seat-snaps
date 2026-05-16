import { IsEmail, IsString, IsNotEmpty, MaxLength } from "class-validator";

export class ValidateDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
