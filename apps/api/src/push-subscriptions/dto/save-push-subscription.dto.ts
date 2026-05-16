import { IsObject, IsString, IsUrl, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class PushSubscriptionKeysDto {
  @IsString()
  p256dh!: string;

  @IsString()
  auth!: string;
}

export class SavePushSubscriptionDto {
  @IsUrl()
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}
