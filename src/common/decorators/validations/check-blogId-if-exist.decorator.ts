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

import { BlogsRepository } from '../../../features/blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ name: 'BlogExists', async: true })
@Injectable()
export class BlogExistsRule implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {
    this.blogsRepository = blogsRepository;

    if (!blogsRepository) {
      throw new Error(
        'If BlogExistsRule is a provider, is it part of the current Module?',
      );
    }
  }

  async validate(id: string, args: ValidationArguments) {
    const user = await this.blogsRepository.findOne(id);

    return Boolean(user);
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog doesn't exist`;
  }
}

export function IsBlogExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'UserExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogExistsRule,
    });
  };
}
