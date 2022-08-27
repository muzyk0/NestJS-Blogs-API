import { IsOptional, IsString } from 'class-validator';

export class CreateLimitsDto {
  @IsOptional()
  @IsString()
  ip?: string;

  @IsString()
  @IsOptional()
  login?: string;

  @IsString()
  url: string;
}
