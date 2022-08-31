import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { Limit, LimitSchema } from '../limits/schemas/limits.schema';
import { Post, PostSchema } from '../posts/schemas/posts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';

import { TestingController } from './testing.controller';
import { TestingRepository } from './testing.repository';
import { TestingService } from './testing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Limit.name, schema: LimitSchema }]),
  ],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
})
export class TestingModule {}
