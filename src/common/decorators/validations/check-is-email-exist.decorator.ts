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

import { UsersRepository } from '../../../features/users/infrastructure/users.repository.sql';

@ValidatorConstraint({ name: 'EmailExists', async: true })
@Injectable()
export class EmailExistsRule implements ValidatorConstraintInterface {
  constructor(private usersRepository: UsersRepository) {
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

export function IsEmailExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EmailExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailExistsRule,
    });
  };
}
