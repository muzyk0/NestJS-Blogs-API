import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { LikesModule } from '../likes/likes.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import { ICommentsRepository } from './application/interfaces/comment-repository.abstract-class';
import { CommandHandlers } from './application/use-cases';
import { CommentsController } from './controllers/comments.controller';
import { Comment } from './domain/entities/comment.entity';
import {
  CommentsQueryRepository,
  ICommentsQueryRepository,
} from './infrastructure/comments.query.sql.repository';
import { CommentsRepository } from './infrastructure/comments.sql.repository';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Comment]),
    LikesModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [
    ...CommandHandlers,
    { provide: ICommentsRepository, useClass: CommentsRepository },
    { provide: ICommentsQueryRepository, useClass: CommentsQueryRepository },
  ],
  exports: [...CommandHandlers],
})
export class CommentsModule {}
