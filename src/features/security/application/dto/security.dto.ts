import { IsDate, IsString } from 'class-validator';

export class SecurityViewModel {
  @IsString()
  ip: string;

  @IsString()
  title: string;

  @IsDate()
  lastActiveDate: string;

  @IsString()
  deviceId: string;
}
