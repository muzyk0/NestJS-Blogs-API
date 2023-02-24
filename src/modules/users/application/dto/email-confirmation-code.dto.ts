import { IsString } from 'class-validator';

export class EmailConfirmationCodeDto {
  @IsString()
  code: string;
}
