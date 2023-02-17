import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserInput {
  @Length(3, 10)
  @IsNotEmpty()
  login: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(6, 20)
  password: string;

  @IsString()
  confirmationCode: string;

  @IsDate()
  expirationDate: Date;

  @IsBoolean()
  isConfirmed: boolean;
}
