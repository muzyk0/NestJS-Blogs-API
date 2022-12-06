import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { BlogsRepository } from '../blogs/blogs.repository';
import { BlogsService } from '../blogs/blogs.service';
import { Blog, BlogSchema } from '../blogs/schemas/blogs.schema';
import { CommentsQueryRepository } from '../comments/comments.query.repository';
import { CommentsRepository } from '../comments/comments.repository';
import { CommentsService } from '../comments/comments.service';
import { Comment, CommentSchema } from '../comments/schemas/comments.schema';
import { Security, SecuritySchema } from '../security/schemas/security.schema';
import { SecurityModule } from '../security/security.module';

import { PostsController } from './posts.controller';
import { PostsQueryRepository } from './posts.query.repository';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
    AuthModule,
    SecurityModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    PostsQueryRepository,
    BlogsRepository,
    BlogsService,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
  exports: [PostsService, PostsRepository, PostsQueryRepository],
})
export class PostsModule {}
