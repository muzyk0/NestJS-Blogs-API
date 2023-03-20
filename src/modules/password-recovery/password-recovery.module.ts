import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PasswordRecoveryService } from './application/password-recovery.service';
import { PasswordRecoveryAttempt } from './domain/entities/password-recovery.entity';
import {
  IRecoveryPasswordRepository,
  RecoveryPasswordRepository,
} from './infrastructure/recovery-password.sql.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordRecoveryAttempt])],
  controllers: [],
  providers: [
    PasswordRecoveryService,
    {
      provide: IRecoveryPasswordRepository,
      useClass: RecoveryPasswordRepository,
    },
  ],
  exports: [
    PasswordRecoveryService,
    {
      provide: IRecoveryPasswordRepository,
      useClass: RecoveryPasswordRepository,
    },
  ],
})
export class PasswordRecoveryModule {}
