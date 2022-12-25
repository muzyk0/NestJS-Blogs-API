import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from '../email/email.module';
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
import { AtJwtStrategy } from './strategies/at.jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RtJwtStrategy } from './strategies/rt.jwt.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    EmailModule,
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
  providers: [AuthService, LocalStrategy, AtJwtStrategy, RtJwtStrategy],
  exports: [
    AuthService,
    LocalStrategy,
    AtJwtStrategy,
    RtJwtStrategy,
    JwtModule.register({}),
  ],
})
export class AuthModule {}
