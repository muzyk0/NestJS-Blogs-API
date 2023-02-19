import { IsEmail, IsNotEmpty, Length } from 'class-validator';

import { IsEmailExist } from '../../../../common/decorators/validations/check-is-email-exist.decorator';
import { IsLoginExist } from '../../../../common/decorators/validations/check-is-login-exist.decorator';

export class CreateUserDto {
  @Length(3, 10)
  @IsNotEmpty()
  @IsLoginExist()
  login: string;

  @IsEmail()
  @IsNotEmpty()
  @IsEmailExist()
  email: string;

  @Length(6, 20)
  password: string;
}
