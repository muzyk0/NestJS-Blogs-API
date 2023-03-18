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

@ValidatorConstraint({ name: 'EmailNotExist', async: true })
@Injectable()
export class EmailNotExistRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: IUsersRepository) {
    this.usersRepository = usersRepository;

    if (!usersRepository) {
      throw new Error(
        'If IsUserExist is a provider, is it part of the current Module?',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(email: string, args: ValidationArguments) {
    const user = await this.usersRepository.findOneByEmail(email);

    return !user;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return `Email already exist`;
  }
}

export function IsEmailNotExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EmailNotExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailNotExistRule,
    });
  };
}
