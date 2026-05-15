import { IsString, IsOptional, IsDateString, IsInt, Min } from "class-validator";

export class CreateScheduleItemDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime!: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
