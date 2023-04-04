import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';
import { AuthModule } from '../auth/auth.module';
import { BloggerBanUser } from '../bans/domain/entity/blogger-ban-user.entity';
import { LikesModule } from '../likes/likes.module';
import { PostsModule } from '../posts/posts.module';
import { User } from '../users/domain/entities/user.entity';
import { UsersModule } from '../users/users.module';

import { ICommentsRepository } from './application/interfaces/comment-repository.abstract-class';
import { CommandHandlers } from './application/use-cases';
import { CommentsController } from './controllers/comments.controller';
import { ICommentsQueryRepository } from './controllers/interfaces/comments-query-repository.abstract-class';
import { Comment } from './domain/entities/comment.entity';
import { CommentsQueryRepository } from './infrastructure/comments.query.sql.repository';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentsSqlRepository } from './infrastructure/comments.sql.repository';

const Providers = [
  {
    provide: ICommentsRepository,
    useClass: getRepositoryModule(CommentsRepository, CommentsSqlRepository),
  },
  { provide: ICommentsQueryRepository, useClass: CommentsQueryRepository },
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Comment, User, BloggerBanUser]),
    LikesModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [...CommandHandlers, ...Providers],
  exports: [...CommandHandlers, ...Providers],
})
export class CommentsModule {}
