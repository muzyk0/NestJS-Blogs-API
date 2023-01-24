import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailServiceLocal } from '../../../email-local/application/email-local.service';
import { PasswordRecoveryService } from '../../../password-recovery/application/password-recovery.service';
import { PasswordRecoveryDocument } from '../../../password-recovery/domain/schemas/recovery-password.schema';
import { UsersService } from '../../../users/application/users.service';

export class SendRecoveryPasswordTempCodeCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(SendRecoveryPasswordTempCodeCommand)
export class SendRecoveryPasswordTempCodeHandler
  implements ICommandHandler<SendRecoveryPasswordTempCodeCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly recoveryPasswordService: PasswordRecoveryService,
    private readonly emailService: EmailServiceLocal,
  ) {}

  async execute({
    email,
  }: SendRecoveryPasswordTempCodeCommand): Promise<boolean> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      return false;
    }

    const passwordRecovery: PasswordRecoveryDocument =
      await this.recoveryPasswordService.addPasswordRecovery(
        user.accountData.id,
      );

    await this.emailService.SendRecoveryPasswordTempCode({
      email: email,
      userName: user.accountData.login,
      recoveryCode: passwordRecovery.code,
    });

    return true;
  }
}
