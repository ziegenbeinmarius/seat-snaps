import { IsString, IsNotEmpty, IsOptional, IsInt, IsPositive, IsNumber } from "class-validator";

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
}
