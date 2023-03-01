import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { BansService } from '../bans/application/bans.service';
import { BansRepositorySql } from '../bans/infrastructure/bans.repository.sql';
import { BlogsService } from '../blogs/application/blogs.service';
import {
  BlogsRepository,
  IBlogsRepository,
} from '../blogs/infrastructure/blogs.sql.repository';
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
import { Post } from './domain/entities/post.entity';
import {
  IPostsQueryRepository,
  PostsQueryRepository,
} from './infrastructure/posts.query.sql.repository';
import {
  IPostsRepository,
  PostsRepository,
} from './infrastructure/posts.sql.repository';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    AuthModule,
    SecurityModule,
    LikesModule,
    UsersModule,
    TypeOrmModule.forFeature([Post]),
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    { provide: IPostsRepository, useClass: PostsRepository },
    { provide: IPostsQueryRepository, useClass: PostsQueryRepository },
    { provide: IBlogsRepository, useClass: BlogsRepository },
    BlogsService,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    BansService,
    BansRepositorySql,
  ],
  exports: [
    PostsService,
    { provide: IPostsRepository, useClass: PostsRepository },
    { provide: IPostsQueryRepository, useClass: PostsQueryRepository },
  ],
})
export class PostsModule {}
