import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import {
  BlogsRepository,
  IBlogsRepository,
} from '../blogs/infrastructure/blogs.sql.repository';
import { LikesModule } from '../likes/likes.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import {
  CommentsService,
  ICommentsRepository,
} from './application/comments.service';
import { GetPostCommentsInsideCurrentUserBlogsHandler } from './application/use-cases/get-post-comments-inside-current-user-blogs.handler';
import { CommentsController } from './controllers/comments.controller';
import { Comment } from './domain/entities/comment.entity';
import {
  CommentsQueryRepository,
  ICommentsQueryRepository,
} from './infrastructure/comments.query.sql.repository';
import { CommentsRepository } from './infrastructure/comments.sql.repository';

const CommandHandlers = [GetPostCommentsInsideCurrentUserBlogsHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    LikesModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [
    { provide: IBlogsRepository, useClass: BlogsRepository },
    ...CommandHandlers,
    CommentsService,
    { provide: ICommentsRepository, useClass: CommentsRepository },
    { provide: ICommentsQueryRepository, useClass: CommentsQueryRepository },
  ],
})
export class CommentsModule {}
