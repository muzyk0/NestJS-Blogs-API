import { IsString } from 'class-validator';

export class CreateRecoveryPasswordDto {
  @IsString()
  code: string;
}
