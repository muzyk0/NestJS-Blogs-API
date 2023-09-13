import { IsDate, IsString } from 'class-validator';

export class CreateSecurityDto {
  @IsDate()
  issuedAt: Date;

  @IsDate()
  expireAt: Date;

  @IsString()
  ip?: string;

  @IsString()
  deviceName?: string;

  @IsString()
  deviceId: string;

  @IsString()
  userId: string;
}
