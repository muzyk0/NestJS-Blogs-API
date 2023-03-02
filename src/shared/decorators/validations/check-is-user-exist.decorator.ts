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

import {
  IUsersRepository,
  UsersRepository,
} from '../../../modules/users/infrastructure/users.repository.sql';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class IsUserAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private usersRepository: IUsersRepository) {
    this.usersRepository = usersRepository;

    if (!usersRepository) {
      throw new Error(
        'If IsUserAlreadyExistConstraint is a provider, is it part of the current Module?',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(id: string, args: ValidationArguments) {
    const user = await this.usersRepository.findOneById(id);

    return Boolean(user);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return `User doesn't exist`;
  }
}

export function IsUserAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUserAlreadyExistConstraint,
    });
  };
}
