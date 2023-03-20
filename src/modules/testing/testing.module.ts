import { Module } from '@nestjs/common';

import { EmailModuleLocal } from '../email-local/email-local.module';

import { TestingService } from './application/testing.service';
import { TestingController } from './controllers/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({
  imports: [
    // EmailModule,
    EmailModuleLocal,
    // rabbitMQModule,
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
