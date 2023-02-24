import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/schemas/comments.schema';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { Like } from '../likes/domain/entity/like.entity';
import { Post, PostSchema } from '../posts/domain/schemas/posts.schema';

import { TestingService } from './application/testing.service';
import { TestingController } from './controllers/testing.controller';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({
  imports: [
    // EmailModule,
    EmailModuleLocal,
    TypeOrmModule.forFeature([Like]),

    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    // rabbitMQModule,
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
