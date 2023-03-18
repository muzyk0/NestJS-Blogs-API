import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import { PasswordRecoveryService } from '../../../password-recovery/application/password-recovery.service';
import { PasswordRecoveryAttempt } from '../../../password-recovery/domain/entities/password-recovery.entity';
import { IUsersRepository } from '../../../users/infrastructure/users.repository.sql';

export class SendRecoveryPasswordTempCodeCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(SendRecoveryPasswordTempCodeCommand)
export class SendRecoveryPasswordTempCodeHandler
  implements ICommandHandler<SendRecoveryPasswordTempCodeCommand>
{
  constructor(
    private readonly usersRepository: IUsersRepository,
    private readonly recoveryPasswordService: PasswordRecoveryService,
    private readonly emailService: EmailServiceLocal,
  ) {}

  async execute({
    email,
  }: SendRecoveryPasswordTempCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findOneByEmail(email);

    if (!user) {
      return false;
    }

    const passwordRecovery: PasswordRecoveryAttempt =
      await this.recoveryPasswordService.addPasswordRecovery(user.id);

    await this.emailService.SendRecoveryPasswordTempCode({
      email: email,
      userName: user.login,
      recoveryCode: passwordRecovery.code,
    });

    return true;
  }
}
