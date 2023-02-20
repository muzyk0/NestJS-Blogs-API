import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogExistsRule } from '../../common/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../common/decorators/validations/check-is-user-exist.decorator';
import { AuthModule } from '../auth/auth.module';
import { UpdateBanUserForBlogHandler } from '../bans/application/use-cases/update-ban-user-for-blog.handler';
import { BansRepositorySql } from '../bans/infrastructure/bans.repository.sql';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

import { BloggerController } from './api/blogger.controller';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './application/blogs.service';
import { BindBlogOnUserHandler } from './application/use-cases/bind-blog-on-user.handler';
import { GetBlogsHandler } from './application/use-cases/get-blogs.handler';
import { Blog, BlogSchema } from './domain/schemas/blogs.schema';
import { BlogsQueryRepository } from './infrastructure/blogs.query.repository';
import { BlogsRepository } from './infrastructure/blogs.repository';

const CommandHandlers = [
  GetBlogsHandler,
  BindBlogOnUserHandler,
  UpdateBanUserForBlogHandler,
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    AuthModule,
    PostsModule,
    UsersModule,
  ],
  controllers: [BlogsController, BloggerController],
  providers: [
    ...CommandHandlers,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogExistsRule,
    IsUserAlreadyExistConstraint,
    BansRepositorySql,
  ],
  exports: [
    ...CommandHandlers,
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    BlogExistsRule,
    IsUserAlreadyExistConstraint,
  ],
})
export class BlogsModule {}
