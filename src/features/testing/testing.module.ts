import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/schemas/comments.schema';
import { rabbitMQModule } from '../email/constants';
import { EmailModule } from '../email/email.module';
import { Like } from '../likes/domain/entity/like.entity';
import { Limit, LimitSchema } from '../limits/domain/schemas/limits.schema';
import { Post, PostSchema } from '../posts/domain/schemas/posts.schema';
import {
  Security,
  SecuritySchema,
} from '../security/domain/schemas/security.schema';
import { User, UserSchema } from '../users/domain/schemas/users.schema';

import { TestingController } from './api/testing.controller';
import { TestingService } from './application/testing.service';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({
  imports: [
    EmailModule,
    TypeOrmModule.forFeature([Like]),

    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Limit.name, schema: LimitSchema }]),
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
    rabbitMQModule,
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
