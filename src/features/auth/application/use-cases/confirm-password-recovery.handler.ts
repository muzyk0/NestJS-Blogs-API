import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

import { PasswordRecoveryService } from '../../../password-recovery/application/password-recovery.service';
import { UsersRepository } from '../../../users/infrastructure/users.repository.sql';

export class ConfirmPasswordRecoveryCommand {
  constructor(
    public readonly recoveryCode: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(ConfirmPasswordRecoveryCommand)
export class ConfirmPasswordRecoveryHandler
  implements ICommandHandler<ConfirmPasswordRecoveryCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

  async execute({ recoveryCode, newPassword }: ConfirmPasswordRecoveryCommand) {
    const recovery = await this.passwordRecoveryService.findByRecoveryCode(
      recoveryCode,
    );

    if (!recovery) {
      throw new BadRequestException([
        {
          message: 'Recovery code is incorrect or expired',
          field: 'recoveryCode',
        },
      ]);
    }

    const isConfirm =
      await this.passwordRecoveryService.confirmPasswordRecovery(recoveryCode);

    if (isConfirm) {
      await this.updateUserPassword(recovery.userId, newPassword);
    }
  }

  private async updateUserPassword(userId: string, newPassword: string) {
    const password = await this.generateHashPassword(newPassword);

    await this.usersRepository.updateUserPassword({
      id: userId,
      password,
    });
  }

  async generateHashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
