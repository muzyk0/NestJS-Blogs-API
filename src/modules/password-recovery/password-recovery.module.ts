import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { getRepositoryModule } from '../../shared/utils/get-repository.module-loader';

import { IRecoveryPasswordRepository } from './application/interfaces/recovery-password.abstract';
import { PasswordRecoveryService } from './application/password-recovery.service';
import { PasswordRecoveryAttempt } from './domain/entities/password-recovery.entity';
import { RecoveryPasswordRepository } from './infrastructure/recovery-password.repository';
import { RecoveryPasswordSqlRepository } from './infrastructure/recovery-password.sql.repository';

const Providers = [
  PasswordRecoveryService,
  {
    provide: IRecoveryPasswordRepository,
    useClass: getRepositoryModule(
      RecoveryPasswordRepository,
      RecoveryPasswordSqlRepository,
    ),
  },
];

@Module({
  imports: [TypeOrmModule.forFeature([PasswordRecoveryAttempt])],
  controllers: [],
  providers: Providers,
  exports: Providers,
})
export class PasswordRecoveryModule {}
