import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import {
  BlogsRepository,
  IBlogsRepository,
} from '../blogs/infrastructure/blogs.sql.repository';
import { LikesModule } from '../likes/likes.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import { CommentsService } from './application/comments.service';
import { GetPostCommentsInsideCurrentUserBlogsHandler } from './application/use-cases/get-post-comments-inside-current-user-blogs.handler';
import { CommentsController } from './controllers/comments.controller';
import { Comment, CommentSchema } from './domain/schemas/comments.schema';
import { CommentsQueryRepository } from './infrastructure/comments.query.repository';
import { CommentsRepository } from './infrastructure/comments.repository';

const CommandHandlers = [GetPostCommentsInsideCurrentUserBlogsHandler];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
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
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class CommentsModule {}
