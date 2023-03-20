import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { EmailTemplateManager } from '../email-template-manager';
import { EmailService } from '../email.service';

export interface ISendRecoveryPasswordTempCodeCommand {
  email: string;
  userName: string;
  recoveryCode: string;
}

export class SendRecoveryPasswordTempCodeCommand
  implements ISendRecoveryPasswordTempCodeCommand
{
  constructor(
    public readonly email: string,
    public readonly userName: string,
    public readonly recoveryCode: string,
  ) {}
}

@CommandHandler(SendRecoveryPasswordTempCodeCommand)
export class SendRecoveryPasswordTempCodeHandler
  implements ICommandHandler<SendRecoveryPasswordTempCodeCommand>
{
  constructor(
    private readonly emailTemplateManager: EmailTemplateManager,
    private readonly emailService: EmailService,
  ) {}

  async execute({
    email,
    userName,
    recoveryCode,
  }: SendRecoveryPasswordTempCodeCommand): Promise<boolean> {
    const emailTemplate = this.emailTemplateManager.getRecoveryPasswordMessage({
      userName,
      recoveryCode,
    });

    await this.emailService.sendEmail(
      email,
      'Password recovery',
      emailTemplate,
    );
    return true;
  }
}
