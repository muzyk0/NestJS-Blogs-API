import { Injectable } from '@nestjs/common';
import { TestUsersRepository } from './test-users.repository';

@Injectable()
export class TestUsersService {
  constructor(protected usersRepository: TestUsersRepository) {}
  findUsers(term: string) {
    return this.usersRepository.findUsers(term);
  }
}
