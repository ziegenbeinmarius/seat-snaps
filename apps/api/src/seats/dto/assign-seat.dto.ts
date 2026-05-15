import { IsUUID } from "class-validator";

export class AssignSeatDto {
  @IsUUID()
  attendeeId: string;
}
