import { IsBoolean, IsDate, IsString } from 'class-validator';

export class CreateRecoveryPasswordDto {
  @IsString()
  code: string;

  @IsDate()
  createdAt: Date;

  @IsBoolean()
  isValid: boolean;
}
