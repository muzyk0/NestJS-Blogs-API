import { IsEmail, IsNotEmpty, Length } from 'class-validator';

import { IsEmailNotExist } from '../../../../common/decorators/validations/check-is-email-exist.decorator';
import { IsLoginNotExist } from '../../../../common/decorators/validations/check-is-login-exist.decorator';

export class CreateUserDto {
  @Length(3, 10)
  @IsNotEmpty()
  @IsLoginNotExist()
  login: string;

  @IsEmail()
  @IsNotEmpty()
  @IsEmailNotExist()
  email: string;

  @Length(6, 20)
  password: string;
}
