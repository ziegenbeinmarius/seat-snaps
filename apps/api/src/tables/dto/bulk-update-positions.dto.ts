import { IsArray, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class TablePositionItemDto {
  @IsUUID()
  tableId: string;

  @IsNumber()
  positionX: number;

  @IsNumber()
  positionY: number;

  @IsNumber()
  @IsOptional()
  rotation?: number;
}

export class BulkUpdatePositionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TablePositionItemDto)
  positions: TablePositionItemDto[];
}
