import { IsDate, IsString } from 'class-validator';

export class SecurityDto {
  @IsString()
  id: string;

  @IsDate()
  issuedAt: Date;

  @IsDate()
  expireAt: Date;

  @IsString()
  ip: string;

  @IsString()
  deviceName: string;

  @IsString()
  deviceId: string;

  @IsString()
  userId: string;
}
