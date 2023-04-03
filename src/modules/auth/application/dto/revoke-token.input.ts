import { IsString } from 'class-validator';

export class RevokeTokenInput {
  @IsString()
  userAgent: string;

  @IsString()
  token: string;
}
