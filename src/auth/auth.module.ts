import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { EmailModule } from '../email/email.module';
import { LimitsModule } from '../limits/limits.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtJwtStrategy } from './strategies/at.jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    EmailModule,
    UsersModule,
    PassportModule,
    LimitsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, AtJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
