import { PartialType } from '@nestjs/mapped-types';
import { Length } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Length(6, 20)
  password: string;
}
