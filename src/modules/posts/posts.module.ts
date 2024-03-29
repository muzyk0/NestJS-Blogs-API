import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';
import { AuthModule } from '../auth/auth.module';
import { IBloggersBanUsersRepository } from '../bans/application/interfaces/bloggers-ban-users.abstract-class';
import { BloggerBanUser } from '../bans/domain/entity/blogger-ban-user.entity';
import { BloggersBanUsersRepository } from '../bans/infrastructure/bloggers-ban-users.repository';
import { BloggersBanUsersSqlRepository } from '../bans/infrastructure/bloggers-ban-users.sql.repository';
import { BlogsModule } from '../blogs/blogs.module';
import { Blog } from '../blogs/domain/entities/blog.entity';
import { BlogsSqlRepository, IBlogsRepository } from '../blogs/infrastructure';
import { BlogsRepository } from '../blogs/infrastructure/blogs.repository';
import { ICommentsRepository } from '../comments/application/interfaces/comment-repository.abstract-class';
import { CommentsModule } from '../comments/comments.module';
import { ICommentsQueryRepository } from '../comments/controllers/interfaces/comments-query-repository.abstract-class';
import { Comment } from '../comments/domain/entities/comment.entity';
import { CommentsQueryRepository } from '../comments/infrastructure/comments.query.sql.repository';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { CommentsSqlRepository } from '../comments/infrastructure/comments.sql.repository';
import { LikesModule } from '../likes/likes.module';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';

import { IPostsRepository } from './application/interfaces/posts-repository.abstract-class';
import { CommandHandlers } from './application/use-cases';
import { PostsController } from './controllers/posts.controller';
import { Post } from './domain/entities/post.entity';
import {
  IPostsQueryRepository,
  PostsQueryRepository,
} from './infrastructure/posts.query.sql.repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsSqlRepository } from './infrastructure/posts.sql.repository';

const Providers = [
  {
    provide: IPostsRepository,
    useClass: getRepositoryModule(PostsRepository, PostsSqlRepository),
  },
  { provide: IPostsQueryRepository, useClass: PostsQueryRepository },
];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    SecurityModule,
    LikesModule,
    UsersModule,
    TypeOrmModule.forFeature([Post, BloggerBanUser, Blog, Comment]),
  ],
  controllers: [PostsController],
  providers: [
    ...CommandHandlers,
    ...Providers,
    {
      provide: IBlogsRepository,
      useClass: getRepositoryModule(BlogsRepository, BlogsSqlRepository),
    },
    {
      provide: ICommentsRepository,
      useClass: getRepositoryModule(CommentsRepository, CommentsSqlRepository),
    },
    { provide: ICommentsQueryRepository, useClass: CommentsQueryRepository },
    {
      provide: IBloggersBanUsersRepository,
      useClass: getRepositoryModule(
        BloggersBanUsersRepository,
        BloggersBanUsersSqlRepository,
      ),
    },
  ],
  exports: [...CommandHandlers, ...Providers],
})
export class PostsModule {}
