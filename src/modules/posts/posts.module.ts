import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { BansService } from '../bans/application/bans.service';
import { BansRepositorySql } from '../bans/infrastructure/bans.repository.sql';
import { BlogsService } from '../blogs/application/blogs.service';
import { Blog, BlogSchema } from '../blogs/domain/schemas/blogs.schema';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { CommentsService } from '../comments/application/comments.service';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/schemas/comments.schema';
import { CommentsQueryRepository } from '../comments/infrastructure/comments.query.repository';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { LikesModule } from '../likes/likes.module';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';

import { PostsService } from './application/posts.service';
import { PostsController } from './controllers/posts.controller';
import { Post, PostSchema } from './domain/schemas/posts.schema';
import { PostsQueryRepository } from './infrastructure/posts.query.repository';
import { PostsRepository } from './infrastructure/posts.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    AuthModule,
    SecurityModule,
    LikesModule,
    UsersModule,
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
    BansService,
    BansRepositorySql,
  ],
  exports: [PostsService, PostsRepository, PostsQueryRepository],
})
export class PostsModule {}
