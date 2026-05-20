import { IsString, IsOptional, IsArray } from "class-validator";

export class UpdateAttendeeSelfDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conversationStarters?: string[];
}
