import { IsString, IsOptional, IsInt, IsPositive, IsNumber } from "class-validator";

export class UpdateTableDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  capacity?: number;

  @IsNumber()
  @IsOptional()
  positionX?: number;

  @IsNumber()
  @IsOptional()
  positionY?: number;
}
