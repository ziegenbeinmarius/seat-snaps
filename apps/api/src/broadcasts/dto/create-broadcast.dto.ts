import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import type { BroadcastTargetType } from "@seat-snaps/shared";

export class CreateBroadcastDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;

  @IsEnum(["all", "table", "custom"])
  targetType!: BroadcastTargetType;

  @IsOptional()
  @IsUUID()
  targetId?: string;
}
