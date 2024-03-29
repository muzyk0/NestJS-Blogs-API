import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailNotExistRule } from '../../shared/decorators/validations/check-is-email-exist.decorator';
import { LoginNotExistRule } from '../../shared/decorators/validations/check-is-login-exist.decorator';
import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';
import { AuthModule } from '../auth/auth.module';
import { IBloggersBanUsersRepository } from '../bans/application/interfaces/bloggers-ban-users.abstract-class';
import { IUserBanRepository } from '../bans/application/interfaces/user-ban.abstract-class';
import { Bans } from '../bans/domain/entity/bans.entity';
import { BloggerBanUser } from '../bans/domain/entity/blogger-ban-user.entity';
import { BloggersBanUsersRepository } from '../bans/infrastructure/bloggers-ban-users.repository';
import { BloggersBanUsersSqlRepository } from '../bans/infrastructure/bloggers-ban-users.sql.repository';
import { UserBanRepository } from '../bans/infrastructure/user-bans.repository';
import { UserBanSqlRepository } from '../bans/infrastructure/user-bans.sql.repository';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { IUsersRepository } from './application/application/users-repository.abstract-class';
import { CommandHandlers } from './application/use-cases';
import { IUsersQueryRepository } from './controllers/interfaces/users-query-repository.abstract-class';
import { User } from './domain/entities/user.entity';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { UsersQuerySqlRepository } from './infrastructure/users.query.repository.sql';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersSqlRepository } from './infrastructure/users.repository.sql';

const RepositoryProvider = [
  {
    provide: IUsersRepository,
    useClass: getRepositoryModule(UsersRepository, UsersSqlRepository),
  },
  {
    provide: IUsersQueryRepository,
    useClass: getRepositoryModule(
      UsersQueryRepository,
      UsersQuerySqlRepository,
    ),
  },
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User, BloggerBanUser, Bans]),
    // EmailModule,
    EmailModuleLocal,
    SecurityModule,
    PasswordRecoveryModule,
  ],
  controllers: [],
  providers: [
    EmailNotExistRule,
    LoginNotExistRule,
    ...CommandHandlers,
    ...RepositoryProvider,
    UsersSqlRepository,
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
  ],
  exports: [...CommandHandlers, ...RepositoryProvider],
})
export class UsersModule {}
