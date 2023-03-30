import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogExistsRule } from '../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../shared/decorators/validations/check-is-user-exist.decorator';
import { AuthModule } from '../auth/auth.module';
import {
  BloggersBanUsersRepository,
  IBloggersBanUsersRepository,
} from '../bans/infrastructure/bloggers-ban-users.repository';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import { CommandHandlers } from './application/use-cases';
import { BloggerController } from './controllers/blogger.controller';
import { BlogsController } from './controllers/blogs.controller';
import { Blog } from './domain/entities/blog.entity';
import {
  BlogsQueryRepository,
  IBlogsQueryRepository,
} from './infrastructure/blogs.query.sql.repository';
import {
  BlogsRepository,
  IBlogsRepository,
} from './infrastructure/blogs.sql.repository';

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    PostsModule,
    UsersModule,

    TypeOrmModule.forFeature([Blog]),
  ],
  controllers: [BlogsController, BloggerController],
  providers: [
    ...CommandHandlers,
    { provide: IBlogsQueryRepository, useClass: BlogsQueryRepository },
    { provide: IBlogsRepository, useClass: BlogsRepository },
    BlogExistsRule,
    IsUserAlreadyExistConstraint,
    {
      provide: IBloggersBanUsersRepository,
      useClass: BloggersBanUsersRepository,
    },
  ],
  exports: [
    ...CommandHandlers,
    { provide: IBlogsQueryRepository, useClass: BlogsQueryRepository },
    { provide: IBlogsRepository, useClass: BlogsRepository },
    BlogExistsRule,
    IsUserAlreadyExistConstraint,
  ],
})
export class BlogsModule {}
