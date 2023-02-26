import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Comment,
  CommentSchema,
} from '../comments/domain/schemas/comments.schema';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { Like } from '../likes/domain/entity/like.entity';

import { TestingService } from './application/testing.service';
import { TestingController } from './controllers/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({
  imports: [
    // EmailModule,
    EmailModuleLocal,
    TypeOrmModule.forFeature([Like]),

    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    // rabbitMQModule,
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
