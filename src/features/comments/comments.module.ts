import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import { LikesModule } from '../likes/likes.module';
import { Post, PostSchema } from '../posts/domain/schemas/posts.schema';
import { PostsRepository } from '../posts/infrastructure/posts.repository';

import { CommentsController } from './api/comments.controller';
import { CommentsService } from './application/comments.service';
import { Comment, CommentSchema } from './domain/schemas/comments.schema';
import { CommentsQueryRepository } from './infrastructure/comments.query.repository';
import { CommentsRepository } from './infrastructure/comments.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    LikesModule,
    AuthModule,
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    PostsRepository,
  ],
})
export class CommentsModule {}
