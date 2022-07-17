import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Length } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Length(6, 20)
  password: string;
}
