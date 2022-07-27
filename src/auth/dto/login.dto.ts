import { IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @Length(3, 10)
  @IsNotEmpty()
  login: string;

  @Length(6, 20)
  password: string;
}
