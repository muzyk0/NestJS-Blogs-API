import { Module } from '@nestjs/common';

import { TestUsersController } from './test-users.controller';
import { TestUsersRepository } from './test-users.repository';
import { TestUsersService } from './test-users.service';

@Module({
  imports: [],
  controllers: [TestUsersController],
  providers: [TestUsersService, TestUsersRepository],
})
export class TestModule {}
