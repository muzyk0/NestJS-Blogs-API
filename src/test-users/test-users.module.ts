import { Module } from '@nestjs/common';
import { TestUsersController } from './test-users.controller';
import { TestUsersService } from './test-users.service';
import { TestUsersRepository } from './test-users.repository';

@Module({
  imports: [],
  controllers: [TestUsersController],
  providers: [TestUsersService, TestUsersRepository],
})
export class TestModule {}
