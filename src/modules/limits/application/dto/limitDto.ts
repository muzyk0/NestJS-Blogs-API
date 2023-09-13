import { IsDate, IsOptional, IsString } from 'class-validator';

export class LimitDto {
  @IsString()
  id: string;

  @IsString()
  deviceName?: string;

  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  ip: string;

  @IsString()
  url: string;

  @IsDate()
  createdAt: Date;
}
