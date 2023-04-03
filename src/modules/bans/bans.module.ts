import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogExistsRule } from '../../shared/decorators/validations/check-blogId-if-exist.decorator';
import { IsUserAlreadyExistConstraint } from '../../shared/decorators/validations/check-is-user-exist.decorator';
import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';
import { BlogsModule } from '../blogs/blogs.module';
import { UsersModule } from '../users/users.module';

import { IBloggersBanUsersRepository } from './application/interfaces/bloggers-ban-users.abstract-class';
import { IUserBanRepository } from './application/interfaces/user-ban.abstract-class';
import { UpdateBanUserForBlogHandler } from './application/use-cases/update-ban-user-for-blog.handler';
import { Bans } from './domain/entity/bans.entity';
import { BloggerBanUser } from './domain/entity/blogger-ban-user.entity';
import { BloggersBanUsersRepository } from './infrastructure/bloggers-ban-users.repository';
import { BloggersBanUsersSqlRepository } from './infrastructure/bloggers-ban-users.sql.repository';
import { UserBanRepository } from './infrastructure/user-bans.repository';
import { UserBanSqlRepository } from './infrastructure/user-bans.sql.repository';

const CommandHandlers = [UpdateBanUserForBlogHandler];
const RepositoryProviders = [
  {
    provide: IBloggersBanUsersRepository,
    useClass: getRepositoryModule(
      BloggersBanUsersRepository,
      BloggersBanUsersSqlRepository,
    ),
  },
  {
    provide: IUserBanRepository,
    useClass: getRepositoryModule(UserBanRepository, UserBanSqlRepository),
  },
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([BloggerBanUser, Bans]),
    BlogsModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    IsUserAlreadyExistConstraint,
    BlogExistsRule,
    ...CommandHandlers,
    ...RepositoryProviders,
  ],
  exports: [...CommandHandlers, ...RepositoryProviders],
})
export class BansModule {}
