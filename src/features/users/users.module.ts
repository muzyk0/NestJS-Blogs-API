import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { User, UserSchema } from './domain/schemas/users.schema';
import { UsersQueryRepository } from './infrastructure/users.query.repository';
import { UsersRepository } from './infrastructure/users.repository';

@Module({
  imports: [
    CqrsModule,
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule,
    SecurityModule,
    PasswordRecoveryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
