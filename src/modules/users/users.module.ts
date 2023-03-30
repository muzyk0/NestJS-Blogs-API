import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailNotExistRule } from '../../shared/decorators/validations/check-is-email-exist.decorator';
import { LoginNotExistRule } from '../../shared/decorators/validations/check-is-login-exist.decorator';
import { AuthModule } from '../auth/auth.module';
import {
  BloggersBanUsersRepository,
  IBloggersBanUsersRepository,
} from '../bans/infrastructure/bloggers-ban-users.repository';
import {
  IUserBanRepository,
  UserBanRepository,
} from '../bans/infrastructure/user-bans.repository';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { CommandHandlers } from './application/use-cases/command-handlers';
import { User } from './domain/entities/user.entity';
import {
  IUsersQueryRepository,
  UsersQueryRepository,
} from './infrastructure/users.query.repository.sql';
import {
  IUsersRepository,
  UsersRepository,
} from './infrastructure/users.repository.sql';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([User]),
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
    UsersRepository,
    { provide: IUsersRepository, useClass: UsersRepository },
    { provide: IUsersQueryRepository, useClass: UsersQueryRepository },
    {
      provide: IBloggersBanUsersRepository,
      useClass: BloggersBanUsersRepository,
    },
    {
      provide: IUserBanRepository,
      useClass: UserBanRepository,
    },
  ],
  exports: [
    ...CommandHandlers,
    { provide: IUsersRepository, useClass: UsersRepository },
    { provide: IUsersQueryRepository, useClass: UsersQueryRepository },
  ],
})
export class UsersModule {}
