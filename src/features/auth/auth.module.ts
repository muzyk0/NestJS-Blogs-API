import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { EmailModuleLocal } from '../email-local/email-local.module';
import { LimitsModule } from '../limits/limits.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import {
  Security,
  SecuritySchema,
} from '../security/domain/schemas/security.schema';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtService } from './application/jwt.service';
import { BaseAuthHandler } from './application/use-cases/base-auth.handler';
import { ConfirmAccountHandler } from './application/use-cases/confirm-account.handler';
import { ConfirmPasswordRecoveryHandler } from './application/use-cases/confirm-password-recovery.handler';
import { LoginHandler } from './application/use-cases/login.handler';
import { ResendConfirmationCodeHandler } from './application/use-cases/resend-confirmation-code.handler';
import { SendRecoveryPasswordTempCodeHandler } from './application/use-cases/send-recovery-password-temp-code.handler';
import { ValidateUserHandler } from './application/use-cases/validate-user.handler';
import { AtJwtStrategy } from './strategies/at.jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RtJwtStrategy } from './strategies/rt.jwt.strategy';

const Strategies = [LocalStrategy, AtJwtStrategy, RtJwtStrategy];
const CommandHandlers = [
  ConfirmPasswordRecoveryHandler,
  LoginHandler,
  SendRecoveryPasswordTempCodeHandler,
  ConfirmAccountHandler,
  BaseAuthHandler,
  ConfirmPasswordRecoveryHandler,
  ResendConfirmationCodeHandler,
  ValidateUserHandler,
];
const Providers = [AuthService, JwtService];

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({}),
    // EmailModule,
    EmailModuleLocal,
    UsersModule,
    PassportModule,
    LimitsModule,
    SecurityModule,
    PasswordRecoveryModule,
    MongooseModule.forFeature([
      { name: Security.name, schema: SecuritySchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [...Providers, ...Strategies, ...CommandHandlers],
  exports: [...Providers, ...Strategies, ...CommandHandlers],
})
export class AuthModule {}
