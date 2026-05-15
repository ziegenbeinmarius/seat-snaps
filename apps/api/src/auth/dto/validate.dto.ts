import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class ValidateDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
