import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogExistsRule } from '../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../shared/decorators/validations/check-is-user-exist.decorator';
import { BlogsModule } from '../blogs/blogs.module';

import { UpdateBanUserForBlogHandler } from './application/use-cases/update-ban-user-for-blog.handler';
import { Bans } from './domain/entity/bans.entity';
import { BlogsBans } from './domain/entity/blogger-bans.entity';
import {
  BloggerBansRepositorySql,
  IBloggerBansRepositorySql,
} from './infrastructure/blogger-bans.repository.sql';

const CommandHandlers = [UpdateBanUserForBlogHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BlogsBans, Bans]),
    BlogsModule,
  ],
  controllers: [],
  providers: [
    IsUserAlreadyExistConstraint,
    BlogExistsRule,
    ...CommandHandlers,
    { provide: IBloggerBansRepositorySql, useClass: BloggerBansRepositorySql },
  ],
  exports: [
    ...CommandHandlers,
    { provide: IBloggerBansRepositorySql, useClass: BloggerBansRepositorySql },
  ],
})
export class BansModule {}
