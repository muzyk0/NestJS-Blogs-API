import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PasswordRecoveryService } from './application/password-recovery.service';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './domain/schemas/recovery-password.schema';
import { RecoveryPasswordRepository } from './infrastructure/recovery-password.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PasswordRecovery.name, schema: PasswordRecoverySchema },
    ]),
  ],
  controllers: [],
  providers: [PasswordRecoveryService, RecoveryPasswordRepository],
  exports: [PasswordRecoveryService, RecoveryPasswordRepository],
})
export class PasswordRecoveryModule {}
