import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  // eslint-disable-next-line import/named
  ValidationArguments,
  // eslint-disable-next-line import/named
  ValidationOptions,
  ValidatorConstraint,
  // eslint-disable-next-line import/named
  ValidatorConstraintInterface,
} from 'class-validator';

import { IUsersRepository } from '../../../modules/users/infrastructure/users.repository.sql';

@ValidatorConstraint({ name: 'LoginNotExist', async: true })
@Injectable()
export class LoginNotExistRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: IUsersRepository) {
    this.usersRepository = usersRepository;

    if (!usersRepository) {
      throw new Error(
        'If IsUserExist is a provider, is it part of the current Module?',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(login: string, args: ValidationArguments) {
    const user = await this.usersRepository.findOneByLogin(login);

    return !user;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return `Login already exist`;
  }
}

export function IsLoginNotExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'LoginNotExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: LoginNotExistRule,
    });
  };
}
