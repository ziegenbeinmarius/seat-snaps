import { IsString, IsOptional, IsArray } from "class-validator";

export class UpdateAttendeeSelfDto {
  @IsOptional()
  @IsString()
  relationInfo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conversationStarters?: string[];
}
