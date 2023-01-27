import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { UsersController } from './api/users.controller';
import { BanUnbanUserHandler } from './application/use-cases/ban-unban-user.handler';
import { CreateUserHandler } from './application/use-cases/create-user.handler';
import { GetUsersHandler } from './application/use-cases/get-users.handler';
import { RemoveUserHandler } from './application/use-cases/remove-user.handler';
import { User, UserSchema } from './domain/schemas/users.schema';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { UsersRepository } from './infrastructure/users.repository';

const CommandHandlers = [
  GetUsersHandler,
  RemoveUserHandler,
  CreateUserHandler,
  BanUnbanUserHandler,
];

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // EmailModule,
    EmailModuleLocal,
    SecurityModule,
    PasswordRecoveryModule,
  ],
  controllers: [UsersController],
  providers: [...CommandHandlers, UsersRepository, UsersQueryRepository],
  exports: [...CommandHandlers, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
