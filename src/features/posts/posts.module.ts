import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
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
import {
  Security,
  SecuritySchema,
} from '../security/domain/schemas/security.schema';
import { SecurityModule } from '../security/security.module';
import { User, UserSchema } from '../users/schemas/users.schema';
import { UsersModule } from '../users/users.module';

import { PostsController } from './api/posts.controller';
import { PostsService } from './application/posts.service';
import { Post, PostSchema } from './domain/schemas/posts.schema';
import { PostsQueryRepository } from './infrastructure/posts.query.repository';
import { PostsRepository } from './infrastructure/posts.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
  ],
  exports: [PostsService, PostsRepository, PostsQueryRepository],
})
export class PostsModule {}
