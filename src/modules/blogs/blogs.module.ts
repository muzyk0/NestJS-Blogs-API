import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogExistsRule } from '../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../shared/decorators/validations/check-is-user-exist.decorator';
import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';
import { AuthModule } from '../auth/auth.module';
import { IBloggersBanUsersRepository } from '../bans/application/interfaces/bloggers-ban-users.abstract-class';
import { BloggerBanUser } from '../bans/domain/entity/blogger-ban-user.entity';
import { BloggersBanUsersRepository } from '../bans/infrastructure/bloggers-ban-users.repository';
import { BloggersBanUsersSqlRepository } from '../bans/infrastructure/bloggers-ban-users.sql.repository';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import { CommandHandlers } from './application/use-cases';
import { BloggerController } from './controllers/blogger.controller';
import { BlogsController } from './controllers/blogs.controller';
import { Blog } from './domain/entities/blog.entity';
import {
  BlogsQuerySqlRepository,
  BlogsSqlRepository,
  IBlogsQueryRepository,
  IBlogsRepository,
} from './infrastructure';
import { BlogsQueryRepository } from './infrastructure/blogs.query.repository';
import { BlogsRepository } from './infrastructure/blogs.repository';

const RepositoryProviders = [
  {
    provide: IBlogsQueryRepository,
    useClass: getRepositoryModule(
      BlogsQueryRepository,
      BlogsQuerySqlRepository,
    ),
  },
  {
    provide: IBlogsRepository,
    useClass: getRepositoryModule(BlogsRepository, BlogsSqlRepository),
  },
];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    PostsModule,
    UsersModule,

    TypeOrmModule.forFeature([Blog, BloggerBanUser]),
  ],
  controllers: [BlogsController, BloggerController],
  providers: [
    ...CommandHandlers,
    ...RepositoryProviders,
    BlogExistsRule,
    IsUserAlreadyExistConstraint,
    {
      provide: IBloggersBanUsersRepository,
      useClass: getRepositoryModule(
        BloggersBanUsersRepository,
        BloggersBanUsersSqlRepository,
      ),
    },
  ],
  exports: [...CommandHandlers, ...RepositoryProviders],
})
export class BlogsModule {}
