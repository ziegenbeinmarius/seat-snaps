import { IsString, IsNotEmpty, IsOptional, IsInt, IsPositive, IsNumber, IsIn } from "class-validator";

const TABLE_SHAPES = ["round", "rectangular", "long"] as const;

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @IsString()
  @IsIn(TABLE_SHAPES)
  @IsOptional()
  shape?: "round" | "rectangular" | "long";

  @IsNumber()
  @IsOptional()
  rotation?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;
}
