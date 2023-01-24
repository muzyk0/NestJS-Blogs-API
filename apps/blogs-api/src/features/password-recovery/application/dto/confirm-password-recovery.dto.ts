import { IsString, Length } from 'class-validator';

export class CreateRecoveryPasswordDto {
  @Length(6, 20)
  newPassword: string;

  @IsString()
  recoveryCode: string;
}
