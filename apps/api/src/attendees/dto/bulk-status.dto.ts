import { IsArray, IsUUID, ArrayNotEmpty, IsIn } from "class-validator";

export class BulkStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("all", { each: true })
  attendeeIds: string[];

  @IsIn(["confirmed", "declined"])
  status: "confirmed" | "declined";
}
