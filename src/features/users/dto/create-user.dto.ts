import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  @Length(3, 10)
  @IsNotEmpty()
  login: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(6, 20)
  password: string;
}
