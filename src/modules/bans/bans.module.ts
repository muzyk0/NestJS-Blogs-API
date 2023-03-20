import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogExistsRule } from '../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../shared/decorators/validations/check-is-user-exist.decorator';
import { BlogsModule } from '../blogs/blogs.module';

import { UpdateBanUserForBlogHandler } from './application/use-cases/update-ban-user-for-blog.handler';
import { Bans } from './domain/entity/bans.entity';
import { BloggerBanUser } from './domain/entity/blogger-ban-user';
import {
  BloggersBanUsersRepository,
  IBloggersBanUsersRepository,
} from './infrastructure/bloggers-ban-users-repository.service';

const CommandHandlers = [UpdateBanUserForBlogHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BloggerBanUser, Bans]),
    BlogsModule,
  ],
  controllers: [],
  providers: [
    IsUserAlreadyExistConstraint,
    BlogExistsRule,
    ...CommandHandlers,
    {
      provide: IBloggersBanUsersRepository,
      useClass: BloggersBanUsersRepository,
    },
  ],
  exports: [
    ...CommandHandlers,
    {
      provide: IBloggersBanUsersRepository,
      useClass: BloggersBanUsersRepository,
    },
  ],
})
export class BansModule {}
