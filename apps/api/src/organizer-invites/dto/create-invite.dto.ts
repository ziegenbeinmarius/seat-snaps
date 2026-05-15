import { IsEmail, IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export class CreateInviteDto {
  @IsEmail()
  email: string;

  @IsIn(["organizer"])
  role: string;

  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  expiresInDays?: number;
}
