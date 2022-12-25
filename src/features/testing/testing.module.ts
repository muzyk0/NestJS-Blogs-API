import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { Like } from '../likes/entity/like.entity';
import { Limit, LimitSchema } from '../limits/schemas/limits.schema';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { Security, SecuritySchema } from '../security/schemas/security.schema';
import { User, UserSchema } from '../users/schemas/users.schema';

import { TestingController } from './testing.controller';
import { TestingRepository } from './testing.repository';
import { TestingService } from './testing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),

    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Limit.name, schema: LimitSchema }]),
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
