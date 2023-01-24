import { IsEmail, IsNotEmpty } from 'class-validator';

export class Email {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
