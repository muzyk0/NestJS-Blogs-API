import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailTemplateManager } from '../../../email/application/email-template-manager';
import { EmailService } from '../../../email/application/email.service';
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
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly recoveryPasswordService: PasswordRecoveryService,
    private readonly emailTemplateManager: EmailTemplateManager,
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

    const emailTemplate = this.emailTemplateManager.getRecoveryPasswordMessage({
      userName: user.accountData.login,
      recoveryCode: passwordRecovery.code,
    });

    await this.emailService.sendEmail(
      email,
      'Password recovery',
      emailTemplate,
    );
    return true;
  }
}
