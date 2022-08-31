import { IsDate, IsString } from 'class-validator';

export class LimitDto {
  @IsString()
  id: string;

  @IsString()
  ip: string;

  @IsString()
  url: string;

  @IsDate()
  createdAt: Date;
}
