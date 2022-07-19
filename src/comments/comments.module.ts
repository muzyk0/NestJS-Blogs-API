import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Blogger, BloggerSchema } from '../bloggers/schemas/bloggers.schema';
import { PostsRepository } from '../posts/posts.repository';
import { Post, PostSchema } from '../posts/schemas/posts.schema';

import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from './schemas/comments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blogger.name, schema: BloggerSchema }]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, PostsRepository],
})
export class CommentsModule {}
