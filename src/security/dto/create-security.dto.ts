import { IsDate, IsString } from 'class-validator';

import { SecurityDto } from './security.dto';

export class CreateSecurityDto implements Partial<SecurityDto> {
  @IsDate()
  issuedAt: Date;

  @IsDate()
  expireAt: Date;

  @IsString()
  ip: string;

  @IsString()
  deviceName: string;

  @IsString()
  userId: string;
}
