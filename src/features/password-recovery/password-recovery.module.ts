import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PasswordRecoveryService } from './password-recovery.service';
import { RecoveryPasswordRepository } from './recovery-password.repository';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './schemas/recovery-password.schema';

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
