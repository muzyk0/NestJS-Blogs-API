import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { BansRepositorySql } from '../bans/infrastructure/bans.repository.sql';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { CommandHandlers } from './application/use-cases';
import { User } from './domain/entities/user.entity';
import {
  IUsersQueryRepository,
  UsersQueryRepository,
} from './infrastructure/users.query.repository.sql';
import { UsersRepository } from './infrastructure/users.repository.sql';

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
    ...CommandHandlers,
    UsersRepository,
    // UsersQueryRepository,
    { provide: IUsersQueryRepository, useClass: UsersQueryRepository },
    BansRepositorySql,
  ],
  exports: [
    ...CommandHandlers,
    UsersRepository,
    { provide: IUsersQueryRepository, useClass: UsersQueryRepository },
  ],
})
export class UsersModule {}
