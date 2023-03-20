import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogExistsRule } from '../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../shared/decorators/validations/check-is-user-exist.decorator';
import { AuthModule } from '../auth/auth.module';
import { UpdateBanUserForBlogHandler } from '../bans/application/use-cases/update-ban-user-for-blog.handler';
import {
  BloggersBanUsersRepository,
  IBloggersBanUsersRepository,
} from '../bans/infrastructure/bloggers-ban-users.repository.';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import { BlogsService } from './application/blogs.service';
import { BindBlogOnUserHandler } from './application/use-cases/bind-blog-on-user.handler';
import { GetBlogsForAdminHandler } from './application/use-cases/get-blogs-for-admin.handler';
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

const CommandHandlers = [
  GetBlogsForAdminHandler,
  BindBlogOnUserHandler,
  UpdateBanUserForBlogHandler,
];

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
    BlogsService,
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
    BlogsService,
    { provide: IBlogsQueryRepository, useClass: BlogsQueryRepository },
    { provide: IBlogsRepository, useClass: BlogsRepository },
    BlogExistsRule,
    IsUserAlreadyExistConstraint,
  ],
})
export class BlogsModule {}
