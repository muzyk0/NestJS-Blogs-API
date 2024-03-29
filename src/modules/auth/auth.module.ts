import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';
import { EmailModuleLocal } from '../email-local/email-local.module';
import { LimitsModule } from '../limits/limits.module';
import { PasswordRecoveryModule } from '../password-recovery/password-recovery.module';
import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';

import { CryptService } from './application/crypt.service';
import { JwtService } from './application/jwt.service';
import { IRevokeTokenRepository } from './application/revoke-token.abstract-class';
import { CommandHandlers } from './application/use-cases/command-handlers';
import { AuthController } from './controllers/auth.controller';
import { RevokeToken } from './domain/entities/revoked-token.entity';
import { RevokeTokenRepository } from './infrastructure/revoke-token.repository';
import { RevokeTokenSqlRepository } from './infrastructure/revoke-token.repository.sql';
import { AtJwtStrategy } from './strategies/at.jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RtJwtStrategy } from './strategies/rt.jwt.strategy';

const Strategies = [LocalStrategy, AtJwtStrategy, RtJwtStrategy];

const Providers: Provider<any>[] = [
  CryptService,
  JwtService,
  {
    provide: IRevokeTokenRepository,
    useClass: getRepositoryModule(
      RevokeTokenRepository,
      RevokeTokenSqlRepository,
    ),
  },
];

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
    TypeOrmModule.forFeature([RevokeToken]),
  ],
  controllers: [AuthController],
  providers: [...Providers, ...Strategies, ...CommandHandlers],
  exports: [...Providers, ...Strategies, ...CommandHandlers],
})
export class AuthModule {}
