import { IsString } from 'class-validator';

export class CreateLimitsDto {
  @IsString()
  ip: string;

  @IsString()
  url: string;
}
