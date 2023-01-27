import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { UsersController } from './api/users.controller';
import { GetUsersHandler } from './application/use-cases/get-users.handler';
import { RemoveUserHandler } from './application/use-cases/remove-user.handler';
import { UsersService } from './application/users.service';
import { User, UserSchema } from './domain/schemas/users.schema';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { UsersRepository } from './infrastructure/users.repository';

const CommandHandlers = [GetUsersHandler, RemoveUserHandler];

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
  providers: [
    ...CommandHandlers,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
  exports: [
    ...CommandHandlers,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
  ],
})
export class UsersModule {}
