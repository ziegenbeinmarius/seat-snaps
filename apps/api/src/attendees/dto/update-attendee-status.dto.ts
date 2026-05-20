import { IsIn } from "class-validator";

export class UpdateAttendeeStatusDto {
  @IsIn(["confirmed", "declined"])
  status: "confirmed" | "declined";
}
