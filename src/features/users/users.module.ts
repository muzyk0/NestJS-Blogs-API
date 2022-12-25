import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';

import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersQueryRepository } from './users.query.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
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
