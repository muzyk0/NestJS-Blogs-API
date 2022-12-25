import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { RecoveryPasswordRepository } from '../infrastructure/recovery-password.repository';

import { CreateRecoveryPasswordDto } from './dto/create-recovery-password.dto';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly recoveryPasswordRepository: RecoveryPasswordRepository,
  ) {}

  async addPasswordRecovery(userId: string) {
    const passwordRecovery: CreateRecoveryPasswordDto = {
      code: v4(),
      createdAt: new Date(),
      isValid: true,
    };

    return this.recoveryPasswordRepository.addPasswordRecovery(
      userId,
      passwordRecovery,
    );
  }

  async findByRecoveryCode(recoveryCode: string) {
    return this.recoveryPasswordRepository.findByRecoveryCode(recoveryCode);
  }

  async confirmPasswordRecovery(recoveryCode: string) {
    return this.recoveryPasswordRepository.confirmPasswordRecovery(
      recoveryCode,
    );
  }
}