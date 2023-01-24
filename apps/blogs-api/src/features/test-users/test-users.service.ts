import { Injectable } from '@nestjs/common';
import { IsEmail, IsInt, IsString, Length, Min } from 'class-validator';

import { validateOrRejectModel } from '../../common/utils/validate-or-reject-model';

import { TestUsersRepository } from './test-users.repository';

export class CreateInputModel {
  @IsEmail()
  email: string;

  @IsString()
  @Length(5, 10)
  name: string;

  @IsInt()
  @Min(0)
  children: number;
}

@Injectable()
export class TestUsersService {
  constructor(protected usersRepository: TestUsersRepository) {}

  findUsers(term?: string) {
    return this.usersRepository.findUsers(term);
  }

  async createUser(inputModel: CreateInputModel) {
    await validateOrRejectModel(inputModel, CreateInputModel);
    return inputModel;
  }
}
